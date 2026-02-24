from flask import Blueprint, jsonify

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/')
def dashboard():
    return jsonify({"status": "implement admin dashboard"})
