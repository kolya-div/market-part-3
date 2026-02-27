document.addEventListener('DOMContentLoaded', () => {

    // Simple routing stub for client side interactions if needed, though Flask will serve pages
    window.switchPage = function (pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const p = document.getElementById('page-' + pageId);
        if (p) p.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Auto-calculate discount in admin panel
    const initDiscountCalculator = () => {
        const priceInput = document.getElementById('base-price');
        const discountInput = document.getElementById('discount-percentage');
        const finalPriceDisplay = document.getElementById('final-price-display');

        if (priceInput && discountInput && finalPriceDisplay) {
            const calculate = () => {
                const base = parseFloat(priceInput.value) || 0;
                const perc = parseFloat(discountInput.value) || 0;
                const final = base - (base * (perc / 100));
                finalPriceDisplay.textContent = `$${final.toFixed(2)}`;
            };
            priceInput.addEventListener('input', calculate);
            discountInput.addEventListener('input', calculate);
        }
    };
    initDiscountCalculator();

    // SPA Category Filtering
    window.filterCategory = async function (categoryId, categoryName) {
        if (typeof window.switchPage === 'function') window.switchPage('catalog');

        // Mobile Drawer close if open
        const mobileDrawer = document.getElementById('mobile-drawer');
        const mobileOverlay = document.getElementById('mobile-overlay');
        if (mobileDrawer) mobileDrawer.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');

        const catalogGrid = document.querySelector('#page-catalog .products-grid');
        const catalogTitle = document.querySelector('#page-catalog .section-title');

        if (catalogTitle && categoryName) {
            catalogTitle.textContent = categoryName;
        }

        if (catalogGrid) {
            // Skeleton while loading
            catalogGrid.innerHTML = `
                <div style="background:#f1f3f5; border-radius:16px; height:320px; animation: pulse 1.5s infinite;"></div>
                <div style="background:#f1f3f5; border-radius:16px; height:320px; animation: pulse 1.5s infinite;"></div>
                <div style="background:#f1f3f5; border-radius:16px; height:320px; animation: pulse 1.5s infinite;"></div>
                <div style="background:#f1f3f5; border-radius:16px; height:320px; animation: pulse 1.5s infinite;"></div>
            `;

            try {
                const url = categoryId ? `/api/products?category_id=${categoryId}` : '/api/products';
                const response = await fetch(url);
                const data = await response.json();

                catalogGrid.innerHTML = ''; // clear skeleton

                if (!data.products || data.products.length === 0) {
                    catalogGrid.innerHTML = `<div style="grid-column: 1/-1; padding:40px; text-align:center; color:var(--gray-500); font-size:16px;">No products found in this category.</div>`;
                    document.querySelector('#page-catalog .section-sub').textContent = `Showing 0 results`;
                    return;
                }

                document.querySelector('#page-catalog .section-sub').textContent = `Showing 1-${data.products.length} of ${data.products.length} results`;

                data.products.forEach(prod => {
                    const priceRaw = parseFloat(prod.price) || 0;
                    const priceFormatted = '$' + priceRaw.toLocaleString(undefined, { minimumFractionDigits: 0 });

                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.setAttribute('data-id', prod.id);
                    card.innerHTML = `
                        <div class="product-img" style="display:flex; justify-content:center; align-items:center; height:200px; background:var(--gray-50); border-radius:12px; margin-bottom:16px; padding:20px;">
                            <img src="${prod.image_url || 'https://via.placeholder.com/200'}" alt="${prod.name}" style="max-height:100%; object-fit:contain;">
                        </div>
                        <div class="product-info">
                            <div class="product-name" style="font-weight:600; margin-bottom:4px;">${prod.name}</div>
                            <div class="product-desc" style="font-size:13px; color:var(--gray-500); margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${prod.description || ''}</div>
                            <div class="product-price" style="font-weight:700; color:var(--gray-900); font-size:16px; margin-bottom:16px;">
                                ${priceFormatted}
                            </div>
                            <button class="add-cart-btn btn-primary" style="width:100%; padding:10px; text-align:center; border:none; border-radius:8px; cursor:pointer;" onclick="event.preventDefault(); window.showToast('Added to cart');">Add to Cart</button>
                        </div>
                    `;
                    catalogGrid.appendChild(card);
                });
            } catch (err) {
                console.error('Error fetching products:', err);
                catalogGrid.innerHTML = `<div style="grid-column: 1/-1; padding:40px; text-align:center; color:var(--red); font-size:16px;">Error loading products.</div>`;
            }
        }
    };
});
