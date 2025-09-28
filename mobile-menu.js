// Mobile Menu Handler - Misterpips
// Gestion globale des menus mobiles pour toutes les pages

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initTouchOptimizations();
});

function initMobileMenu() {
    // Créer le bouton mobile s'il n'existe pas
    let mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links') || document.getElementById('navLinks');
    
    if (!mobileMenuBtn && navLinks) {
        // Créer le bouton mobile
        mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.id = 'mobileMenuBtn';
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.style.display = 'none';
        
        // Insérer le bouton avant la navigation
        const nav = navLinks.parentElement;
        nav.insertBefore(mobileMenuBtn, navLinks);
    }
    
    if (mobileMenuBtn && navLinks) {
        // Gestionnaire du bouton mobile
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('mobile-open');
            mobileMenuBtn.innerHTML = navLinks.classList.contains('mobile-open') ? '✕' : '☰';
            
            // Empêcher le scroll du body quand le menu est ouvert
            if (navLinks.classList.contains('mobile-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Fermer le menu quand on clique sur un lien
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('mobile-open');
                mobileMenuBtn.innerHTML = '☰';
                document.body.style.overflow = '';
            }
        });
        
        // Fermer le menu quand on clique à l'extérieur
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && navLinks.classList.contains('mobile-open')) {
                navLinks.classList.remove('mobile-open');
                mobileMenuBtn.innerHTML = '☰';
                document.body.style.overflow = '';
            }
        });
        
        // Fermer le menu avec la touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
                navLinks.classList.remove('mobile-open');
                mobileMenuBtn.innerHTML = '☰';
                document.body.style.overflow = '';
            }
        });
    }
}

function initTouchOptimizations() {
    // Améliorer l'expérience tactile
    const buttons = document.querySelectorAll('button, .btn, .cta-button');
    
    buttons.forEach(button => {
        // Ajouter un feedback tactile
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
    
    // Optimiser les tableaux pour le scroll horizontal
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-container';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
    
    // Optimiser les modales pour mobile
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('touchmove', (e) => {
            // Empêcher le scroll du body derrière la modale
            if (e.target === modal) {
                e.preventDefault();
            }
        });
    });
}

// Fonction utilitaire pour détecter si on est sur mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Fonction utilitaire pour détecter si on est sur tablette
function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

// Gestionnaire de redimensionnement
window.addEventListener('resize', () => {
    const navLinks = document.querySelector('.nav-links') || document.getElementById('navLinks');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    // Fermer le menu mobile si on passe en desktop
    if (window.innerWidth > 1024 && navLinks && navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        if (mobileMenuBtn) {
            mobileMenuBtn.innerHTML = '☰';
        }
        document.body.style.overflow = '';
    }
});

// Optimisations pour les performances sur mobile
if (isMobile()) {
    // Réduire les animations sur mobile pour améliorer les performances
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
    
    // Optimiser les images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
    });
}

// Export des fonctions pour utilisation globale
window.mobileMenu = {
    init: initMobileMenu,
    isMobile,
    isTablet
};