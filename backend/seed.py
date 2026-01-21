from app import create_app
from models import db, User, Transaction
from utils.utils import hash_password
from datetime import datetime, timedelta

app = create_app()

def seed():
    with app.app_context():
        # Clean start
        db.drop_all()
        db.create_all()

        print("Creating users...")
        # Create Admin
        admin = User(
            email="admin@test.com",
            password_hash=hash_password("admin123"),
            role="admin",
            balance=10000.0
        )
        db.session.add(admin)

        # Create Vendor
        vendor = User(
            email="vendor@test.com",
            password_hash=hash_password("vendor123"),
            role="vendor",
            balance=5000.0
        )
        db.session.add(vendor)

        # Create Student
        student = User(
            email="student@test.com",
            password_hash=hash_password("student123"),
            role="student",
            balance=500.0
        )
        db.session.add(student)
        db.session.commit()

        print("Creating sample transactions...")
        # Create some mock transactions over the last 7 days
        now = datetime.utcnow()
        transactions = []
        
        # Top-ups
        transactions.append(Transaction(user_id=student.id, amount=2000, transaction_type='top-up', description='Initial Deposit', source='parent', timestamp=now - timedelta(days=6)))
        
        # Deductions
        venues = ['Mess 1', 'Mess 2', 'Night Canteen']
        for i in range(5):
            day = now - timedelta(days=i)
            # Deduction 1 (Lunch)
            transactions.append(Transaction(
                user_id=student.id, 
                amount=-70, 
                transaction_type='deduction', 
                description='Meal: Lunch', 
                venue=venues[i % len(venues)],
                timestamp=day.replace(hour=13, minute=0, second=0)
            ))
            # Deduction 2 (Dinner)
            transactions.append(Transaction(
                user_id=student.id, 
                amount=-60, 
                transaction_type='deduction', 
                description='Meal: Dinner', 
                venue=venues[(i+1) % len(venues)],
                timestamp=day.replace(hour=20, minute=0, second=0)
            ))

        db.session.add_all(transactions)
        db.session.commit()

        print("\nDatabase seeded successfully!")
        print("-" * 30)
        print("Admin:   admin@test.com   / admin123")
        print("Vendor:  vendor@test.com  / vendor123")
        print("Student: student@test.com / student123")
        print("-" * 30)

if __name__ == '__main__':
    seed()
