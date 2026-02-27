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

    if (cartBtn) cartBtn.addEventListener('click', () => {
        if (typeof window.switchPage === 'function') window.switchPage('cart');
    });
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => {
        if (cartDrawer) cartDrawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    });
    if (overlay) overlay.addEventListener('click', () => {
        if (cartDrawer) cartDrawer.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Render Cart
    function renderCart() {
        let total = 0;

        if (cartBadge) {
            cartBadge.textContent = state.cart.reduce((acc, item) => acc + item.quantity, 0);
        }

        // Render to drawer (if it still exists/is used)
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            if (state.cart.length === 0) {
                cartItemsContainer.innerHTML = '<p style="color:var(--gray-500);font-size:14px;text-align:center;margin-top:20px;">Your cart is empty.</p>';
            } else {
                state.cart.forEach(item => {
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
                                <span class="cart-item-remove" data-id="${item.id}" style="cursor:pointer; color:var(--red); font-size:12px; margin-left:10px;">Remove</span>
                            </div>
                        </div>
                    `;
                    cartItemsContainer.appendChild(div);
                });
            }
        }

        // Render to full cart page
        const fullCartItems = document.getElementById('full-cart-items');
        if (fullCartItems) {
            fullCartItems.innerHTML = '';
            if (state.cart.length === 0) {
                fullCartItems.innerHTML = `
                    <div style="padding: 40px; text-align: center; border: 1px solid var(--border-color); border-radius: 12px; background: var(--white);">
                        <p style="color: var(--gray-500); margin-bottom: 16px;">Your cart is empty.</p>
                        <button class="btn-primary" onclick="switchPage('catalog')" style="padding: 12px 24px; font-size: 14px;">Continue Shopping</button>
                    </div>`;
            } else {
                state.cart.forEach(item => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <div class="cart-item" style="display: flex; gap: 16px; margin-bottom: 16px; background: var(--white); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color);">
                            <div class="cart-item-img" style="width: 80px; height: 80px; background: var(--gray-50); border-radius: 6px; display: flex; align-items: center; justify-content: center;"><img src="${item.img}" style="width: 80%; height: 80%; object-fit: contain;"></div>
                            <div class="cart-item-info" style="flex: 1;">
                                <div class="cart-item-name" style="font-size: 15px; font-weight: 600; margin-bottom: 8px;">${item.name}</div>
                                <div class="cart-item-price" style="font-size: 15px; color: var(--primary); font-weight: 700; margin-bottom: 12px;">$${item.price.toFixed(2)}</div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div class="cart-item-qty" style="display: flex; align-items: center; gap: 12px;">
                                        <button class="qty-btn minus" data-id="${item.id}" style="width: 28px; height: 28px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--white); cursor: pointer;">-</button>
                                        <span class="qty-num" style="font-size: 14px; font-weight: 600;">${item.quantity}</span>
                                        <button class="qty-btn plus" data-id="${item.id}" style="width: 28px; height: 28px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--white); cursor: pointer;">+</button>
                                    </div>
                                    <div class="cart-item-remove" data-id="${item.id}" style="font-size: 13px; color: var(--red); cursor: pointer; font-weight: 500;">Remove</div>
                                </div>
                            </div>
                        </div>
                    `;
                    fullCartItems.appendChild(div.firstElementChild);
                });
            }
        }

        // Render to checkout
        const checkoutItems = document.getElementById('checkout-items');
        if (checkoutItems) {
            checkoutItems.innerHTML = '';
            state.cart.forEach(item => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                        <div style="width: 60px; height: 60px; background: var(--gray-50); border-radius: 6px; display: flex; align-items: center; justify-content: center;"><img src="${item.img}" style="width: 80%; height: 80%; object-fit: contain;"></div>
                        <div style="flex: 1;">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                            <div style="font-size: 13px; color: var(--gray-500);">Qty: ${item.quantity}</div>
                        </div>
                        <div style="font-weight: 600; color: var(--gray-900);">$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `;
                checkoutItems.appendChild(div.firstElementChild);
            });
        }

        state.cart.forEach(item => {
            total += item.price * item.quantity;
        });
        const tax = total * 0.08; // 8% tax mock
        const finalTotal = total + tax;

        if (cartTotalAmount) cartTotalAmount.textContent = '$' + total.toFixed(2);

        const cartPageSubtotal = document.getElementById('cart-page-subtotal');
        if (cartPageSubtotal) cartPageSubtotal.textContent = '$' + total.toFixed(2);
        const cartPageTotal = document.getElementById('cart-page-total');
        if (cartPageTotal) cartPageTotal.textContent = '$' + finalTotal.toFixed(2);

        const checkoutSubtotal = document.getElementById('checkout-subtotal');
        if (checkoutSubtotal) checkoutSubtotal.textContent = '$' + total.toFixed(2);
        const checkoutTotal = document.getElementById('checkout-total');
        if (checkoutTotal) checkoutTotal.textContent = '$' + total.toFixed(2); // Free shipping, ignoring tax here for simplicity or add it if needed
    }

    // Cart Actions (unified for both containers)
    function handleCartAction(e) {
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
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', handleCartAction);
    }
    const fullCartItems = document.getElementById('full-cart-items');
    if (fullCartItems) {
        fullCartItems.addEventListener('click', handleCartAction);
    }

    window.cartClear = function () {
        state.cart = [];
        renderCart();
    };

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

    // --- Checkout Validation & Formatting Logic ---
    const ccNumber = document.getElementById('cc-number');
    const ccExp = document.getElementById('cc-exp');
    const ccCvc = document.getElementById('cc-cvc');
    const ccName = document.getElementById('cc-name');
    const checkoutSubmitBtn = document.getElementById('checkout-submit-btn');

    if (ccNumber) {
        ccNumber.addEventListener('input', function (e) {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 16) val = val.substring(0, 16);
            let formatted = val.match(/.{1,4}/g);
            e.target.value = formatted ? formatted.join(' ') : val;
            validateCheckoutForm();
        });
    }

    if (ccExp) {
        ccExp.addEventListener('input', function (e) {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 4) val = val.substring(0, 4);
            if (val.length >= 2) {
                let month = parseInt(val.substring(0, 2), 10);
                if (month > 12) month = 12;
                if (month === 0) month = '01';
                else if (month < 10 && val.substring(0, 2) !== '0' + month) month = '0' + month;
                val = month.toString() + val.substring(2);
            }
            if (val.length > 2) {
                e.target.value = val.substring(0, 2) + '/' + val.substring(2);
            } else {
                e.target.value = val;
            }
            validateCheckoutForm();
        });
    }

    if (ccCvc) {
        ccCvc.addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/\D/g, '');
            validateCheckoutForm();
        });
    }

    if (ccName) {
        ccName.addEventListener('input', validateCheckoutForm);
    }

    // Listen to shipping inputs as well
    document.querySelectorAll('.checkout-input').forEach(input => {
        if (!['cc-number', 'cc-exp', 'cc-cvc', 'cc-name'].includes(input.id)) {
            input.addEventListener('input', validateCheckoutForm);
        }
    });

    function validateCheckoutForm() {
        if (!checkoutSubmitBtn) return;

        let isValid = true;

        // Basic required check for all inputs
        document.querySelectorAll('.checkout-input').forEach(input => {
            if (!input.value.trim() && input.hasAttribute('required')) {
                isValid = false;
            }
        });

        // Specific CC checks
        if (ccNumber && ccNumber.value.replace(/\D/g, '').length < 15) isValid = false;
        if (ccExp && ccExp.value.length < 5) isValid = false;
        if (ccCvc && ccCvc.value.length < 3) isValid = false;

        checkoutSubmitBtn.disabled = !isValid;
    }

    // Submit handler
    window.submitCheckoutForm = async function () {
        if (checkoutSubmitBtn.disabled) return;

        // Change btn state to show loading
        const originalText = checkoutSubmitBtn.innerHTML;
        checkoutSubmitBtn.innerHTML = 'Processing...';
        checkoutSubmitBtn.disabled = true;

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('checkout-email').value,
                    fname: document.getElementById('checkout-fname').value,
                    lname: document.getElementById('checkout-lname').value,
                    address: document.getElementById('checkout-address').value,
                    city: document.getElementById('checkout-city').value,
                    zip: document.getElementById('checkout-zip').value,
                    cart: state.cart
                })
            });

            if (response.ok) {
                window.cartClear();
                if (typeof window.switchPage === 'function') window.switchPage('order-confirmed');
            } else {
                if (window.showToast) window.showToast('Checkout failed. Please try again.', 'error');
                checkoutSubmitBtn.innerHTML = originalText;
                checkoutSubmitBtn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            if (window.showToast) window.showToast('Network error.', 'error');
            checkoutSubmitBtn.innerHTML = originalText;
            checkoutSubmitBtn.disabled = false;
        }
    };
});
