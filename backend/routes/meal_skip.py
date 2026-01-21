from flask import Blueprint, request, jsonify
from models import db, MealSkip, User
from utils.utils import require_auth, require_role
from datetime import datetime, date, timedelta

meal_skip_bp = Blueprint('meal_skip', __name__)

@meal_skip_bp.route('/skip', methods=['POST'])
@require_auth
@require_role('student')
def skip_meal():
    user_id = request.user.get('user_id')
    data = request.json
    meal_slot = data.get('meal_slot')
    skip_date_str = data.get('skip_date')
    reason = data.get('reason', '')

    if not meal_slot or not skip_date_str:
        return jsonify({'message': 'Missing meal_slot or skip_date'}), 400

    try:
        skip_date = date.fromisoformat(skip_date_str)
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

    # Policy: Must be at least 24 hours away
    # For simplicity, we check if skip_date is at least tomorrow
    tomorrow = date.today() + timedelta(days=1)
    if skip_date < tomorrow:
        return jsonify({'message': 'Skips must be scheduled at least 24 hours in advance'}), 400

    # Prevent duplicate
    existing = MealSkip.query.filter_by(user_id=user_id, meal_slot=meal_slot, skip_date=skip_date).first()
    if existing:
        return jsonify({'message': 'Meal already skipped for this slot and date'}), 400

    new_skip = MealSkip(
        user_id=user_id,
        meal_slot=meal_slot,
        skip_date=skip_date,
        reason=reason
    )
    db.session.add(new_skip)
    db.session.commit()

    return jsonify({'message': 'Meal skip recorded', 'skip': new_skip.to_dict()}), 201

@meal_skip_bp.route('/skips', methods=['GET'])
@require_auth
@require_role('student')
def get_user_skips():
    user_id = request.user.get('user_id')
    upcoming = request.args.get('upcoming', 'false').lower() == 'true'
    
    query = MealSkip.query.filter_by(user_id=user_id)
    if upcoming:
        query = query.filter(MealSkip.skip_date >= date.today())
    
    skips = query.order_by(MealSkip.skip_date.asc()).all()
    return jsonify([s.to_dict() for s in skips]), 200

@meal_skip_bp.route('/skip/<int:skip_id>', methods=['DELETE'])
@require_auth
@require_role('student')
def cancel_skip(skip_id):
    user_id = request.user.get('user_id')
    skip = MealSkip.query.filter_by(id=skip_id, user_id=user_id).first()
    
    if not skip:
        return jsonify({'message': 'Skip request not found'}), 404

    # Policy: Cancel up to 12 hours before. 
    # For simplicity, if skip_date is today or in past, we don't allow cancellation 
    # (assuming 24h advance was required, so cancelling a future date is fine)
    if skip.skip_date <= date.today():
        # More precise check could be done here if we had meal slot times
        return jsonify({'message': 'Cannot cancel skips for today or past dates'}), 400

    db.session.delete(skip)
    db.session.commit()
    return jsonify({'message': 'Meal skip cancelled'}), 200

@meal_skip_bp.route('/skips/upcoming', methods=['GET'])
@require_auth
@require_role('vendor', 'admin')
def get_upcoming_skips():
    date_str = request.args.get('date')
    meal_slot = request.args.get('meal_slot')

    if date_str:
        try:
            target_date = date.fromisoformat(date_str)
        except ValueError:
            return jsonify({'message': 'Invalid date format'}), 400
    else:
        target_date = date.today() + timedelta(days=1)

    query = MealSkip.query.filter_by(skip_date=target_date)
    if meal_slot:
        query = query.filter_by(meal_slot=meal_slot)

    skips = query.all()
    
    # Summary count
    summary = {
        'BREAKFAST': 0,
        'LUNCH': 0,
        'DINNER': 0
    }
    
    detailed_skips = []
    for s in skips:
        summary[s.meal_slot] += 1
        user = User.query.get(s.user_id)
        detailed_skips.append({
            'id': s.id,
            'user_email': user.email if user else 'Unknown',
            'meal_slot': s.meal_slot,
            'reason': s.reason
        })

    return jsonify({
        'date': target_date.isoformat(),
        'summary': summary,
        'skips': detailed_skips
    }), 200
