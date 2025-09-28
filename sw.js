// Service Worker pour les notifications push - Misterpips
const CACHE_NAME = 'misterpips-chat-v1';

// Firebase config pour les notifications push
const firebaseConfig = {
    apiKey: "AIzaSyDSDK0NfVSs_VQb3TnrixiJbOpTsmoUMvU",
    authDomain: "misterpips-b71fb.firebaseapp.com",
    databaseURL: "https://misterpips-b71fb-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "misterpips-b71fb",
    storageBucket: "misterpips-b71fb.firebasestorage.app",
    messagingSenderId: "574231126409",
    appId: "1:574231126409:web:b7ed93ac4ea62e247dc158"
};

self.addEventListener('install', (event) => {
    console.log('Service Worker installé');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activé');
    event.waitUntil(self.clients.claim());
    
    // Démarrer l'écoute des notifications push
    startPushListener();
});

// Gérer les notifications push
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/Misterpips.jpg',
            badge: '/Misterpips.jpg',
            tag: 'vip-chat',
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: 'Ouvrir le chat'
                },
                {
                    action: 'close',
                    title: 'Fermer'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification('💬 Nouveau message VIP', options)
        );
    }
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                // Chercher une fenêtre ouverte avec le dashboard
                for (const client of clients) {
                    if (client.url.includes('trading-dashboard.html') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Ouvrir une nouvelle fenêtre si aucune n'est trouvée
                if (self.clients.openWindow) {
                    return self.clients.openWindow('/trading-dashboard.html');
                }
            })
        );
    }
});

// Gérer les messages du client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon } = event.data;
        self.registration.showNotification(title, {
            body,
            icon: icon || '/Misterpips.jpg',
            badge: '/Misterpips.jpg',
            tag: 'vip-chat',
            requireInteraction: false,
            vibrate: [200, 100, 200]
        });
    }
});

// Fonction pour écouter les notifications push même quand le site est fermé
function startPushListener() {
    // Simuler l'écoute des notifications push
    // En réalité, cela nécessiterait Firebase Cloud Messaging
    console.log('Push listener démarré');
    
    // Vérifier périodiquement les nouvelles notifications
    setInterval(async () => {
        try {
            // Cette fonction sera appelée même si le site est fermé
            await checkForNewMessages();
        } catch (error) {
            console.error('Erreur vérification messages:', error);
        }
    }, 30000); // Vérifier toutes les 30 secondes
}

// Vérifier les nouveaux messages via l'API Firebase
async function checkForNewMessages() {
    try {
        // Récupérer les notifications push depuis Firebase
        const response = await fetch(`${firebaseConfig.databaseURL}/push_notifications.json`);
        const notifications = await response.json();
        
        if (notifications) {
            const notificationList = Object.values(notifications);
            const lastCheck = await getLastNotificationCheck();
            
            // Filtrer les nouvelles notifications
            const newNotifications = notificationList.filter(notif => 
                notif.timestamp > lastCheck
            );
            
            // Afficher les nouvelles notifications
            for (const notif of newNotifications) {
                await self.registration.showNotification(notif.title, {
                    body: notif.body,
                    icon: notif.icon || '/Misterpips.jpg',
                    badge: '/Misterpips.jpg',
                    tag: 'vip-chat-push',
                    requireInteraction: false,
                    vibrate: [200, 100, 200],
                    data: {
                        url: '/trading-dashboard.html',
                        timestamp: notif.timestamp
                    }
                });
            }
            
            // Mettre à jour le timestamp de dernière vérification
            if (newNotifications.length > 0) {
                const latestTimestamp = Math.max(...newNotifications.map(n => n.timestamp));
                await setLastNotificationCheck(latestTimestamp);
            }
        }
    } catch (error) {
        console.error('Erreur vérification notifications:', error);
    }
}

// Fonctions utilitaires pour le stockage
async function getLastNotificationCheck() {
    try {
        const result = await self.caches.open('notification-cache');
        const response = await result.match('last-check');
        if (response) {
            const data = await response.json();
            return data.timestamp || 0;
        }
    } catch (error) {
        console.error('Erreur lecture cache:', error);
    }
    return 0;
}

async function setLastNotificationCheck(timestamp) {
    try {
        const cache = await self.caches.open('notification-cache');
        const response = new Response(JSON.stringify({ timestamp }));
        await cache.put('last-check', response);
    } catch (error) {
        console.error('Erreur écriture cache:', error);
    }
}