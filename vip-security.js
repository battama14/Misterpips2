// Système de sécurité VIP centralisé
console.log('🔒 Chargement du système de sécurité VIP...');

class VIPSecurity {
    constructor() {
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.config = window.SECURITY_CONFIG || {
            publicPages: ['index.html'],
            vipPages: ['vip-space.html', 'trading-dashboard.html', 'planning-forex.html'],
            adminPages: ['admin-dashboard.html', 'admin-vip.html'],
            adminEmails: ['admin@misterpips.com']
        };
        this.init();
    }

    init() {
        console.log('🔍 Page actuelle:', this.currentPage);
        
        // Vérifier le type de page
        if (this.config.publicPages.includes(this.currentPage)) {
            console.log('✅ Page publique - accès libre');
            this.showPage();
            return;
        }
        
        if (this.config.adminPages.includes(this.currentPage)) {
            console.log('🔒 Page admin - vérification admin');
            this.checkAdminAccess();
            return;
        }
        
        if (this.config.vipPages.includes(this.currentPage)) {
            console.log('🔒 Page VIP - vérification VIP');
            this.checkVIPAccess();
            return;
        }
        
        // Par défaut, traiter comme page publique
        console.log('⚠️ Page non configurée - traitement comme publique');
        this.showPage();
    }

    async checkVIPAccess() {
        console.log('🔍 Vérification de l\'accès VIP...');
        
        try {
            await this.waitForFirebase();
            const user = await this.getCurrentUser();
            
            if (!user) {
                console.log('❌ Pas d\'utilisateur connecté');
                this.redirectToLogin(this.config.messages?.notAuthenticated || 'Connexion requise');
                return;
            }

            console.log('✅ Utilisateur connecté:', user.email, user.uid);
            
            const isVIP = await this.checkVIPStatus(user.uid);
            
            if (!isVIP) {
                console.log('❌ Statut VIP non trouvé pour:', user.uid);
                this.redirectToHome(this.config.messages?.notVIP || 'Accès VIP requis');
                return;
            }

            console.log('✅ Accès VIP autorisé pour:', user.email);
            this.showPage();
            
        } catch (error) {
            console.error('❌ Erreur de sécurité VIP:', error);
            this.redirectToLogin(this.config.messages?.authError || 'Erreur d\'authentification');
        }
    }
    
    async checkAdminAccess() {
        console.log('🔍 Vérification de l\'accès Admin...');
        
        try {
            await this.waitForFirebase();
            const user = await this.getCurrentUser();
            
            if (!user) {
                this.redirectToLogin(this.config.messages?.notAuthenticated || 'Connexion requise');
                return;
            }

            if (!this.config.adminEmails.includes(user.email)) {
                this.redirectToHome(this.config.messages?.notAdmin || 'Accès administrateur requis');
                return;
            }

            console.log('✅ Accès Admin autorisé pour:', user.email);
            this.showPage();
            
        } catch (error) {
            console.error('❌ Erreur de sécurité Admin:', error);
            this.redirectToLogin(this.config.messages?.authError || 'Erreur d\'authentification');
        }
    }

    waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebaseAuth) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    getCurrentUser() {
        return new Promise((resolve) => {
            if (window.firebaseAuth) {
                const unsubscribe = window.firebaseAuth.onAuthStateChanged((user) => {
                    unsubscribe();
                    resolve(user);
                });
            } else {
                resolve(null);
            }
        });
    }

    async checkVIPStatus(uid) {
        try {
            // Vérifier dans Firebase Database si l'utilisateur a le statut VIP
            if (window.firebaseDB) {
                const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const userRef = ref(window.firebaseDB, `users/${uid}`);
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    return userData.isVIP === true;
                }
            }
            
            // Fallback: vérifier dans sessionStorage
            const vipStatus = sessionStorage.getItem('isVIP');
            return vipStatus === 'true';
            
        } catch (error) {
            console.error('Erreur vérification VIP:', error);
            return false;
        }
    }

    redirectToLogin(message) {
        console.log('🚫 Redirection vers login:', message);
        sessionStorage.setItem('redirectMessage', message);
        window.location.href = 'index.html';
    }

    redirectToHome(message) {
        console.log('🚫 Redirection vers accueil:', message);
        alert(message);
        window.location.href = 'index.html';
    }

    showPage() {
        // Afficher la page (retirer le masquage si nécessaire)
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
    }

    // Méthode pour masquer la page pendant la vérification
    hidePage() {
        document.body.style.visibility = 'hidden';
        document.body.style.opacity = '0';
    }
}

// Masquer les pages protégées immédiatement
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const config = window.SECURITY_CONFIG || {
        publicPages: ['index.html'],
        vipPages: ['vip-space.html', 'trading-dashboard.html', 'planning-forex.html'],
        adminPages: ['admin-dashboard.html', 'admin-vip.html']
    };
    
    const isProtected = [...config.vipPages, ...config.adminPages].includes(currentPage);
    
    if (isProtected) {
        document.body.style.visibility = 'hidden';
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        console.log('🔒 Page protégée masquée:', currentPage);
    }
});

// Initialiser la sécurité après chargement de la config
window.addEventListener('load', function() {
    // Attendre que la configuration soit chargée
    const initSecurity = () => {
        if (window.SECURITY_CONFIG) {
            new VIPSecurity();
        } else {
            setTimeout(initSecurity, 50);
        }
    };
    initSecurity();
});

// Protection contre l'inspection du code
document.addEventListener('keydown', function(e) {
    // Désactiver F12, Ctrl+Shift+I, Ctrl+U
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        console.log('🚫 Inspection désactivée pour la sécurité VIP');
        return false;
    }
});

// Protection contre le clic droit
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

console.log('🔒 Système de sécurité VIP initialisé');