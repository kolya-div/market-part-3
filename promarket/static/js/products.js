document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    const filterLinks = document.querySelectorAll('.cat-link');

    async function loadProducts(category = '') {
        // Skeleton logic
        productGrid.innerHTML = `
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton"></div>
            <div class="skeleton"></div>
        `;

        try {
            const url = category ? `/api/products?category=${encodeURIComponent(category)}` : '/api/products';
            const res = await fetch(url);
            const products = await res.json();

            productGrid.innerHTML = '';

            if (products.length === 0) {
                productGrid.style.display = 'block';
                productGrid.innerHTML = '<div style="text-align:center; color:var(--muted); padding: 40px;"><h3>No products found in this category.</h3></div>';
                return;
            }

            productGrid.style.display = '';

            products.forEach(p => {
                const div = document.createElement('div');
                div.className = 'product-card';
                div.innerHTML = `
                    <div style="text-align:center; padding: 20px;">
                        <img src="${p.image_url}" class="product-img" alt="${p.name}">
                    </div>
                    <div class="product-title">${p.name}</div>
                    <div class="product-category">${p.category}</div>
                    <div class="product-price">$${p.price.toFixed(2)}</div>
                    <button class="btn-primary" onclick='addToCart(${JSON.stringify(p)})'>Add to Cart</button>
                `;
                productGrid.appendChild(div);
            });
        } catch (e) {
            productGrid.innerHTML = '<p>Error loading products.</p>';
        }
    }

    // Initial load
    loadProducts('');

    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            filterLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.dataset.category;
            loadProducts(cat);
        });
    });

    // Mobile Hamburger
    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            alert('Mobile menu clicked!'); // Simplified mobile drawer fallback
        });
    }
});
