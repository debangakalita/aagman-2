// Page transition system with mouse wheel scrolling
document.addEventListener('DOMContentLoaded', function() {
    const pages = document.querySelectorAll('.page-section');
    let currentPage = 0;
    let isTransitioning = false;
    const transitionDuration = 1000; // milliseconds

    // Menu toggle functionality
    const navMenu = document.getElementById('navMenu');
    const menuIcon = document.getElementById('menuIcon');
    const closeMenuIcon = document.getElementById('closeMenuIcon');
    const navLinks = document.querySelectorAll('.nav-link');
    let isMenuOpen = false;

    // Function to toggle menu
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        if (navMenu) {
            navMenu.classList.toggle('open', isMenuOpen);
        }
        // Toggle active state on all menu icons
        if (menuIcon) {
            menuIcon.classList.toggle('active', isMenuOpen);
        }
        const allMenuToggles = document.querySelectorAll('.menu-toggle');
        allMenuToggles.forEach(toggle => {
            if (toggle !== menuIcon) {
                toggle.classList.toggle('active', isMenuOpen);
            }
        });
        // Prevent body scroll when menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    // Menu icon click handler
    if (menuIcon) {
        menuIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Also handle clicks on other hamburger menus (if they exist)
    const allMenuIcons = document.querySelectorAll('.menu-toggle');
    allMenuIcons.forEach(icon => {
        if (icon !== menuIcon) {
            icon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleMenu();
            });
        }
    });

    // Navigation link click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageIndex = parseInt(this.getAttribute('data-page'));
            if (!isNaN(pageIndex)) {
                // Close menu
                isMenuOpen = false;
                if (navMenu) {
                    navMenu.classList.remove('open');
                }
                if (menuIcon) {
                    menuIcon.classList.remove('active');
                }
                const allMenuToggles = document.querySelectorAll('.menu-toggle');
                allMenuToggles.forEach(toggle => {
                    toggle.classList.remove('active');
                });
                document.body.style.overflow = '';
                // Navigate to page
                goToPage(pageIndex);
            }
        });
    });

    // Close menu when clicking outside
    if (navMenu) {
        navMenu.addEventListener('click', function(e) {
            if (e.target === navMenu) {
                toggleMenu();
            }
        });
    }

    // Close menu icon click handler
    if (closeMenuIcon) {
        closeMenuIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });

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
        // Prevent navigation if out of bounds
        if (pageIndex < 0 || pageIndex >= pages.length) {
            return;
        }

        // Note: isTransitioning is now set in handleNavigation before calling this function
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
    const actionDebounceDelay = 1200; // milliseconds - longer than transition duration to ensure no overlap

    function handleNavigation(direction) {
        // CRITICAL: Check and set flags in a single atomic operation to prevent race conditions
        // This must be the FIRST check - if transitioning, immediately return
        if (isTransitioning) {
            return false;
        }

        // Check bounds BEFORE setting any flags
        // This prevents isTransitioning from being stuck if we're at the edge
        const nextPageIndex = direction > 0 ? currentPage + 1 : currentPage - 1;
        if (nextPageIndex < 0 || nextPageIndex >= pages.length) {
            // Already at the edge, don't process but don't block future scrolls
            return false;
        }

        // Get current time
        const currentTime = Date.now();

        // Debounce: only process if enough time has passed since last action
        // This is the SECOND check - prevents rapid-fire events
        if (currentTime - lastActionTime < actionDebounceDelay) {
            return false;
        }

        // ATOMIC OPERATION: Set all flags IMMEDIATELY and synchronously
        // This prevents any other event from processing - MUST happen before goToPage
        isTransitioning = true;
        lastActionTime = currentTime;

        // Navigate based on direction - call synchronously
        // isTransitioning is already set, so no other events can process
        // We already checked bounds above, so this will always succeed
        goToPage(nextPageIndex);

        return true;
    }

    // Mouse wheel and trackpad handler
    function handleWheel(e) {
        // EARLY EXIT: If already transitioning, prevent default and return immediately
        // This is the first line of defense
        if (isTransitioning) {
            e.preventDefault();
            return;
        }

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
        // EARLY EXIT: If already transitioning, prevent default and return immediately
        if (isTransitioning) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' ||
                e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
            }
            return;
        }

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
