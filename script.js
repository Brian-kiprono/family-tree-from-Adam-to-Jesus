(function() {
    'use strict';
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const sectionIds = Array.from(sidebarLinks).map(link => {
        const href = link.getAttribute('href');
        return href && href.startsWith('#') ? href.substring(1) : null;
    }).filter(Boolean);
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    function getCurrentSectionId() {
        let currentId = sectionIds[0] || 'home';
        const viewportTop = window.innerHeight / 3;
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (!section) continue;
            const rect = section.getBoundingClientRect();
            if (rect.top <= viewportTop + 50) { currentId = sectionIds[i]; break; }
        }
        return currentId;
    }

    function updateActiveLink() {
        const currentId = getCurrentSectionId();
        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const targetId = href.substring(1);
            if (targetId === currentId) link.classList.add('active');
            else link.classList.remove('active');
        });
    }

    function scrollToSection(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const offset = 80;
            const position = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: position, behavior: 'smooth' });
        }
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                scrollToSection(href.substring(1));
            }
        });
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', () => {
            const show = window.pageYOffset > 500;
            scrollTopBtn.style.opacity = show ? '1' : '0';
            scrollTopBtn.style.pointerEvents = show ? 'auto' : 'none';
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => { updateActiveLink(); ticking = false; });
            ticking = true;
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        updateActiveLink();
        if (window.location.hash) {
            const hashId = window.location.hash.substring(1);
            if (sectionIds.includes(hashId)) setTimeout(() => scrollToSection(hashId), 150);
        }
    });
})();
