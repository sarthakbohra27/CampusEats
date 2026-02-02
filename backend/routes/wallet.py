from flask import Blueprint, request, jsonify
from models import db, User, Transaction
from utils.utils import require_auth
from sqlalchemy import desc
from datetime import datetime

wallet_bp = Blueprint('wallet', __name__)

@wallet_bp.route('/balance', methods=['GET'])
@require_auth
def get_balance():
    user_id = request.user['user_id']
    user = User.query.get(user_id)
    return jsonify({'balance': user.balance}), 200

@wallet_bp.route('/topup', methods=['POST'])
@require_auth
def topup():
    user_id = request.user['user_id']
    data = request.json
    amount = data.get('amount')
    source = data.get('source', 'self') # self, parent

    if not amount or amount <= 0:
        return jsonify({'message': 'Invalid amount'}), 400
    
    # Maximum top-up validation (prevent unrealistic balances)
    if amount > 5000:
        return jsonify({'message': 'Maximum top-up amount is ₹5000'}), 400

    # Use pessimistic locking to prevent race conditions
    user = User.query.with_for_update().get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    print(f"DEBUG: Topup for user {user_id}, initial balance: {user.balance}, amount to add: {amount}")
    
    # Update balance
    user.balance += amount

    # Create transaction record
    transaction = Transaction(
        user_id=user_id,
        amount=amount,
        transaction_type='top-up',
        description=f'Top-up via {source}',
        source=source
    )
    db.session.add(transaction)
    db.session.commit()
    
    # Verify wallet consistency after commit
    from utils.utils import verify_wallet_consistency
    verified_balance = verify_wallet_consistency(user_id)
    
    print(f"DEBUG: Topup complete. New balance: {verified_balance}")

    return jsonify({'message': 'Top-up successful', 'new_balance': verified_balance}), 200

@wallet_bp.route('/share', methods=['GET'])
@require_auth
def share_link():
    # In a real app, this would generate a signed token for a public top-up page
    user_id = request.user['user_id']
    # Mocking a shareable token
    share_token = f"share_{user_id}_mock"
    return jsonify({
        'share_url': f"http://localhost:3000/parent/topup/{share_token}",
        'message': 'Share this link with your parent for remote top-up'
    }), 200

@wallet_bp.route('/projection', methods=['GET'])
@require_auth
def get_projection():
    user_id = request.user['user_id']
    user = User.query.get(user_id)
    
    # Determine next meal slot and cost
    now = datetime.now()
    hour = now.hour
    
    next_meal_cost = 70 # Default to Lunch
    if 0 <= hour < 10:
        next_meal_cost = 30 # Breakfast
    elif 10 <= hour < 15:
        next_meal_cost = 70 # Lunch
    elif 15 <= hour < 21:
        next_meal_cost = 60 # Dinner
    else:
        next_meal_cost = 30 # Late night -> next Breakfast
        
    # Calculate suggestion amount based on last 5 deductions
    last_transactions = Transaction.query.filter_by(user_id=user_id, transaction_type='deduction')\
                        .order_by(desc(Transaction.timestamp)).limit(5).all()
    
    # Account for pending parental top-ups
    pending_topups = Transaction.query.filter_by(user_id=user_id, status='processing', transaction_type='top-up').all()
    pending_amount = sum([t.amount for t in pending_topups])

    suggestion_amount = 0
    if last_transactions:
        avg_cost = sum([t.amount for t in last_transactions]) / len(last_transactions)
        # Round to nearest 50
        suggestion_amount = max(100, round(avg_cost / 50) * 50)
    else:
        suggestion_amount = 200 # Baseline suggestion
        
    confidence_score = min(0.95, 0.5 + (len(last_transactions) * 0.1))
    
    return jsonify({
        "projected_balance": (user.balance + pending_amount) - next_meal_cost,
        "next_meal_cost": float(next_meal_cost),
        "suggestion_amount": float(suggestion_amount),
        "confidence_score": float(confidence_score)
    }), 200
