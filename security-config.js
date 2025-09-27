// Configuration de sécurité pour Misterpips
const SECURITY_CONFIG = {
    // Pages publiques (accessibles à tous)
    publicPages: [
        'index.html',
        '',  // Page racine
        '/'  // Page racine alternative
    ],
    
    // Pages VIP (nécessitent une authentification)
    vipPages: [
        'vip-space.html',
        'trading-dashboard.html',
        'planning-forex.html',
        'dashboard-vip.html'
    ],
    
    // Pages admin (nécessitent admin@misterpips.com)
    adminPages: [
        'admin-dashboard.html',
        'admin-vip.html'
    ],
    
    // Emails administrateurs autorisés
    adminEmails: [
        'admin@misterpips.com'
    ],
    
    // Messages d'erreur
    messages: {
        notAuthenticated: 'Vous devez être connecté pour accéder à cette page',
        notVIP: 'Accès VIP requis pour cette page',
        notAdmin: 'Accès administrateur requis',
        authError: 'Erreur d\'authentification'
    }
};

// Export pour utilisation dans d'autres scripts
if (typeof window !== 'undefined') {
    window.SECURITY_CONFIG = SECURITY_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SECURITY_CONFIG;
}