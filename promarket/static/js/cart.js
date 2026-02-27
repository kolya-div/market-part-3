// Cart state management
let cart = JSON.parse(localStorage.getItem('promarket_cart')) || [];

function saveCart() {
    localStorage.setItem('promarket_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveCart();
    document.getElementById('cart-overlay').classList.add('active');
    document.getElementById('cart-drawer').classList.add('active');
}

function updateCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    saveCart();
}

function updateCartUI() {
    // Update badge
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = count;

    // Update Drawer
    const container = document.getElementById('cart-items');
    if (!container) return;

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="color:var(--muted); text-align:center; margin-top:40px;">Your cart is empty.</p>';
        document.getElementById('cart-subtotal').textContent = '$0.00';
        return;
    }

    cart.forEach(item => {
        total += item.price * item.qty;
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${item.image_url}" class="cart-item-img" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                    <span style="font-size:13px; font-weight:600; width:16px; text-align:center;">${item.qty}</span>
                    <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
        container.appendChild(el);
    });

    document.getElementById('cart-subtotal').textContent = `$${total.toFixed(2)}`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    const cartBtn = document.getElementById('cart-btn');
    const closeBtn = document.getElementById('cart-close');
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');

    if (cartBtn) cartBtn.addEventListener('click', () => {
        overlay.classList.add('active');
        drawer.classList.add('active');
    });

    const closeDrawer = () => {
        overlay.classList.remove('active');
        drawer.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
});
