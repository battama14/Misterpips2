// Quick fix pour ajouter un trade test pour l'utilisateur manquant
async function ajouterTradeTest() {
    const userId = '8RNSkskIazSetfmwsOelQ3U7awT2';
    const today = new Date().toISOString().split('T')[0];
    
    const testTrade = {
        id: `${userId}_quickfix_${Date.now()}`,
        date: today,
        status: 'closed',
        pnl: 50.0,
        pair: 'EUR/USD',
        type: 'BUY',
        entry: 1.0500,
        exit: 1.0550,
        timestamp: Date.now()
    };
    
    // Ajouter à Firebase
    try {
        if (window.firebaseDB) {
            const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
            const tradeRef = ref(window.firebaseDB, `dashboards/${userId}/trades/${testTrade.id}`);
            await set(tradeRef, testTrade);
            console.log('✅ Trade test ajouté à Firebase');
        }
    } catch (error) {
        console.error('❌ Erreur Firebase:', error);
    }
    
    // Ajouter à localStorage
    const localKey = `dashboard_${userId}`;
    let localData = JSON.parse(localStorage.getItem(localKey) || '{"trades": {}}');
    if (!localData.trades) localData.trades = {};
    localData.trades[testTrade.id] = testTrade;
    localStorage.setItem(localKey, JSON.stringify(localData));
    console.log('✅ Trade test ajouté à localStorage');
    
    // Forcer mise à jour du classement
    if (typeof updateVipRanking === 'function') {
        updateVipRanking();
    }
}

// Fonction globale pour le bouton
window.ajouterTradeQuickFix = ajouterTradeTest;

// Exécuter automatiquement si nécessaire
// ajouterTradeTest();