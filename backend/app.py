from flask import Flask
from flask_cors import CORS
from models import db
from config import Config
from routes.auth import auth_bp
from routes.wallet import wallet_bp
from routes.transactions import transactions_bp
from routes.meal import meal_bp
from routes.qr_code import qr_bp
from routes.admin import admin_bp
from routes.meal_skip import meal_skip_bp
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    
    db.init_app(app)
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(wallet_bp, url_prefix='/wallet')
    app.register_blueprint(transactions_bp, url_prefix='/transactions')
    app.register_blueprint(meal_bp, url_prefix='/meal')
    app.register_blueprint(qr_bp, url_prefix='/qr')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(meal_skip_bp, url_prefix='/meal')
    
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)
