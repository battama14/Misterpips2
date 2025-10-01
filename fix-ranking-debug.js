// Script de diagnostic et correction du classement VIP
console.log('🔧 Script de diagnostic du classement VIP chargé');

// Fonction de diagnostic complet
async function diagnosticClassementComplet() {
    console.log('🔍 DIAGNOSTIC COMPLET DU CLASSEMENT VIP');
    console.log('=====================================');
    
    const currentUser = sessionStorage.getItem('firebaseUID');
    const userEmail = sessionStorage.getItem('userEmail');
    
    console.log('👤 Utilisateur actuel:', {
        uid: currentUser,
        email: userEmail
    });
    
    if (!currentUser || !userEmail) {
        console.error('❌ Pas d\'utilisateur connecté');
        return;
    }
    
    if (!window.firebaseDB) {
        console.error('❌ Firebase non initialisé');
        return;
    }
    
    try {
        const { ref, get, set, update } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
        
        // 1. Vérifier le statut utilisateur dans Firebase
        console.log('🔍 1. Vérification du statut utilisateur...');
        const userRef = ref(window.firebaseDB, `users/${currentUser}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            console.log('✅ Utilisateur trouvé dans Firebase:', {
                email: userData.email,
                isVIP: userData.isVIP,
                plan: userData.plan,
                status: userData.status,
                rankingEnabled: userData.rankingEnabled
            });
            
            // Corriger le statut si nécessaire
            if (!userData.isVIP || userData.plan !== 'VIP') {
                console.log('🔧 Correction du statut VIP...');
                await update(userRef, {
                    isVIP: true,
                    plan: 'VIP',
                    status: 'active',
                    rankingEnabled: true,
                    lastActive: new Date().toISOString()
                });
                console.log('✅ Statut VIP corrigé');
            }
        } else {
            console.log('❌ Utilisateur non trouvé, création...');
            await set(userRef, {
                email: userEmail,
                isVIP: true,
                plan: 'VIP',
                status: 'active',
                rankingEnabled: true,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            });
            console.log('✅ Utilisateur VIP créé');
        }
        
        // 2. Vérifier les trades dans tous les emplacements
        console.log('🔍 2. Vérification des trades...');
        const today = new Date().toISOString().split('T')[0];
        console.log('📅 Date d\'aujourd\'hui:', today);
        
        const tradePaths = [
            `dashboards/${currentUser}/trades`,
            `trading_data/${currentUser}/trades`,
            `users/${currentUser}/trades`,
            `vip_users/${currentUser}/trades`
        ];
        
        let tradesFound = false;
        let bestTradesData = null;
        let bestPath = null;
        
        for (const path of tradePaths) {
            const tradesRef = ref(window.firebaseDB, path);
            const snapshot = await get(tradesRef);
            
            if (snapshot.exists()) {
                const trades = snapshot.val();
                const tradesArray = Array.isArray(trades) ? trades : Object.values(trades);
                
                console.log(`📊 ${path}: ${tradesArray.length} trades trouvés`);
                
                if (tradesArray.length > 0 && (!bestTradesData || tradesArray.length > bestTradesData.length)) {
                    bestTradesData = tradesArray;
                    bestPath = path;
                    tradesFound = true;
                }
                
                // Analyser les trades d'aujourd'hui
                const todayTrades = tradesArray.filter(trade => {
                    if (!trade || !trade.date) return false;
                    const isToday = trade.date === today;
                    const isClosed = trade.status === 'closed' || trade.status === 'completed';
                    return isToday && isClosed;
                });
                
                const dailyPnL = todayTrades.reduce((total, trade) => {
                    return total + (parseFloat(trade.pnl) || 0);
                }, 0);
                
                console.log(`  📈 Trades aujourd'hui: ${todayTrades.length}, P&L: $${dailyPnL.toFixed(2)}`);
            } else {
                console.log(`❌ ${path}: Aucune donnée`);
            }
        }
        
        // 3. Synchroniser depuis localStorage si nécessaire
        if (!tradesFound) {
            console.log('🔍 3. Vérification localStorage...');
            const localData = localStorage.getItem(`dashboard_${currentUser}`);
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    if (data.trades && data.trades.length > 0) {
                        console.log(`📱 localStorage: ${data.trades.length} trades trouvés`);
                        
                        // Synchroniser vers Firebase
                        const mainPath = `dashboards/${currentUser}/trades`;
                        const mainTradesRef = ref(window.firebaseDB, mainPath);
                        await set(mainTradesRef, data.trades);
                        
                        // Aussi vers trading_data pour compatibilité
                        const altPath = `trading_data/${currentUser}/trades`;
                        const altTradesRef = ref(window.firebaseDB, altPath);
                        await set(altTradesRef, data.trades);
                        
                        bestTradesData = data.trades;
                        bestPath = mainPath;
                        tradesFound = true;
                        
                        console.log('✅ Trades synchronisés depuis localStorage vers Firebase');
                    }
                } catch (e) {
                    console.error('❌ Erreur parsing localStorage:', e);
                }
            }
        }
        
        // 4. Créer des données de test si aucune donnée
        if (!tradesFound) {
            console.log('🔧 4. Création de données de test...');
            const testTrades = [
                {
                    id: `${currentUser}_test_${Date.now()}`,
                    date: today,
                    currency: 'EUR/USD',
                    entryPoint: 1.1000,
                    stopLoss: 1.0950,
                    takeProfit: 1.1100,
                    lotSize: 0.1,
                    pnl: 50.00,
                    status: 'closed',
                    result: 'TP',
                    createdAt: Date.now()
                }
            ];
            
            const mainPath = `dashboards/${currentUser}/trades`;
            const mainTradesRef = ref(window.firebaseDB, mainPath);
            await set(mainTradesRef, testTrades);
            
            console.log('✅ Trade de test créé pour aujourd\'hui');
            bestTradesData = testTrades;
            bestPath = mainPath;
        }
        
        // 5. Mettre à jour les stats utilisateur
        console.log('🔍 5. Mise à jour des stats...');
        if (bestTradesData) {
            const todayTrades = bestTradesData.filter(trade => 
                trade && trade.date === today && (trade.status === 'closed' || trade.status === 'completed')
            );
            const dailyPnL = todayTrades.reduce((total, trade) => total + (parseFloat(trade.pnl) || 0), 0);
            
            const statsRef = ref(window.firebaseDB, `users/${currentUser}/stats`);
            await set(statsRef, {
                totalTrades: bestTradesData.length,
                todayTrades: todayTrades.length,
                dailyPnL: dailyPnL,
                lastUpdated: new Date().toISOString(),
                dataPath: bestPath
            });
            
            console.log('✅ Stats utilisateur mises à jour:', {
                totalTrades: bestTradesData.length,
                todayTrades: todayTrades.length,
                dailyPnL: dailyPnL
            });
        }
        
        // 6. Vérifier tous les utilisateurs VIP
        console.log('🔍 6. Vérification de tous les utilisateurs VIP...');
        const usersRef = ref(window.firebaseDB, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
            const users = Object.entries(usersSnapshot.val());
            const vipUsers = users.filter(([uid, userData]) => userData.isVIP);
            
            console.log(`👥 ${vipUsers.length} utilisateurs VIP trouvés:`);
            
            for (const [uid, userData] of vipUsers) {
                console.log(`  - ${userData.email} (${uid})`);
                
                // Vérifier les trades de chaque utilisateur
                const userTradesRef = ref(window.firebaseDB, `dashboards/${uid}/trades`);
                const userTradesSnapshot = await get(userTradesRef);
                
                if (userTradesSnapshot.exists()) {
                    const userTrades = userTradesSnapshot.val();
                    const userTradesArray = Array.isArray(userTrades) ? userTrades : Object.values(userTrades);
                    const userTodayTrades = userTradesArray.filter(trade => 
                        trade && trade.date === today && (trade.status === 'closed' || trade.status === 'completed')
                    );
                    const userDailyPnL = userTodayTrades.reduce((total, trade) => total + (parseFloat(trade.pnl) || 0), 0);
                    
                    console.log(`    📊 ${userTodayTrades.length} trades aujourd'hui, P&L: $${userDailyPnL.toFixed(2)}`);
                } else {
                    console.log(`    ❌ Aucun trade trouvé`);
                }
            }
        }
        
        console.log('✅ Diagnostic terminé');
        console.log('=====================================');
        
        // Forcer le rechargement du classement
        if (window.vipRanking) {
            console.log('🔄 Rechargement du classement...');
            await window.vipRanking.loadRanking();
        }
        
        return {
            success: true,
            userFound: true,
            tradesFound: tradesFound,
            bestPath: bestPath,
            tradesCount: bestTradesData ? bestTradesData.length : 0
        };
        
    } catch (error) {
        console.error('❌ Erreur diagnostic:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Fonction pour forcer la synchronisation
async function forcerSynchronisation() {
    console.log('🔄 Forçage de la synchronisation...');
    
    const currentUser = sessionStorage.getItem('firebaseUID');
    if (!currentUser || !window.firebaseDB) {
        console.error('❌ Utilisateur ou Firebase manquant');
        return;
    }
    
    try {
        const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
        
        // Synchroniser localStorage vers Firebase
        const localData = localStorage.getItem(`dashboard_${currentUser}`);
        if (localData) {
            const data = JSON.parse(localData);
            if (data.trades) {
                // Synchroniser vers plusieurs emplacements
                const paths = [
                    `dashboards/${currentUser}/trades`,
                    `trading_data/${currentUser}/trades`
                ];
                
                for (const path of paths) {
                    const tradesRef = ref(window.firebaseDB, path);
                    await set(tradesRef, data.trades);
                    console.log(`✅ Synchronisé vers ${path}`);
                }
                
                // Mettre à jour le timestamp de dernière sync
                const syncRef = ref(window.firebaseDB, `users/${currentUser}/lastSync`);
                await set(syncRef, new Date().toISOString());
                
                console.log('✅ Synchronisation forcée terminée');
                return true;
            }
        }
        
        console.log('❌ Aucune donnée locale à synchroniser');
        return false;
        
    } catch (error) {
        console.error('❌ Erreur synchronisation forcée:', error);
        return false;
    }
}

// Fonction pour créer un trade de test
async function creerTradeTest() {
    console.log('🧪 Création d\'un trade de test...');
    
    const currentUser = sessionStorage.getItem('firebaseUID');
    if (!currentUser || !window.firebaseDB) {
        console.error('❌ Utilisateur ou Firebase manquant');
        return;
    }
    
    try {
        const { ref, get, set } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
        
        const today = new Date().toISOString().split('T')[0];
        const testTrade = {
            id: `${currentUser}_test_${Date.now()}`,
            date: today,
            currency: 'EUR/USD',
            entryPoint: 1.1000,
            stopLoss: 1.0950,
            takeProfit: 1.1100,
            lotSize: 0.1,
            pnl: 75.50,
            status: 'closed',
            result: 'TP',
            createdAt: Date.now(),
            isTest: true
        };
        
        // Récupérer les trades existants
        const tradesRef = ref(window.firebaseDB, `dashboards/${currentUser}/trades`);
        const snapshot = await get(tradesRef);
        
        let trades = [];
        if (snapshot.exists()) {
            const existingTrades = snapshot.val();
            trades = Array.isArray(existingTrades) ? existingTrades : Object.values(existingTrades);
        }
        
        // Ajouter le trade de test
        trades.push(testTrade);
        
        // Sauvegarder
        await set(tradesRef, trades);
        
        // Aussi dans trading_data pour compatibilité
        const altTradesRef = ref(window.firebaseDB, `trading_data/${currentUser}/trades`);
        await set(altTradesRef, trades);
        
        console.log('✅ Trade de test créé:', testTrade);
        
        // Forcer le rechargement du classement
        if (window.vipRanking) {
            setTimeout(() => {
                window.vipRanking.loadRanking();
            }, 1000);
        }
        
        return testTrade;
        
    } catch (error) {
        console.error('❌ Erreur création trade test:', error);
        return null;
    }
}

// Exposer les fonctions globalement
window.diagnosticClassementComplet = diagnosticClassementComplet;
window.forcerSynchronisation = forcerSynchronisation;
window.creerTradeTest = creerTradeTest;

console.log('✅ Fonctions de diagnostic disponibles:');
console.log('  - diagnosticClassementComplet()');
console.log('  - forcerSynchronisation()');
console.log('  - creerTradeTest()');