import os
import jwt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from mongoengine import connect

# Import the JWT verification decorator from the middleware file
from auth_middleware import jwt_required

# Import models
from models import User, HealthRecord

load_dotenv()

# Initialize bcrypt
bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
    app.config['JWT_ALGORITHM'] = 'HS256'

    # Initialize bcrypt with the app
    bcrypt.init_app(app)

    # Connect to MongoDB with error handling
    try:
        MONGO_URI = os.getenv('MONGO_URI')
        if not MONGO_URI:
            raise ValueError("MONGO_URI environment variable is not set")
        connect(host=MONGO_URI)
        print("✅ MongoDB connection successful.")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")

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
        data = request.get_json() or {}
        required_fields = ['name', 'email', 'password']

        if not all(field in data for field in required_fields):
            return jsonify({'msg': 'Missing required fields'}), 400

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

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json() or {}
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
    # --- RECORDS ROUTES (SECURED) ---
    # ---------------------------------

    @app.route('/api/records', methods=['GET'])
    @jwt_required
    def get_user_records(current_user):
        # Filter records only for the current authenticated user
        records = HealthRecord.objects(user=current_user.id).order_by('-date_submitted')
        return jsonify([record.to_dict() for record in records])

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)