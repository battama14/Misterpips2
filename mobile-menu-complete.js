// Menu Mobile Complet - Misterpips
// Gestion universelle du menu hamburger pour toutes les pages

document.addEventListener('DOMContentLoaded', () => {
    initCompleteMobileMenu();
    initMobileOptimizations();
});

function initCompleteMobileMenu() {
    // Trouver ou créer les éléments nécessaires
    let mobileMenuBtn = document.getElementById('mobileMenuBtn');
    let navLinks = document.querySelector('.nav-links') || document.getElementById('navLinks');
    let nav = document.querySelector('nav');
    
    if (!nav) {
        console.warn('Navigation non trouvée');
        return;
    }

    // Créer le bouton mobile s'il n'existe pas
    if (!mobileMenuBtn && navLinks) {
        mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.id = 'mobileMenuBtn';
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.setAttribute('aria-label', 'Menu mobile');
        
        // Insérer le bouton dans le header
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(mobileMenuBtn);
        } else {
            nav.insertBefore(mobileMenuBtn, navLinks);
        }
    }

    // Créer l'overlay pour fermer le menu
    let overlay = document.getElementById('navOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'navOverlay';
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }

    if (!mobileMenuBtn || !navLinks) {
        console.warn('Éléments menu mobile manquants');
        return;
    }

    // Gestionnaire du bouton hamburger
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Gestionnaire de l'overlay
    overlay.addEventListener('click', () => {
        closeMobileMenu();
    });

    // Fermer le menu quand on clique sur un lien
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            closeMobileMenu();
        }
    });

    // Fermer avec la touche Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
            closeMobileMenu();
        }
    });

    // Fermer le menu lors du redimensionnement vers desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && navLinks.classList.contains('mobile-open')) {
            closeMobileMenu();
        }
    });

    function toggleMobileMenu() {
        const isOpen = navLinks.classList.contains('mobile-open');
        
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        navLinks.classList.add('mobile-open');
        overlay.classList.add('active');
        mobileMenuBtn.innerHTML = '✕';
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        
        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';
        
        // Animation des éléments de menu
        const menuItems = navLinks.querySelectorAll('li');
        menuItems.forEach((item, index) => {
            item.style.setProperty('--i', index + 1);
        });
    }

    function closeMobileMenu() {
        navLinks.classList.remove('mobile-open');
        overlay.classList.remove('active');
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        
        // Restaurer le scroll du body
        document.body.style.overflow = '';
    }

    // Exposer les fonctions globalement
    window.toggleMobileMenu = toggleMobileMenu;
    window.openMobileMenu = openMobileMenu;
    window.closeMobileMenu = closeMobileMenu;
}

function initMobileOptimizations() {
    // Optimisations tactiles
    const touchElements = document.querySelectorAll('button, .btn, .cta-button, a');
    
    touchElements.forEach(element => {
        // Feedback tactile
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
                this.style.transition = '';
            }, 100);
        });
    });

    // Optimiser les formulaires pour mobile
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // Éviter le zoom sur focus (iOS)
        input.addEventListener('focus', () => {
            if (isMobileDevice()) {
                const viewport = document.querySelector('meta[name=viewport]');
                if (viewport) {
                    viewport.setAttribute('content', 
                        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                }
            }
        });

        input.addEventListener('blur', () => {
            if (isMobileDevice()) {
                const viewport = document.querySelector('meta[name=viewport]');
                if (viewport) {
                    viewport.setAttribute('content', 
                        'width=device-width, initial-scale=1.0');
                }
            }
        });
    });

    // Optimiser les modales pour mobile
    const modals = document.querySelectorAll('.modal, .admin-modal, .vip-modal');
    modals.forEach(modal => {
        modal.addEventListener('touchmove', (e) => {
            // Empêcher le scroll du body derrière la modale
            if (e.target === modal) {
                e.preventDefault();
            }
        });
    });

    // Améliorer les liens externes
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Ajouter un petit délai pour le feedback visuel
            e.preventDefault();
            setTimeout(() => {
                window.open(link.href, '_blank');
            }, 100);
        });
    });
}

// Fonctions utilitaires
function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isTabletDevice() {
    return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768 && window.innerWidth <= 1024;
}

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Gestionnaire de performance pour mobile
if (isMobileDevice()) {
    // Réduire les animations sur mobile faible
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
    
    // Lazy loading des images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
    
    // Optimiser les événements de scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Actions après scroll
        }, 100);
    }, { passive: true });
}

// Gestionnaire d'orientation
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // Fermer le menu mobile lors du changement d'orientation
        if (window.closeMobileMenu) {
            window.closeMobileMenu();
        }
        
        // Recalculer les dimensions
        window.dispatchEvent(new Event('resize'));
    }, 100);
});

// Export des fonctions pour usage global
window.mobileMenuComplete = {
    init: initCompleteMobileMenu,
    isMobile: isMobileDevice,
    isTablet: isTabletDevice,
    isTouch: isTouchDevice
};