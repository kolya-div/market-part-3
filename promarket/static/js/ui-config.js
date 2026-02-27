// Fetch dynamic UI config payload
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch('/api/ui-assets');
        const assets = await res.json();

        // Find all data-ui-key elements and update them
        document.querySelectorAll('[data-ui-key]').forEach(el => {
            const key = el.dataset.uiKey;
            if (assets[key]) {
                if (el.tagName === 'INPUT') el.placeholder = assets[key];
                else el.textContent = assets[key];
            }
        });
    } catch (e) {
        console.warn("Failed to load dynamic UI assets", e);
    }
});
