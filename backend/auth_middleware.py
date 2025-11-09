import jwt
from flask import request, jsonify, current_app
from functools import wraps
from models import User # Import the User model

def jwt_required(f):
    """
    Decorator to protect routes. Checks for a valid JWT in the Authorization header.
    If valid, it injects the User object into the function's keyword arguments.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # 1. Check for token in 'Authorization: Bearer <token>' header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            # 401: Unauthorized - Token is missing
            return jsonify({'msg': 'Authorization Token is missing or improperly formatted'}), 401
        
        try:
            # 2. Decode the token using the application's secret key
            data = jwt.decode(
                token, 
                current_app.config['SECRET_KEY'],
                algorithms=[current_app.config['JWT_ALGORITHM']]
            )
            
            # 3. Find the user based on the decoded user_id
            current_user = User.objects(id=data.get('user_id')).first()
            if not current_user:
                return jsonify({'msg': 'User associated with token not found'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'msg': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'msg': 'Token is invalid or corrupted'}), 401
        
        # 4. Pass the authenticated user object to the route function
        return f(current_user=current_user, *args, **kwargs)

    return decorated