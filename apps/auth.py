from flask import Blueprint, jsonify, request
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User

auth_bp = Blueprint('auth', __name__)

# Basic Contact List Rule for Admin
AUTHORIZED_ADMINS = ['admin', 'superadmin', 'manager']

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        login_user(user)
        return jsonify({
            "success": True, 
            "message": "Logged in successfully",
            "user": {
                "username": user.username,
                "is_admin": user.is_admin
            }
        })
        
    return jsonify({"success": False, "message": "Invalid username or password"}), 401

@auth_bp.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        if user.is_admin or username in AUTHORIZED_ADMINS:
            # First time admin login logic to set flag if not set (for demo ease)
            if not user.is_admin and username in AUTHORIZED_ADMINS:
                user.is_admin = True
                db.session.commit()
            
            login_user(user)
            return jsonify({
                "success": True, 
                "message": "Admin login successful",
                "user": {
                    "username": user.username,
                    "is_admin": True
                }
            })
        else:
            return jsonify({"success": False, "message": "Not authorized as admin"}), 403
            
    return jsonify({"success": False, "message": "Invalid admin credentials"}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out successfully"})

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            "success": True,
            "user": {
                "username": current_user.username,
                "email": current_user.email,
                "is_admin": current_user.is_admin
            }
        })
    return jsonify({"success": False, "message": "Not logged in"}), 401

