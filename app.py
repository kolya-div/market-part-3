from flask import Flask, render_template
from flask_login import LoginManager

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'dev-secret-key-change-in-production'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///promarket.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Importing models to initialize db
    from models import db, User
    db.init_app(app)

    # Setup Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    # The frontend is mostly a single-page app, but we can set a view if needed.
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register blueprints
    from apps.main import main_bp
    from apps.auth import auth_bp
    from apps.admin import admin_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_bp, url_prefix='/admin')

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
