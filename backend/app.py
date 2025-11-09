import os
import jwt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from mongoengine import connect
import pandas as pd
import joblib 

# 🚨 Import the JWT verification decorator from the middleware file
from auth_middleware import jwt_required 

# Import models and extensions
from models import bcrypt, User, HealthRecord 

load_dotenv() 

# --- Global Model Variables ---
# ML Model must be saved as 'heart_attack_model.pkl' in the backend folder.
try:
    MODEL = joblib.load('heart_attack_model.pkl')
    print("✅ ML Model loaded successfully.")
except FileNotFoundError:
    MODEL = None
    print("❌ WARNING: ML Model file 'heart_attack_model.pkl' not found.")
    
# NOTE: The JWT verification is now implemented via the @jwt_required decorator.

def create_app():
    app = Flask(__name__)
    CORS(app) 

    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
    app.config['JWT_ALGORITHM'] = 'HS256'
    
    bcrypt.init_app(app)

    # Connect to MongoDB using the URI from the .env file
    MONGO_URI = os.getenv('MONGO_URI') 
    connect(host=MONGO_URI)
    print("✅ MongoDB connection successful.")

    # ---------------------------------
    # --- ROOT HEALTH CHECK ---
    # ---------------------------------
    @app.route('/', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'ok', 
            'service': 'Heart Risk Prediction API',
            'model_loaded': True if MODEL else False
        }), 200

    # ---------------------------------
    # --- AUTH ROUTES ---
    # ---------------------------------

    # @route   POST /api/auth/register
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        data = request.get_json()
        email = data.get('email')
        
        if User.objects(email=email).first():
            return jsonify({'msg': 'User already exists'}), 400

        new_user = User(name=data.get('name'), email=email)
        new_user.set_password(data.get('password'))
        new_user.save()

        token = jwt.encode(
            {'user_id': str(new_user.id), 'exp': datetime.utcnow() + timedelta(days=1)},
            app.config['SECRET_KEY'],
            algorithm=app.config['JWT_ALGORITHM']
        )
        return jsonify({'token': token}), 201

    # @route   POST /api/auth/login
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.objects(email=email).first()

        if user and user.check_password(password):
            token = jwt.encode(
                {'user_id': str(user.id), 'exp': datetime.utcnow() + timedelta(days=1)},
                app.config['SECRET_KEY'],
                algorithm=app.config['JWT_ALGORITHM']
            )
            return jsonify({'token': token})
        else:
            return jsonify({'msg': 'Invalid Credentials'}), 401

    # ---------------------------------
    # --- CORE PREDICTION ROUTES (SECURED) ---
    # ---------------------------------

    # @route   POST /api/predict
    # 🔐 Requires a valid JWT token
    @app.route('/api/predict', methods=['POST'])
    @jwt_required # <-- Applied security decorator
    def predict_risk(current_user): # <-- Receives authenticated User object
        if not MODEL:
            return jsonify({'msg': 'Prediction model not available'}), 503
            
        data = request.get_json()
        
        # 1. Prepare data for the ML model
        feature_order = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'thalach', 'exang', 'oldpeak']
        
        try:
            # Note: Ensure client sends data as numbers (Ints/Floats)
            input_data = [data.get(feature) for feature in feature_order]
            input_df = pd.DataFrame([input_data], columns=feature_order)
            
        except Exception as e:
            return jsonify({'msg': f'Missing or invalid input data: {e}'}), 400

        # 2. Run the Prediction
        probability = MODEL.predict_proba(input_df)[:, 1][0]
        
        # 3. Determine and store the result
        risk_score = round(float(probability), 4)
        result_text = "High Risk" if risk_score >= 0.5 else "Low Risk" 

        new_record = HealthRecord(
            user=current_user, # <-- Now using the authenticated user
            risk_score=risk_score,
            prediction_result=result_text,
            **data # Save all input fields
        )
        new_record.save()
        
        # 4. Return the result
        return jsonify({
            'success': True,
            'risk_score': risk_score,
            'prediction_result': result_text,
        })

    # @route   GET /api/records
    # 🔐 Requires a valid JWT token
    @app.route('/api/records', methods=['GET'])
    @jwt_required # <-- Applied security decorator
    def get_user_records(current_user): # <-- Receives authenticated User object
        
        # Filter records only for the current authenticated user
        records = HealthRecord.objects(user=current_user.id).order_by('-date_submitted')
        
        return jsonify([record.to_dict() for record in records])


    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)