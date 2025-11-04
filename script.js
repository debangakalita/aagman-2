// Page transition system with mouse wheel scrolling
document.addEventListener('DOMContentLoaded', function() {
    const pages = document.querySelectorAll('.page-section');
    let currentPage = 0;
    let isTransitioning = false;
    const transitionDuration = 1000; // milliseconds

    // Menu toggle functionality
    const menuIcon = document.getElementById('menuIcon');
    if (menuIcon) {
        menuIcon.addEventListener('click', function() {
            // Menu functionality can be added here
            console.log('Menu clicked');
        });
    }

    // Navigation arrows functionality
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');

    if (leftArrow) {
        leftArrow.addEventListener('click', function() {
            goToPage(currentPage - 1);
        });
    }

    if (rightArrow) {
        rightArrow.addEventListener('click', function() {
            goToPage(currentPage + 1);
        });
    }

    // Function to go to a specific page
    function goToPage(pageIndex) {
        // Prevent navigation if already transitioning or out of bounds
        if (isTransitioning || pageIndex < 0 || pageIndex >= pages.length) {
            return;
        }

        isTransitioning = true;
        const previousPage = currentPage;
        currentPage = pageIndex;

        // Update pages
        pages.forEach((page, index) => {
            if (index === currentPage) {
                // Current page: slide in from left
                page.classList.remove('translate-x-full', 'opacity-0', '-translate-x-full');
                page.classList.add('translate-x-0', 'opacity-100', 'active');
            } else if (index < currentPage) {
                // Previous pages: slide out to left
                page.classList.remove('translate-x-0', 'opacity-100', 'active', 'translate-x-full');
                page.classList.add('-translate-x-full', 'opacity-0');
            } else {
                // Future pages: positioned to the right (hidden)
                page.classList.remove('translate-x-0', 'opacity-100', 'active', '-translate-x-full');
                page.classList.add('translate-x-full', 'opacity-0');
            }
        });

        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, transitionDuration);
    }

    // Mouse wheel event handler
    let wheelTimeout;
    let lastWheelDirection = 0;

    function handleWheel(e) {
        // Prevent default scrolling
        e.preventDefault();

        // Clear existing timeout
        clearTimeout(wheelTimeout);

        // Determine scroll direction
        const delta = e.deltaY || e.detail || -e.wheelDelta;
        const direction = delta > 0 ? 1 : -1;

        // Only process if direction changed or enough time has passed
        if (direction !== lastWheelDirection || !wheelTimeout) {
            lastWheelDirection = direction;

            // Navigate based on scroll direction
            if (direction > 0) {
                // Scrolling down - go to next page
                goToPage(currentPage + 1);
            } else {
                // Scrolling up - go to previous page
                goToPage(currentPage - 1);
            }

            // Set timeout to prevent rapid scrolling
            wheelTimeout = setTimeout(() => {
                lastWheelDirection = 0;
            }, transitionDuration);
        }
    }

    // Add wheel event listeners (cross-browser compatibility)
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousewheel', handleWheel, { passive: false });
    window.addEventListener('DOMMouseScroll', handleWheel, { passive: false });

    // Keyboard navigation (optional)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            goToPage(currentPage + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            goToPage(currentPage - 1);
        }
    });

    // Touch swipe support for mobile (optional)
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - next page
                goToPage(currentPage + 1);
            } else {
                // Swipe down - previous page
                goToPage(currentPage - 1);
            }
        }
    }

    // Initialize first page
    goToPage(0);
});
