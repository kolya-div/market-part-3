import os
from flask import Flask, jsonify
from flask_login import LoginManager
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

def create_app():
    app = Flask(__name__)

    # ── Environment Stability / Configuration ──────────────────────────────────
    # Safe default values for SECRET_KEY and SQLALCHEMY_DATABASE_URI
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'change-me-in-production-abc123xyz')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///promarket.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

    # ── Database & Circular Import Fixes ───────────────────────────────────────
    # Import db and models inside the factory to avoid circular imports
    try:
        from models import db, User
        db.init_app(app)
    except ImportError as e:
        print(f"Error importing models: {e}")
        return app

    # ── Flask-Login ────────────────────────────────────────────────────────────
    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        # Modernized User Loader using db.session.get()
        return db.session.get(User, int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({'success': False, 'message': 'Authentication required'}), 401

    # ── Complete Blueprint Integration ─────────────────────────────────────────
    try:
        from apps.main import main_bp
        from apps.auth import auth_bp
        from apps.admin import admin_bp

        app.register_blueprint(main_bp)
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(admin_bp, url_prefix='/admin')
    except ImportError as e:
        print(f"Error importing or registering blueprints: {e}")

    # ── Security Headers ───────────────────────────────────────────────────────
    @app.after_request
    def set_security_headers(response):
        # Global security headers implementation
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        # Permissive CSP (allow Unsplash & Google Fonts for the frontend)
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https://images.unsplash.com https://via.placeholder.com; "
            "connect-src 'self';"
        )
        return response

    # ── Database Initialization & Seeding Logic ────────────────────────────────
    with app.app_context():
        db.create_all()

        # Auto-seed only if the database (User table) is truly empty
        try:
            if db.session.query(User).first() is None:
                from seed import run_seed
                run_seed()
                print('[App] Auto-seeded database on first run.')
        except Exception as e:
            print(f'[App] Seed error during initialization: {e}')

    # ── CLI Commands ───────────────────────────────────────────────────────────
    @app.cli.command('seed')
    def seed_cmd():
        """Seed the database with demo data via CLI."""
        try:
            from seed import run_seed
            with app.app_context():
                run_seed()
                print('Database seeded successfully via CLI.')
        except Exception as e:
            print(f"Error seeding database: {e}")

    @app.cli.command('create-admin')
    def create_admin_cmd():
        """Create an admin user interactively."""
        from models import User
        username = input('Admin username: ')
        password = input('Admin password: ')
        email = input('Admin email (optional): ').strip() or None
        
        with app.app_context():
            if User.query.filter_by(username=username).first():
                print('Error: User already exists.')
                return
            
            u = User(username=username, email=email, is_admin=True)
            u.set_password(password)
            db.session.add(u)
            db.session.commit()
            print(f'Admin "{username}" created successfully.')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
