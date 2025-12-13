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

    // Unified scroll/trackpad/keyboard handler
    let lastActionTime = 0;
    let isProcessingAction = false; // Additional flag to prevent concurrent processing
    const actionDebounceDelay = 1100; // milliseconds - slightly longer than transition duration

    function handleNavigation(direction) {
        // Don't process if we're currently transitioning or processing an action
        if (isTransitioning || isProcessingAction) {
            return false;
        }

        // Get current time
        const currentTime = Date.now();

        // Debounce: only process if enough time has passed since last action
        if (currentTime - lastActionTime < actionDebounceDelay) {
            return false;
        }

        // Set processing flag immediately to prevent concurrent calls
        isProcessingAction = true;
        
        // Immediately update last action time BEFORE processing
        // This prevents any other actions from being processed
        lastActionTime = currentTime;

        // Navigate based on direction
        // goToPage will set isTransitioning = true, preventing further actions
        if (direction > 0) {
            // Next page
            goToPage(currentPage + 1);
        } else {
            // Previous page
            goToPage(currentPage - 1);
        }

        // Reset processing flag after a short delay (allows goToPage to set isTransitioning)
        setTimeout(() => {
            isProcessingAction = false;
        }, 50);

        return true;
    }

    // Mouse wheel and trackpad handler
    function handleWheel(e) {
        // Prevent default scrolling
        e.preventDefault();

        // Check both vertical (deltaY) and horizontal (deltaX) scroll
        // Trackpad gestures can send both, so we prioritize the larger one
        const deltaY = e.deltaY || e.detail || -e.wheelDelta || 0;
        const deltaX = e.deltaX || 0;
        
        // Determine which direction has more movement
        const absDeltaY = Math.abs(deltaY);
        const absDeltaX = Math.abs(deltaX);
        
        let direction = 0;
        
        if (absDeltaY > absDeltaX) {
            // Vertical scroll: down/right = next page, up/left = previous page
            direction = deltaY > 0 ? 1 : -1;
        } else if (absDeltaX > 0) {
            // Horizontal scroll: right/down = next page, left/up = previous page
            direction = deltaX > 0 ? 1 : -1;
        } else {
            // No significant movement
            return;
        }

        handleNavigation(direction);
    }

    // Add wheel event listeners (cross-browser compatibility)
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousewheel', handleWheel, { passive: false });
    window.addEventListener('DOMMouseScroll', handleWheel, { passive: false });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Next page: ArrowDown, ArrowRight, PageDown
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
            e.preventDefault();
            handleNavigation(1);
        } 
        // Previous page: ArrowUp, ArrowLeft, PageUp
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            handleNavigation(-1);
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
