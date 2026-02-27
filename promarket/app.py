import os
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key-123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==== MODELS ====
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(500))
    description = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price": self.price,
            "stock": self.stock,
            "image_url": self.image_url,
            "description": self.description
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    items_json = db.Column(db.Text, nullable=False)
    card_last4 = db.Column(db.String(4))

class UIAsset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text)

class AdminUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

# ==== SEED DATA ====
def seed_data():
    if AdminUser.query.count() == 0:
        admin = AdminUser(username='admin', password_hash=generate_password_hash('admin123'))
        db.session.add(admin)
        
    if UIAsset.query.count() == 0:
        assets = [
            UIAsset(key="site_title", value="ProMarket"),
            UIAsset(key="hero_text", value="The Future of Tech is Here"),
            UIAsset(key="checkout_title", value="Secure Checkout"),
            UIAsset(key="footer_text", value="© 2026 ProMarket. All rights reserved."),
            UIAsset(key="checkout_ssl", value="🔒 SSL Secured Checkout")
        ]
        db.session.add_all(assets)

    if Product.query.count() == 0:
        products = [
            Product(name="iPhone 15 Pro", category="Smartphones", price=999, stock=50, image_url="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=400&h=400", description="A17 Pro chip, Titanium design"),
            Product(name="Samsung Galaxy S24 Ultra", category="Smartphones", price=1199, stock=30, image_url="https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&q=80&w=400&h=400", description="AI powered, S-pen included"),
            Product(name="Google Pixel 8 Pro", category="Smartphones", price=899, stock=20, image_url="https://images.unsplash.com/photo-1598327105666-5b89351cb315?auto=format&fit=crop&q=80&w=400&h=400", description="The best Google camera yet"),
            Product(name="MacBook Pro 16", category="Laptops", price=2499, stock=15, image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400&h=400", description="M3 Max, 32GB RAM"),
            Product(name="Dell XPS 15", category="Laptops", price=1899, stock=25, image_url="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=400&h=400", description="OLED Display, RTX 4070"),
            Product(name="ThinkPad X1 Carbon", category="Laptops", price=1499, stock=10, image_url="https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=400&h=400", description="Ultralight, durable"),
            Product(name="AirPods Pro 2", category="Audio", price=249, stock=100, image_url="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400&h=400", description="ANC, USB-C"),
            Product(name="Sony WH-1000XM5", category="Audio", price=348, stock=40, image_url="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400&h=400", description="Industry leading noise cancellation"),
            Product(name="Bose QuietComfort Earbuds", category="Audio", price=299, stock=35, image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400&h=400", description="World-class noise cancelling"),
            Product(name="Apple Watch Ultra 2", category="Accessories", price=799, stock=20, image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400&h=400", description="Rugged Titanium case"),
            Product(name="Logitech MX Master 3S", category="Accessories", price=99, stock=80, image_url="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=400&h=400", description="Ergonomic precision mouse"),
            Product(name="Anker 100W Charger", category="Accessories", price=45, stock=150, image_url="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=400&h=400", description="GaN Fast Charging")
        ]
        db.session.add_all(products)
        
    db.session.commit()

with app.app_context():
    db.create_all()
    seed_data()

# ==== PUBLIC ROUTES ====
@app.route('/')
def index():
    products = Product.query.all()
    return render_template('index.html', products=products)

@app.route('/api/products')
def api_products():
    category = request.args.get('category')
    if category:
        products = Product.query.filter_by(category=category).all()
    else:
        products = Product.query.all()
    return jsonify([p.to_dict() for p in products])

@app.route('/checkout')
def checkout():
    return render_template('checkout.html')

@app.route('/api/checkout', methods=['POST'])
def api_checkout():
    data = request.json
    cart = data.get('cart', [])
    cc = data.get('cc', '')
    if not cart:
        return jsonify({"error": "Cart is empty"}), 400
    
    total = sum(item['price'] * item['qty'] for item in cart)
    last4 = cc[-4:] if len(cc) >= 4 else '0000'
    
    order = Order(
        total_price=total,
        status='completed',
        items_json=json.dumps(cart),
        card_last4=last4
    )
    db.session.add(order)
    db.session.commit()
    return jsonify({"order_id": order.id})

@app.route('/confirmation/<int:order_id>')
def confirmation(order_id):
    order = Order.query.get_or_404(order_id)
    return render_template('confirmation.html', order=order)

@app.route('/api/ui-assets')
def get_ui_assets():
    assets = UIAsset.query.all()
    return jsonify({a.key: a.value for a in assets})

# ==== ADMIN ROUTES ====
def login_required(f):
    def wrapper(*args, **kwargs):
        if 'admin_id' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@app.route('/admin')
def admin_root():
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        admin = AdminUser.query.filter_by(username=username).first()
        if admin and check_password_hash(admin.password_hash, password):
            session['admin_id'] = admin.id
            return redirect(url_for('admin_dashboard'))
        return render_template('admin/login.html', error="Invalid credentials")
    return render_template('admin/login.html')

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    return render_template('admin/dashboard.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_id', None)
    return redirect(url_for('admin_login'))

@app.route('/api/admin/stats')
@login_required
def admin_stats():
    total_sales = db.session.query(db.func.sum(Order.total_price)).scalar() or 0
    active_orders = Order.query.count()
    low_stock = Product.query.filter(Product.stock < 15).count()
    return jsonify({
        "total_sales": total_sales,
        "active_orders": active_orders,
        "stock_alerts": low_stock
    })

@app.route('/api/admin/products/<int:id>', methods=['PUT', 'DELETE'])
@login_required
def admin_product_update(id):
    product = Product.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(product)
        db.session.commit()
        return jsonify({"success": True})
    
    data = request.json
    product.name = data.get('name', product.name)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    db.session.commit()
    return jsonify({"success": True})

@app.route('/api/admin/ui-assets/<int:id>', methods=['PATCH'])
@login_required
def admin_ui_asset_update(id):
    asset = UIAsset.query.get_or_404(id)
    data = request.json
    if 'value' in data:
        asset.value = data['value']
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"success": False}), 400

if __name__ == '__main__':
    app.run(debug=True)
