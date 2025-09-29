// SCRIPT GLOBAL POUR CORRIGER LE MENU HAMBURGER MOBILE

document.addEventListener('DOMContentLoaded', function() {
    // Ajouter les boutons de navigation mobile si pas présents
    if (!document.querySelector('.mobile-nav-buttons')) {
        const mobileNavButtons = document.createElement('div');
        mobileNavButtons.className = 'mobile-nav-buttons';
        mobileNavButtons.innerHTML = `
            <div>
                <button onclick="window.location.href='vip-space.html'">🏠 VIP</button>
                <button onclick="window.location.href='trading-dashboard.html'">📊 Dashboard</button>
                <button onclick="window.history.back()">🔙 Retour</button>
            </div>
        `;
        document.body.appendChild(mobileNavButtons);
    }
    
    // Corriger le menu hamburger
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');
    
    if (mobileMenuBtn && navLinks) {
        // Supprimer les anciens listeners
        mobileMenuBtn.replaceWith(mobileMenuBtn.cloneNode(true));
        const newMobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        newMobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Menu hamburger cliqué');
            
            navLinks.classList.toggle('mobile-open');
            if (navOverlay) {
                navOverlay.classList.toggle('active');
            }
        });
        
        // Fermer le menu en cliquant sur l'overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', function() {
                navLinks.classList.remove('mobile-open');
                navOverlay.classList.remove('active');
            });
        }
        
        // Fermer le menu en cliquant sur un lien
        const menuLinks = navLinks.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('mobile-open');
                if (navOverlay) {
                    navOverlay.classList.remove('active');
                }
            });
        });
        
        console.log('Menu hamburger initialisé');
    } else {
        console.warn('Éléments menu hamburger manquants');
    }
});

// Fonction utilitaire pour ajouter le menu hamburger si manquant
function ensureMobileMenu() {
    const header = document.querySelector('header');
    if (header && !document.getElementById('mobileMenuBtn')) {
        const mobileMenuHTML = `
            <button id="mobileMenuBtn" class="mobile-menu-btn">☰</button>
            <nav class="mobile-nav" id="mobileNav">
                <ul class="nav-links" id="navLinks">
                    <li><a href="vip-space.html">🏠 Accueil VIP</a></li>
                    <li><a href="trading-dashboard.html">📊 Dashboard</a></li>
                    <li><a href="index.html">🚪 Déconnexion</a></li>
                </ul>
            </nav>
            <div id="navOverlay" class="nav-overlay"></div>
        `;
        header.insertAdjacentHTML('beforeend', mobileMenuHTML);
    }
}