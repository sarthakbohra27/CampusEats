import unittest
import json
from datetime import date, timedelta
from app import create_app
from models import db, User, MealSkip
from utils.utils import create_token

class MealSkipTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
        self.app.config['TESTING'] = True
        self.app.config['JWT_SECRET_KEY'] = 'jwt-dev-secret-key'
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            # Use unique email based on test method name to avoid conflicts
            email = f"{self._testMethodName}@test.com"
            student = User(email=email, password_hash='hash', role='student', balance=100)
            db.session.add(student)
            vendor = User(email=f"vendor_{self._testMethodName}@test.com", password_hash='hash', role='vendor')
            db.session.add(vendor)
            db.session.commit()
            
            self.student_id = student.id
            self.vendor_id = vendor.id
            self.student_email = email

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            
    def get_student_headers(self):
        with self.app.app_context():
            token = create_token(self.student_id, 'student')
            return {'Authorization': f'Bearer {token}'}

    def get_vendor_headers(self):
        with self.app.app_context():
            token = create_token(self.vendor_id, 'vendor')
            return {'Authorization': f'Bearer {token}'}

    def test_meal_skip_success(self):
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        res = self.client.post('/meal/skip', 
                               json={'meal_slot': 'LUNCH', 'skip_date': tomorrow},
                               headers=self.get_student_headers())
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data['message'], 'Meal skip recorded')

    def test_meal_skip_validation_failure(self):
        today = date.today().isoformat()
        res = self.client.post('/meal/skip', 
                               json={'meal_slot': 'LUNCH', 'skip_date': today},
                               headers=self.get_student_headers())
        self.assertEqual(res.status_code, 400)
        self.assertIn('24 hours in advance', res.get_json()['message'])

    def test_meal_skip_duplicate_failure(self):
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        # First skip
        self.client.post('/meal/skip', 
                         json={'meal_slot': 'LUNCH', 'skip_date': tomorrow},
                         headers=self.get_student_headers())
        # Duplicate skip
        res = self.client.post('/meal/skip', 
                               json={'meal_slot': 'LUNCH', 'skip_date': tomorrow},
                               headers=self.get_student_headers())
        self.assertEqual(res.status_code, 400)
        self.assertIn('already skipped', res.get_json()['message'])

    def test_vendor_view_skips(self):
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        # Student skips
        self.client.post('/meal/skip', 
                         json={'meal_slot': 'DINNER', 'skip_date': tomorrow},
                         headers=self.get_student_headers())
        
        # Vendor checks
        res = self.client.get(f'/meal/skips/upcoming?date={tomorrow}',
                              headers=self.get_vendor_headers())
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['summary']['DINNER'], 1)
        self.assertEqual(len(data['skips']), 1)

if __name__ == '__main__':
    unittest.main()
