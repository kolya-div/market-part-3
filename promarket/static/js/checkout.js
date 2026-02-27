document.addEventListener('DOMContentLoaded', () => {
    const ccName = document.getElementById('cc-name');
    const ccNum = document.getElementById('cc-number');
    const ccExp = document.getElementById('cc-exp');
    const ccCvv = document.getElementById('cc-cvv');
    const form = document.getElementById('checkout-form');
    const submitBtn = document.getElementById('checkout-submit');
    const brand = document.getElementById('card-brand');

    if (!form) return;

    // Validation Logic
    const validate = () => {
        const isNameValid = ccName.value.trim().length >= 3;
        const isNumValid = ccNum.value.replace(/\s/g, '').length >= 13;
        const isExpValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(ccExp.value);
        const isCvvValid = ccCvv.value.length >= 3;

        submitBtn.disabled = !(isNameValid && isNumValid && isExpValid && isCvvValid);
    };

    ccName.addEventListener('input', validate);
    ccCvv.addEventListener('input', validate);

    // CC Number Formatting & Brand detection
    ccNum.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.startsWith('4')) brand.textContent = 'VISA';
        else if (val.startsWith('5')) brand.textContent = 'MC';
        else brand.textContent = '';

        let formatted = '';
        for (let i = 0; i < val.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += val[i];
        }
        e.target.value = formatted;
        validate();
    });

    // CC Exp Formatting
    ccExp.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        e.target.value = val;
        validate();
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let currentCart = JSON.parse(localStorage.getItem('promarket_cart')) || [];
        if (currentCart.length === 0) {
            alert("Cart is empty!");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: currentCart,
                    cc: ccNum.value.replace(/\s/g, '')
                })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.removeItem('promarket_cart');
                window.location.href = `/confirmation/${data.order_id}`;
            } else {
                alert(data.error || "Checkout failed");
                submitBtn.disabled = false;
                submitBtn.textContent = 'Complete Order';
            }
        } catch (err) {
            alert("An error occurred");
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Order';
        }
    });
});
