# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from bson import ObjectId, json_util
import json
from datetime import datetime
from db import guides_col, experiences_col, reviews_col, bookings_col

app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# Helper to parse MongoDB ObjectId to JSON
def parse_json(data):
    return json.loads(json_util.dumps(data))

# --- GUIDE ROUTES ---
@app.route('/api/guides', methods=['GET'])
def get_guides():
    guides = list(guides_col.find({}))
    return jsonify(parse_json(guides))

@app.route('/api/guides', methods=['POST'])
def create_guide():
    new_guide = request.get_json()
    # Add default values for new fields
    new_guide['isVerified'] = False
    new_guide['profilePictureUrl'] = "https://via.placeholder.com/150"
    new_guide['galleryUrls'] = []
    new_guide['averageRating'] = 0.0
    new_guide['availability'] = []
    guides_col.insert_one(new_guide)
    return jsonify({"status": "success", "message": "Guide created"}), 201

@app.route('/api/guides/<guide_id>', methods=['GET'])
def get_guide_profile(guide_id):
    guide = guides_col.find_one({"_id": ObjectId(guide_id)})
    if guide:
        return jsonify(parse_json(guide))
    return jsonify({"error": "Guide not found"}), 404

# --- EXPERIENCE ROUTES ---
@app.route('/api/experiences', methods=['GET'])
def get_experiences():
    experiences = list(experiences_col.find({}))
    # Populate guide name for each experience
    for exp in experiences:
        guide = guides_col.find_one({"_id": exp['guideId']})
        exp['guideName'] = guide['name'] if guide else "Unknown Guide"
    return jsonify(parse_json(experiences))

@app.route('/api/experiences', methods=['POST'])
def create_experience():
    new_exp = request.get_json()
    new_exp['guideId'] = ObjectId(new_exp['guideId'])
    new_exp['averageRating'] = 0.0
    experiences_col.insert_one(new_exp)
    return jsonify({"status": "success", "message": "Experience created"}), 201

@app.route('/api/experiences/<exp_id>', methods=['GET'])
def get_experience_details(exp_id):
    experience = experiences_col.find_one({"_id": ObjectId(exp_id)})
    if experience:
        guide = guides_col.find_one({"_id": experience['guideId']})
        experience['guideDetails'] = parse_json(guide)
        return jsonify(parse_json(experience))
    return jsonify({"error": "Experience not found"}), 404

# --- REVIEW ROUTES ---
@app.route('/api/experiences/<exp_id>/reviews', methods=['GET'])
def get_reviews(exp_id):
    reviews = list(reviews_col.find({"experienceId": ObjectId(exp_id)}).sort("createdAt", -1))
    return jsonify(parse_json(reviews))

@app.route('/api/experiences/<exp_id>/reviews', methods=['POST'])
def submit_review(exp_id):
    review_data = request.get_json()
    review_data['experienceId'] = ObjectId(exp_id)
    review_data['guideId'] = ObjectId(review_data['guideId'])
    review_data['createdAt'] = datetime.utcnow()
    
    reviews_col.insert_one(review_data)

    # --- Recalculate Average Rating ---
    # For the experience
    exp_reviews = list(reviews_col.find({"experienceId": ObjectId(exp_id)}))
    avg_exp_rating = sum(r['rating'] for r in exp_reviews) / len(exp_reviews)
    experiences_col.update_one({"_id": ObjectId(exp_id)}, {"$set": {"averageRating": avg_exp_rating}})
    
    # For the guide
    guide_id = review_data['guideId']
    guide_reviews = list(reviews_col.find({"guideId": guide_id}))
    avg_guide_rating = sum(r['rating'] for r in guide_reviews) / len(guide_reviews)
    guides_col.update_one({"_id": guide_id}, {"$set": {"averageRating": avg_guide_rating}})

    return jsonify({"status": "success", "message": "Review submitted"}), 201

# --- AI RECOMMENDER ROUTE ---
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    user_prefs = request.get_json()
    interests = user_prefs.get('interests', [])
    energy = user_prefs.get('energy', 'relaxed')

    # Simple rule-based engine
    query = {}
    if interests:
        query['category'] = {"$in": interests}
    if energy == 'relaxed':
        query['duration'] = {"$lte": 3} # Assume duration is in hours

    recommended_exps = list(experiences_col.find(query).limit(3))
    return jsonify(parse_json(recommended_exps))

# --- BOOKING & PAYMENT ROUTES ---
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    # This is a simplified booking. In a real app, you'd check availability first.
    booking_data = request.get_json()
    booking_data['experienceId'] = ObjectId(booking_data['experienceId'])
    booking_data['status'] = 'pending_payment' # Initial status
    booking_data['createdAt'] = datetime.utcnow()
    bookings_col.insert_one(booking_data)
    return jsonify(parse_json(booking_data)), 201

@app.route('/api/bookings/<booking_id>/create-payment-intent', methods=['POST'])
def create_payment_intent(booking_id):
    # --- FAKE PAYMENT INTEGRATION ---
    # In a real app, you would use Stripe or Razorpay library here.
    # For the hackathon, we'll simulate it.
    print(f"Simulating payment for booking {booking_id}...")
    
    # Simulate a successful payment after 2 seconds
    import time
    time.sleep(2) 
    
    # Update booking status to confirmed
    bookings_col.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "confirmed"}}
    )
    
    # Return a fake client secret like Stripe would
    return jsonify({
        "clientSecret": "pi_fake_payment_secret_12345"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)