/**
 * The Biblical Family Tree - Interactive Navigation
 * Features: Sidebar active tracking, smooth scrolling, scroll-to-top button, 
 * mobile-responsive sidebar behavior, and URL hash handling
 */
(function() {
    'use strict';

    // ============ DOM ELEMENTS ============
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const sidebarNav = document.getElementById('sidebarNav');

    // Collect all section IDs from sidebar links
    const sectionIds = Array.from(sidebarLinks).map(link => {
        const href = link.getAttribute('href');
        return href ? href.substring(1) : '';
    }).filter(Boolean);

    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    // ============ GET CURRENT VISIBLE SECTION ============
    function getCurrentSectionId() {
        let currentId = sectionIds[0] || 'home';
        const viewportDetectionZone = window.innerHeight / 3;

        // Loop from bottom to top to find the section closest to the top of viewport
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (!section) continue;
            
            const rect = section.getBoundingClientRect();
            
            // If the top of the section is above or near the detection zone, it's the current one
            if (rect.top <= viewportDetectionZone + 50) {
                currentId = sectionIds[i];
                break;
            }
        }
        
        return currentId;
    }

    // ============ UPDATE ACTIVE SIDEBAR LINK ============
    function updateActiveLink() {
        const currentId = getCurrentSectionId();
        
        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            const targetId = href.substring(1);
            
            if (targetId === currentId) {
                link.classList.add('active');
                
                // Ensure the active link is visible in the sidebar (scroll into view if needed)
                if (sidebarNav && window.innerWidth > 900) {
                    const sidebarRect = sidebarNav.getBoundingClientRect();
                    const linkRect = link.getBoundingClientRect();
                    
                    if (linkRect.top < sidebarRect.top + 60 || linkRect.bottom > sidebarRect.bottom - 20) {
                        link.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            } else {
                link.classList.remove('active');
            }
        });
    }

    // ============ SMOOTH SCROLL TO SECTION ============
    function scrollToSection(targetId) {
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Calculate offset based on sidebar height (if sticky) or a default value
            let navOffset = 30; // default padding
            
            if (sidebarNav && window.innerWidth > 900) {
                // Desktop: sidebar is to the left, so no top offset needed beyond padding
                navOffset = 30;
            } else if (sidebarNav) {
                // Mobile: sidebar is at top, account for its height
                navOffset = sidebarNav.offsetHeight + 20;
            }
            
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update active link immediately for responsive feel
            sidebarLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && href.substring(1) === targetId) {
                    link.classList.add('active');
                }
            });
        }
    }

    // ============ SIDEBAR LINK CLICK HANDLER ============
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            const href = this.getAttribute('href');
            if (!href) return;
            
            const targetId = href.substring(1);
            scrollToSection(targetId);
            
            // On mobile, you might optionally collapse or adjust the sidebar
            // For now, we just scroll and update active state
        });

        // Keyboard accessibility: allow Enter/Space to trigger click
        link.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.click();
            }
        });
    });

    // ============ SCROLL TO TOP BUTTON ============
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Show/hide button based on scroll position with smooth opacity transition
        function updateScrollButton() {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollPosition > 500) {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.pointerEvents = 'auto';
                scrollTopBtn.setAttribute('aria-hidden', 'false');
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.pointerEvents = 'none';
                scrollTopBtn.setAttribute('aria-hidden', 'true');
            }
        }

        window.addEventListener('scroll', updateScrollButton, { passive: true });
        
        // Initial state
        updateScrollButton();
    }

    // ============ THROTTLED SCROLL LISTENER FOR ACTIVE LINK ============
    let scrollTicking = false;
    
    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            window.requestAnimationFrame(function() {
                updateActiveLink();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // ============ HANDLE INITIAL URL HASH ============
    function handleInitialHash() {
        if (window.location.hash) {
            const hashId = window.location.hash.substring(1);
            
            // Check if the hash matches any of our section IDs
            if (sectionIds.includes(hashId)) {
                // Small delay to ensure DOM is fully rendered and CSS is applied
                setTimeout(function() {
                    scrollToSection(hashId);
                }, 150);
            }
        }
    }

    // ============ HANDLE BROWSER BACK/FORWARD (HASH CHANGES) ============
    window.addEventListener('hashchange', function() {
        if (window.location.hash) {
            const hashId = window.location.hash.substring(1);
            if (sectionIds.includes(hashId)) {
                scrollToSection(hashId);
            }
        }
    });

    // ============ INITIALIZATION ============
    function initialize() {
        // Set initial active link
        updateActiveLink();
        
        // Handle any hash in the URL
        handleInitialHash();
        
        // Log initialization for debugging (can be removed in production)
        console.log('🌳 Biblical Family Tree navigation initialized');
        console.log('   ' + sectionIds.length + ' sections available for navigation');
    }

    // ============ STARTUP ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready
        initialize();
    }

    // ============ OPTIONAL: CLOSE MOBILE SIDEBAR ON LINK CLICK ============
    // If you add a mobile toggle button in the future, 
    // you can use this pattern to close the sidebar after navigation
    
    /*
    const mobileToggle = document.getElementById('mobileSidebarToggle');
    
    if (mobileToggle) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 900 && sidebarNav.classList.contains('open')) {
                    sidebarNav.classList.remove('open');
                    mobileToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
    */

    // ============ OPTIONAL: INTERSECTION OBSERVER (MORE PRECISE) ============
    // For even more precise active link tracking, you could use IntersectionObserver.
    // The current scroll-based approach is simpler and works well for most use cases.
    // Uncomment below if you prefer IntersectionObserver approach:
    
    /*
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    sidebarLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);
        
        sections.forEach(section => {
            if (section) observer.observe(section);
        });
    }
    */

})();