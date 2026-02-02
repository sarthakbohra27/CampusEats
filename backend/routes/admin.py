from flask import Blueprint, request, jsonify
from models import db, User, Transaction
from utils.utils import require_auth, require_role
from sqlalchemy import func
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/reports', methods=['GET'])
@require_auth
@require_role('admin')
def get_reports():
    # Total transactions
    total_tx = Transaction.query.count()
    
    # Total volume
    total_volume = db.session.query(func.abs(func.sum(Transaction.amount))).one()[0] or 0
    
    # Waste Reduction Calculation (Simulated)
    total_students = User.query.filter_by(role='student').count()
    waste_reduction = 45.5 # Base mock value
    
    # Meal counts by venue
    venue_data = db.session.query(
        Transaction.venue, func.count(Transaction.id)
    ).filter(Transaction.transaction_type == 'deduction').group_by(Transaction.venue).all()
    
    venue_report = {v: c for v, c in venue_data}
    
    # Top-up sources
    sources = db.session.query(
        Transaction.source, func.count(Transaction.id)
    ).filter(Transaction.transaction_type == 'top-up').group_by(Transaction.source).all()
    source_report = {s: c for s, c in sources}

    # Daily Growth Trend (Last 7 Days)
    from datetime import timedelta
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    growth_data = db.session.query(
        func.date(Transaction.timestamp), func.abs(func.sum(Transaction.amount))
    ).filter(Transaction.timestamp >= seven_days_ago)\
     .group_by(func.date(Transaction.timestamp))\
     .order_by(func.date(Transaction.timestamp)).all()
    
    growth_trend = [{"date": d, "volume": v} for d, v in growth_data]
    
    # Entity Distribution
    roles_data = db.session.query(
        User.role, func.count(User.id)
    ).group_by(User.role).all()
    entity_distribution = {role: count for role, count in roles_data}

    return jsonify({
        'total_transactions': total_tx,
        'total_volume': total_volume,
        'waste_reduction_pct': waste_reduction,
        'venue_report': venue_report,
        'source_report': source_report,
        'growth_trend': growth_trend,
        'entity_distribution': entity_distribution,
        'active_users': total_students
    }), 200

@admin_bp.route('/users', methods=['GET'])
@require_auth
@require_role('admin')
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@admin_bp.route('/refund', methods=['POST'])
@require_auth
@require_role('admin')
def refund_balance():
    data = request.json
    user_id = data.get('user_id')
    amount = data.get('amount')
    
    if not amount or amount <= 0:
        return jsonify({'message': 'Invalid refund amount'}), 400
    
    if amount > 10000:
        return jsonify({'message': 'Maximum refund amount is ₹10000. Contact system administrator for larger refunds.'}), 400

    # Use pessimistic locking
    user = User.query.with_for_update().get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    print(f"DEBUG: Admin refund for user {user_id}, balance before: {user.balance}, refunding: {amount}")

    user.balance += amount
    
    transaction = Transaction(
        user_id=user_id,
        amount=amount,
        transaction_type='refund',
        description='Administrative Refund',
        source='admin'
    )
    db.session.add(transaction)
    db.session.commit()
    
    # Verify wallet consistency
    from utils.utils import verify_wallet_consistency
    verified_balance = verify_wallet_consistency(user_id)
    
    print(f"DEBUG: Refund complete. New balance: {verified_balance}")

    return jsonify({'message': 'Refund processed', 'new_balance': verified_balance}), 200
