import os
import jwt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from mongoengine import connect
from werkzeug.utils import secure_filename

# Import the JWT verification decorator from the middleware file
from auth_middleware import jwt_required

# Import models
from models import User, HealthRecord

# Import ML model loader
from model_loader import initialize_models, predict_from_image, predict_from_tabular, predict_combined

# Load the .env file from the backend folder explicitly to ensure local dev values are picked up
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Initialize bcrypt
bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__)
    # Allow dev origins (both localhost and 127.0.0.1) for the frontend dev server.
    # Using a resource pattern for /api/* keeps CORS limited to API endpoints.
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176",
                "http://localhost:5177",
                "http://127.0.0.1:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5175",
                "http://127.0.0.1:5176",
                "http://127.0.0.1:5177"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    }, supports_credentials=True)

    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
    app.config['JWT_ALGORITHM'] = 'HS256'
    
    # Configure upload folder for images
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

    # Initialize bcrypt with the app
    bcrypt.init_app(app)

    # Connect to MongoDB with error handling
    # Connect ONLY to the configured MONGO_URI (Atlas or other remote DB).
    # Fail fast and print clear guidance if connection fails.
    MONGO_URI = os.getenv('MONGO_URI')
    if not MONGO_URI:
        raise RuntimeError(
            "MONGO_URI is not set. Set MONGO_URI in backend/.env or as an environment variable to your MongoDB connection string (mongodb+srv://... for Atlas)."
        )

    try:
        # Print a short masked preview of the URI (avoid logging credentials)
        preview = (MONGO_URI[:60] + '...') if len(MONGO_URI) > 60 else MONGO_URI
        print(f"Attempting MongoDB connection using MONGO_URI: {preview}")
        # Connect to the specific application database on the cluster so mongoengine
        # uses the intended `heart_risk_prediction` database and collections.
        # Use a moderate server selection timeout so failures surface quickly in dev
        connect(db="heart_risk_prediction", host=MONGO_URI, serverSelectionTimeoutMS=10000)
        print("✅ MongoDB connection successful (MONGO_URI).")
    except Exception as e:
        # Give actionable debugging tips for Atlas connection problems
        print(f"❌ MongoDB connection to MONGO_URI failed: {e}")
        print("Troubleshooting tips:")
        print(" - Ensure the MONGO_URI in backend/.env is correct and contains username/password if required.")
        print(" - If using MongoDB Atlas, add your IP address to the Network Access whitelist (or 0.0.0.0/0 for testing).")
        print(" - Make sure 'dnspython' is installed (pip install dnspython) when using mongodb+srv URIs.")
        print(" - Ensure outbound TLS connections are allowed by your network/firewall.")
        raise

    # Initialize ML models
    print("🤖 Initializing ML models...")
    initialize_models()
    print("✅ ML models ready for predictions")

    # Simple health check
    @app.route('/', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'ok',
            'service': 'Heart Risk Prediction API'
        }), 200

    # ---------------------------------
    # --- AUTH ROUTES ---
    # ---------------------------------

    @app.route('/api/auth/register', methods=['POST'])
    def register():
        try:
            print("📝 Registration attempt - Processing request...")
            data = request.get_json() or {}
            required_fields = ['name', 'email', 'password']

            # Log received data (excluding password)
            safe_data = {k: v for k, v in data.items() if k != 'password'}
            print(f"📨 Received registration data: {safe_data}")

            if not all(field in data for field in required_fields):
                missing = [f for f in required_fields if f not in data]
                print(f"❌ Registration failed - Missing fields: {missing}")
                return jsonify({'msg': f'Missing required fields: {", ".join(missing)}'}), 400

            email = data.get('email')
            
            # Check if user exists
            existing_user = User.objects(email=email).first()
            if existing_user:
                print(f"❌ Registration failed - Email already exists: {email}")
                return jsonify({'msg': 'User already exists'}), 400

            # Create new user
            print(f"👤 Creating new user with email: {email}")
            new_user = User(name=data.get('name'), email=email)
            new_user.set_password(data.get('password'))
            
            # Save user and verify it was saved
            new_user.save()
            saved_user = User.objects(email=email).first()
            if not saved_user:
                print("❌ Registration failed - User was not saved to database")
                return jsonify({'msg': 'Failed to save user to database'}), 500
            
            print(f"✅ User successfully created with ID: {str(new_user.id)}")

            # Generate token
            token = jwt.encode(
                {'user_id': str(new_user.id), 'exp': datetime.utcnow() + timedelta(days=1)},
                app.config['SECRET_KEY'],
                algorithm=app.config['JWT_ALGORITHM']
            )
            
            print("🎟️ JWT token generated successfully")
            return jsonify({'token': token, 'msg': 'Registration successful'}), 201

        except Exception as e:
            print(f"❌ Registration failed - Unexpected error: {str(e)}")
            # Re-raise to let the global error handler deal with it
            raise

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            print("🔐 Login attempt - Processing request...")
            data = request.get_json() or {}
            
            # Validate required fields
            if not data.get('email') or not data.get('password'):
                print("❌ Login failed - Missing email or password")
                return jsonify({'msg': 'Email and password are required'}), 400

            email = data.get('email')
            password = data.get('password')
            
            print(f"🔍 Looking up user with email: {email}")
            user = User.objects(email=email).first()

            if not user:
                print(f"❌ Login failed - No user found with email: {email}")
                return jsonify({'msg': 'Invalid email or password'}), 401

            if user.check_password(password):
                print(f"✅ Password verified for user: {email}")
                token = jwt.encode(
                    {
                        'user_id': str(user.id),
                        'email': user.email,
                        'exp': datetime.utcnow() + timedelta(days=1)
                    },
                    app.config['SECRET_KEY'],
                    algorithm=app.config['JWT_ALGORITHM']
                )
                print("🎟️ JWT token generated successfully")
                return jsonify({
                    'token': token,
                    'user': {
                        'id': str(user.id),
                        'email': user.email,
                        'name': user.name
                    }
                })
            else:
                print(f"❌ Login failed - Invalid password for user: {email}")
                return jsonify({'msg': 'Invalid email or password'}), 401

        except Exception as e:
            print(f"❌ Login failed - Unexpected error: {str(e)}")
            return jsonify({'msg': f'Login failed: {str(e)}'}), 500

    # ---------------------------------
    # --- RECORDS ROUTES (SECURED) ---
    # ---------------------------------

    @app.route('/api/records', methods=['GET'])
    @jwt_required
    def get_user_records(current_user):
        # Filter records only for the current authenticated user
        records = HealthRecord.objects(user=current_user.id).order_by('-date_submitted')
        return jsonify([record.to_dict() for record in records])


    @app.route('/api/records', methods=['POST'])
    @jwt_required
    def create_record(current_user):
        try:
            data = request.get_json() or {}
            # require at least a risk score and prediction result
            if 'risk_score' not in data or 'prediction_result' not in data:
                return jsonify({'msg': 'risk_score and prediction_result are required'}), 400

            # Build record using available fields (many are optional now)
            record = HealthRecord(
                user=current_user,
                risk_score=float(data.get('risk_score')),
                prediction_result=str(data.get('prediction_result')),
                age=float(data.get('age')) if data.get('age') is not None else None,
                sex=float(data.get('sex')) if data.get('sex') is not None else None,
                cp=float(data.get('cp')) if data.get('cp') is not None else None,
                trestbps=float(data.get('trestbps')) if data.get('trestbps') is not None else None,
                chol=float(data.get('chol')) if data.get('chol') is not None else None,
                fbs=float(data.get('fbs')) if data.get('fbs') is not None else None,
                thalach=float(data.get('thalach')) if data.get('thalach') is not None else None,
                exang=float(data.get('exang')) if data.get('exang') is not None else None,
                oldpeak=float(data.get('oldpeak')) if data.get('oldpeak') is not None else None,
                image_url=data.get('image_url')
            )
            record.save()
            return jsonify(record.to_dict()), 201
        except Exception as e:
            return jsonify({'msg': str(e)}), 500

    # ---------------------------------
    # --- PREDICTION ROUTES (SECURED) ---
    # ---------------------------------

    @app.route('/api/predict/image', methods=['POST'])
    @jwt_required
    def predict_image(current_user):
        """
        Predict heart disease risk from uploaded eye scan image
        Expects: multipart/form-data with 'image' file
        """
        try:
            if 'image' not in request.files:
                return jsonify({'msg': 'No image file provided'}), 400
            
            image_file = request.files['image']
            if image_file.filename == '':
                return jsonify({'msg': 'No image file selected'}), 400
            
            # Save the uploaded image to disk
            original_filename = secure_filename(image_file.filename)
            timestamp = datetime.utcnow().timestamp()
            # Create unique filename with timestamp
            filename = f"{current_user.id}_{timestamp}_{original_filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Save file to uploads folder
            image_file.save(filepath)
            
            # Read image bytes for prediction
            with open(filepath, 'rb') as f:
                image_bytes = f.read()
            
            # Make prediction
            prediction = predict_from_image(image_bytes)
            
            # Save to database with actual file path
            record = HealthRecord(
                user=current_user,
                risk_score=prediction['risk_score'],
                prediction_result=prediction['risk_level'],
                image_url=filename  # Store just the filename, not full path
            )
            record.save()
            
            return jsonify({
                'success': True,
                'prediction': prediction,
                'record_id': str(record.id)
            }), 200
        
        except Exception as e:
            print(f"❌ Image prediction error: {str(e)}")
            return jsonify({'msg': f'Prediction failed: {str(e)}'}), 500

    @app.route('/api/predict/tabular', methods=['POST'])
    @jwt_required
    def predict_tabular(current_user):
        """
        Predict heart disease risk from patient health data
        Expects JSON with: age, sex, cp, trestbps, chol, fbs, thalach, exang, oldpeak
        """
        try:
            data = request.get_json() or {}
            
            # Required features for XGBoost model
            required_features = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'thalach', 'exang', 'oldpeak']
            
            # Check for missing features
            missing = [f for f in required_features if f not in data or data[f] is None]
            if missing:
                return jsonify({'msg': f'Missing required features: {", ".join(missing)}'}), 400
            
            # Prepare features dict
            features = {f: float(data[f]) for f in required_features}
            
            # Make prediction
            prediction = predict_from_tabular(features)
            
            # Save to database
            record = HealthRecord(
                user=current_user,
                risk_score=prediction['risk_score'],
                prediction_result=prediction['risk_level'],
                age=features['age'],
                sex=features['sex'],
                cp=features['cp'],
                trestbps=features['trestbps'],
                chol=features['chol'],
                fbs=features['fbs'],
                thalach=features['thalach'],
                exang=features['exang'],
                oldpeak=features['oldpeak']
            )
            record.save()
            
            return jsonify({
                'success': True,
                'prediction': prediction,
                'record_id': str(record.id)
            }), 200
        
        except ValueError as ve:
            return jsonify({'msg': str(ve)}), 400
        except Exception as e:
            print(f"❌ Tabular prediction error: {str(e)}")
            return jsonify({'msg': f'Prediction failed: {str(e)}'}), 500

    @app.route('/api/predict/combined', methods=['POST'])
    @jwt_required
    def predict_combined_route(current_user):
        """
        Combined prediction using both image and tabular data
        Expects: multipart/form-data with optional 'image' file and JSON fields
        """
        try:
            # Get image if provided and save it
            image_bytes = None
            saved_filename = None
            if 'image' in request.files:
                image_file = request.files['image']
                if image_file.filename != '':
                    # Save the uploaded image to disk
                    original_filename = secure_filename(image_file.filename)
                    timestamp = datetime.utcnow().timestamp()
                    saved_filename = f"{current_user.id}_{timestamp}_{original_filename}"
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], saved_filename)
                    
                    # Save file to uploads folder
                    image_file.save(filepath)
                    
                    # Read image bytes for prediction
                    with open(filepath, 'rb') as f:
                        image_bytes = f.read()
            
            # Get tabular data from form or JSON
            if request.form:
                data = request.form.to_dict()
            else:
                data = request.get_json() or {}
            
            # Prepare features if all are present
            features = None
            feature_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'thalach', 'exang', 'oldpeak']
            if all(f in data and data[f] for f in feature_names):
                features = {f: float(data[f]) for f in feature_names}
            
            # Make combined prediction
            prediction = predict_combined(image_bytes, features)
            
            # Save to database
            record = HealthRecord(
                user=current_user,
                risk_score=prediction['combined_risk_score'],
                prediction_result=prediction['final_risk_level'],
                age=features['age'] if features else None,
                sex=features['sex'] if features else None,
                cp=features['cp'] if features else None,
                trestbps=features['trestbps'] if features else None,
                chol=features['chol'] if features else None,
                fbs=features['fbs'] if features else None,
                thalach=features['thalach'] if features else None,
                exang=features['exang'] if features else None,
                oldpeak=features['oldpeak'] if features else None,
                image_url=saved_filename  # Store actual filename
            )
            record.save()
            
            return jsonify({
                'success': True,
                'prediction': prediction,
                'record_id': str(record.id)
            }), 200
        
        except Exception as e:
            print(f"❌ Combined prediction error: {str(e)}")
            return jsonify({'msg': f'Prediction failed: {str(e)}'}), 500

    # Generic exception handler that returns JSON so the frontend gets a meaningful
    # response and CORS headers are applied even on unexpected errors.
    @app.errorhandler(Exception)
    def handle_global_exception(e):
        # In debug mode Flask will still print the full traceback to console.
        return jsonify({'msg': str(e)}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)