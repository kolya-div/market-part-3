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
});
