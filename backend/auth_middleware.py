import jwt
from flask import request, jsonify, current_app
from functools import wraps
from models import User # Import the User model
import os

def jwt_required(f):
    """
    Decorator to protect routes. Checks for a valid JWT in the Authorization header.
    If valid, it injects the User object into the function's keyword arguments.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = None
        
        print(f"🔐 JWT Check - Auth header received: {auth_header[:50] if auth_header else 'None'}...")
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()
        elif auth_header:
            token = auth_header.strip()

        if not token:
            print("❌ JWT Check - No token found")
            return jsonify({'msg': 'Token is missing'}), 401

        try:
            secret_key = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
            print(f"🔑 JWT Check - Using secret key: {secret_key[:10]}...")
            
            payload = jwt.decode(
                token,
                secret_key,
                algorithms=['HS256']
            )
            
            user_id = payload.get('user_id')
            print(f"✅ JWT Check - Token decoded, user_id: {user_id}")
            
            if not user_id:
                print("❌ JWT Check - No user_id in payload")
                return jsonify({'msg': 'Invalid token payload'}), 401

            current_user = User.objects(id=user_id).first()
            if not current_user:
                print(f"❌ JWT Check - User not found: {user_id}")
                return jsonify({'msg': 'User not found'}), 401
            
            print(f"✅ JWT Check - User authenticated: {current_user.email}")

        except jwt.ExpiredSignatureError:
            print("❌ JWT Check - Token expired")
            return jsonify({'msg': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            print(f"❌ JWT Check - Invalid token: {str(e)}")
            return jsonify({'msg': 'Invalid token'}), 401
        except Exception as e:
            print(f"❌ JWT Check - Validation failed: {str(e)}")
            return jsonify({'msg': 'Token validation failed'}), 401

        return f(current_user, *args, **kwargs)
    return decorated