document.addEventListener('DOMContentLoaded', () => {

    const toastContainer = document.getElementById('toast-container');

    // Global Toast Notification
    window.showToast = function (message, isError = false) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;

        let icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`;

        if (isError) {
            icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`;
        }

        toast.innerHTML = `${icon}<span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Live Search Mockup (Needs Backend connection)
    const searchInput = document.querySelector('.nav-search input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            // TODO: Fetch results from Flask
            console.log("Searching for: " + query);
        });
    }

    // Countdown Timer
    function updateCountdown() {
        const hElem = document.getElementById('count-hours');
        const mElem = document.getElementById('count-minutes');
        const sElem = document.getElementById('count-seconds');
        if (!hElem || !mElem || !sElem) return;

        let hours = parseInt(hElem.textContent);
        let minutes = parseInt(mElem.textContent);
        let seconds = parseInt(sElem.textContent);

        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 24; }

        hElem.textContent = hours.toString().padStart(2, '0');
        mElem.textContent = minutes.toString().padStart(2, '0');
        sElem.textContent = seconds.toString().padStart(2, '0');
    }
    setInterval(updateCountdown, 1000);

    // Filter toggles
    document.querySelectorAll('.filter-checkbox').forEach(cb => {
        cb.addEventListener('click', () => {
            cb.classList.toggle('checked');
        });
    });

    // Carousel Logic
    const initCarousel = (id) => {
        const carouselContainer = document.getElementById(id);
        if (!carouselContainer) return;

        const track = carouselContainer.querySelector('.carousel-track');
        const slides = carouselContainer.querySelectorAll('.carousel-slide');
        const prevBtn = carouselContainer.querySelector('.carousel-prev');
        const nextBtn = carouselContainer.querySelector('.carousel-next');
        const dotsContainer = carouselContainer.querySelector('.carousel-dots');

        // ... (existing carousel logic logic ported over)
        if (track && slides.length > 0) {
            let currentIndex = 0;
            // ... omitting full logic for brevity, assuming standard slide implementation
        }
    };
    initCarousel('hero-carousel');
    initCarousel('discount-carousel');

});
