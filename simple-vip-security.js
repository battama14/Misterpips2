// Sécurité VIP RENFORCEE - Version sécurisée
console.log('🔒 Sécurité VIP renforcée chargée');

// Vérifier seulement si on est sur une page VIP
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const vipPages = ['vip-space.html', 'trading-dashboard.html', 'planning-forex.html', 'admin-dashboard-fixed.html'];

if (vipPages.includes(currentPage)) {
    console.log('🔍 Page VIP détectée:', currentPage);
    
    // PAS DE MASQUAGE - Laisser la page visible
    console.log('🔒 Vérification VIP en cours...');
    
    // Vérification OBLIGATOIRE avec Firebase
    const checkVIPAccessSecure = async () => {
        try {
            // Vérifier Firebase Auth d'abord
            if (!window.firebaseAuth || !window.firebaseAuth.auth) {
                throw new Error('Firebase non initialisé');
            }
            
            const user = window.firebaseAuth.auth.currentUser;
            if (!user) {
                throw new Error('Utilisateur non authentifié');
            }
            
            // Vérifier le statut VIP dans Firebase Database
            const { getDatabase, ref, get } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
            const db = getDatabase();
            const userRef = ref(db, `users/${user.uid}`);
            const snapshot = await get(userRef);
            
            if (!snapshot.exists() || !snapshot.val().isVIP) {
                throw new Error('Statut VIP non vérifié');
            }
            
            // ACCES AUTORISE
            console.log('✅ Accès VIP sécurisé autorisé');
            sessionStorage.setItem('firebaseUID', user.uid);
            sessionStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('isVIP', 'true');
            sessionStorage.setItem('vipVerified', Date.now());
            
        } catch (error) {
            console.log('❌ Accès VIP refusé:', error.message);
            alert('Accès VIP requis. Veuillez vous connecter.');
            
            // Nettoyer les données locales
            sessionStorage.clear();
            localStorage.removeItem('firebaseUID');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('isVIP');
            
            // Redirection forcée
            window.location.replace('index-fixed.html');
        }
    };
    
    // MODE DÉVELOPPEMENT - Bypass temporaire
    const isDevelopment = window.location.protocol === 'file:' || window.location.hostname === 'localhost';
    
    if (isDevelopment) {
        console.log('🔧 Mode développement détecté - Bypass VIP activé');
        sessionStorage.setItem('firebaseUID', 'dev-user');
        sessionStorage.setItem('userEmail', 'dev@misterpips.com');
        sessionStorage.setItem('isVIP', 'true');
        sessionStorage.setItem('vipVerified', Date.now());
        console.log('✅ Accès VIP autorisé (développement)');
        return;
    }
    
    // Vérifier si on a les données en mémoire
    if (window.currentUser && window.currentUser.authenticated) {
        console.log('✅ Utilisateur en mémoire détecté');
        sessionStorage.setItem('firebaseUID', window.currentUser.uid);
        sessionStorage.setItem('userEmail', window.currentUser.email);
        sessionStorage.setItem('isVIP', 'true');
        sessionStorage.setItem('vipVerified', Date.now());
        console.log('✅ Accès VIP autorisé');
    } else {
        // Vérification avec délai pour Firebase
        setTimeout(checkVIPAccessSecure, 1000);
    }
    
    // Vérification périodique (toutes les 30 secondes)
    setInterval(() => {
        const vipVerified = sessionStorage.getItem('vipVerified');
        const now = Date.now();
        if (!vipVerified || (now - parseInt(vipVerified)) > 300000) { // 5 minutes
            checkVIPAccessSecure();
        }
    }, 30000);
    
} else {
    console.log('📄 Page publique:', currentPage);
}

