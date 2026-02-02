import jwt
import bcrypt
import datetime
from functools import wraps
from flask import request, jsonify, current_app

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

def decode_token(token):
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return 'Token expired'
    except jwt.InvalidTokenError:
        return 'Invalid token'

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
            
        decoded = decode_token(token)
        if isinstance(decoded, str):
            return jsonify({'message': decoded}), 401
            
        request.user = decoded
        return f(*args, **kwargs)
    return decorated

def require_role(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            # Check if user exists (set by @require_auth)
            if not hasattr(request, 'user'):
                return jsonify({'message': 'Authentication required'}), 401
            
            # Check if user has required role
            user_role = request.user.get('role')
            if user_role not in roles:
                role_names = {'student': 'Student', 'vendor': 'Vendor', 'admin': 'Administrator'}
                required = ' or '.join([role_names.get(r, r) for r in roles])
                return jsonify({
                    'message': f'This action requires {required} privileges. Please login with the correct account type.'
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

def verify_wallet_consistency(user_id):
    """
    Verify user balance matches transaction ledger sum.
    For demo safety, auto-corrects mismatches.
    
    Args:
        user_id: The user ID to verify
        
    Returns:
        float: The verified/corrected balance
    """
    from models import db, User, Transaction
    
    total = db.session.query(
        db.func.sum(Transaction.amount)
    ).filter(Transaction.user_id == user_id).scalar() or 0.0

    user = User.query.get(user_id)
    if user and round(user.balance, 2) != round(total, 2):
        current_app.logger.error(
            f"⚠️  BALANCE MISMATCH for user {user_id}: "
            f"user.balance={user.balance}, ledger_sum={total}"
        )
        # For demo safety, force correction
        user.balance = total
        db.session.commit()
        current_app.logger.info(f"✅ Auto-corrected balance for user {user_id}")
    
    return user.balance if user else 0.0
