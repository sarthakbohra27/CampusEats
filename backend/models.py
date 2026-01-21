from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False) # student, vendor, admin
    balance = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    transactions = db.relationship('Transaction', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'balance': self.balance
        }

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False) # top-up, deduction, refund
    description = db.Column(db.String(200))
    venue = db.Column(db.String(100))
    source = db.Column(db.String(20)) # self, parent, admin
    status = db.Column(db.String(20), default='success') # success, pending, processing
    skipped = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'transaction_type': self.transaction_type,
            'description': self.description,
            'venue': self.venue,
            'source': self.source,
            'status': self.status,
            'skipped': self.skipped,
            'timestamp': self.timestamp.isoformat()
        }
class MealSkip(db.Model):
    __tablename__ = 'meal_skips'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    meal_slot = db.Column(db.String(20), nullable=False) # BREAKFAST, LUNCH, DINNER
    skip_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('user_id', 'meal_slot', 'skip_date', name='_user_meal_skip_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'meal_slot': self.meal_slot,
            'skip_date': self.skip_date.isoformat(),
            'reason': self.reason,
            'created_at': self.created_at.isoformat()
        }
