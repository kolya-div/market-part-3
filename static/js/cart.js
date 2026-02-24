document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        cart: [],
        wishlist: [],
    };

    // Selectors
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const cartBadge = document.getElementById('cart-badge');

    // Toggle Cart Drawer
    function toggleCart() {
        if (cartDrawer && overlay) {
            cartDrawer.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (overlay) overlay.addEventListener('click', () => {
        cartDrawer.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Render Cart
    function renderCart() {
        if (!cartItemsContainer || !cartTotalAmount || !cartBadge) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (state.cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="color:var(--gray-500);font-size:14px;text-align:center;margin-top:20px;">Your cart is empty.</p>';
        } else {
            state.cart.forEach(item => {
                total += item.price * item.quantity;
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div class="cart-item-img">
                        <img src="${item.img}" alt="${item.name}">
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-qty">
                            <button class="qty-btn minus" data-id="${item.id}">-</button>
                            <span class="qty-num">${item.quantity}</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                            <span class="cart-item-remove" data-id="${item.id}">Remove</span>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(div);
            });
        }

        cartTotalAmount.textContent = `$${total.toFixed(2)}`;
        cartBadge.textContent = state.cart.reduce((acc, item) => acc + item.quantity, 0);
    }

    // Cart Actions
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('plus')) {
                const id = e.target.getAttribute('data-id');
                const item = state.cart.find(i => i.id === id);
                if (item) item.quantity++;
                renderCart();
            } else if (e.target.classList.contains('minus')) {
                const id = e.target.getAttribute('data-id');
                const item = state.cart.find(i => i.id === id);
                if (item && item.quantity > 1) {
                    item.quantity--;
                } else if (item && item.quantity === 1) {
                    state.cart = state.cart.filter(i => i.id !== id);
                }
                renderCart();
            } else if (e.target.classList.contains('cart-item-remove')) {
                const id = e.target.getAttribute('data-id');
                state.cart = state.cart.filter(i => i.id !== id);
                renderCart();
            }
        });
    }

    // Add to Cart
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;
            const id = card.getAttribute('data-id');
            const name = card.querySelector('.product-name').textContent;
            const priceText = card.querySelector('.price-main').textContent;
            const price = parseFloat(priceText.replace('$', '').replace(',', ''));
            const imgTarget = card.querySelector('.product-img img');
            const img = imgTarget ? imgTarget.src : 'https://via.placeholder.com/150';

            const existing = state.cart.find(i => i.id === id);
            if (existing) {
                existing.quantity++;
            } else {
                state.cart.push({ id, name, price, img, quantity: 1 });
            }

            if (window.showToast) window.showToast('Added to cart successfully!');
            renderCart();

            // Visual feedback on button
            const originalText = btn.innerHTML;
            btn.classList.add('added');
            btn.innerHTML = '✔ Added';
            setTimeout(() => {
                btn.classList.remove('added');
                btn.innerHTML = originalText;
            }, 2000);
        });
    });

    renderCart(); // Initial init
});
