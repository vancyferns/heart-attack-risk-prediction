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
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()
        elif auth_header:
            token = auth_header.strip()

        if not token:
            return jsonify({'msg': 'Token is missing'}), 401

        try:
            payload = jwt.decode(
                token,
                os.getenv('JWT_SECRET_KEY', 'default_secret_key'),
                algorithms=['HS256']
            )
            user_id = payload.get('user_id')
            if not user_id:
                return jsonify({'msg': 'Invalid token payload'}), 401

            current_user = User.objects(id=user_id).first()
            if not current_user:
                return jsonify({'msg': 'User not found'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'msg': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'msg': 'Invalid token'}), 401
        except Exception:
            return jsonify({'msg': 'Token validation failed'}), 401

        return f(current_user, *args, **kwargs)
    return decorated