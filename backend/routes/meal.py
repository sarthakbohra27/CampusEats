from flask import Blueprint, request, jsonify
from models import db, User, Transaction
from utils.utils import require_auth, require_role
from datetime import datetime
import hashlib

meal_bp = Blueprint('meal', __name__)

@meal_bp.route('/deduct', methods=['POST'])
@require_auth
@require_role('vendor')
def deduct_meal():
    data = request.json
    qr_payload = data.get('qr_payload') # JSON from QR: {"user_id": 1, "expires": TIMESTAMP}
    meal_cost = data.get('meal_cost')
    description = data.get('description', 'Meal')
    venue = data.get('venue', 'Unknown Venue')

    if not qr_payload or not meal_cost:
        return jsonify({'message': 'Missing data'}), 400
    
    # Validate QR payload structure
    if not isinstance(qr_payload, dict):
        return jsonify({'message': 'Invalid QR payload format'}), 400
    
    try:
        user_id = qr_payload.get('user_id')
        expires = qr_payload.get('expires')
        
        if not user_id or not expires:
            return jsonify({'message': 'QR payload missing required fields'}), 400
    except (AttributeError, TypeError) as e:
        return jsonify({'message': 'Malformed QR code'}), 400

    # Security: Check QR expiry
    if datetime.utcnow().timestamp() > expires:
        return jsonify({'message': 'QR code expired. Please generate a new QR code.'}), 400
    
    # Generate QR hash for idempotency (prevent duplicate scans)
    qr_hash = hashlib.sha256(
        f"{user_id}:{expires}".encode()
    ).hexdigest()[:16]
    
    # Check if this QR has already been used
    existing = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == 'deduction',
        Transaction.description.like(f'%QR:{qr_hash}%')
    ).first()
    
    if existing:
        return jsonify({
            'message': 'This QR code has already been used for payment',
            'previous_transaction': existing.timestamp.isoformat(),
            'previous_amount': abs(existing.amount)
        }), 409

    # Use pessimistic locking to prevent race conditions
    user = User.query.with_for_update().get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if user.balance < meal_cost:
        return jsonify({
            'message': 'Insufficient balance',
            'current_balance': user.balance,
            'required': meal_cost
        }), 400
    
    print(f"DEBUG: Meal deduction for user {user_id}, balance before: {user.balance}, deducting: {meal_cost}")

    # Deduct balance
    user.balance -= meal_cost
    
    # Create transaction with QR hash in description
    transaction = Transaction(
        user_id=user_id,
        amount=-meal_cost, # Store as negative for deductions
        transaction_type='deduction',
        description=f'{description} [QR:{qr_hash}]',
        venue=venue
    )
    db.session.add(transaction)
    db.session.commit()
    
    # Verify wallet consistency
    from utils.utils import verify_wallet_consistency
    verified_balance = verify_wallet_consistency(user_id)
    
    print(f"DEBUG: Meal deduction complete. New balance: {verified_balance}")

    return jsonify({
        'message': 'Payment successful',
        'new_balance': verified_balance,
        'user_id': user.id,
        'amount_deducted': meal_cost
    }), 200
