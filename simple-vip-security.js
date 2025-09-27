// Sécurité VIP simplifiée - Version qui fonctionne
console.log('🔒 Sécurité VIP simplifiée chargée');

// Vérifier seulement si on est sur une page VIP
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const vipPages = ['vip-space.html', 'trading-dashboard.html', 'planning-forex.html'];

if (vipPages.includes(currentPage)) {
    console.log('🔍 Page VIP détectée:', currentPage);
    
    // Vérification simple basée sur sessionStorage
    const checkVIPAccess = () => {
        const uid = sessionStorage.getItem('firebaseUID');
        const email = sessionStorage.getItem('userEmail');
        const isVIP = sessionStorage.getItem('isVIP');
        
        console.log('📋 Vérification session:', { uid, email, isVIP });
        
        if (uid && email && isVIP === 'true') {
            console.log('✅ Accès VIP autorisé');
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
        } else {
            console.log('❌ Accès VIP refusé - redirection');
            alert('Accès VIP requis. Redirection vers la page d\'accueil.');
            window.location.href = 'index.html';
        }
    };
    
    // Masquer la page pendant la vérification
    document.body.style.visibility = 'hidden';
    document.body.style.opacity = '0';
    
    // Vérifier après chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkVIPAccess);
    } else {
        checkVIPAccess();
    }
} else {
    console.log('📄 Page publique:', currentPage);
}