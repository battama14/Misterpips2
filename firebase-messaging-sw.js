// Service Worker Firebase Messaging - Optimisé
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyDSDK0NfVSs_VQb3TnrixiJbOpTsmoUMvU",
    authDomain: "misterpips-b71fb.firebaseapp.com",
    databaseURL: "https://misterpips-b71fb-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "misterpips-b71fb",
    storageBucket: "misterpips-b71fb.firebasestorage.app",
    messagingSenderId: "574231126409",
    appId: "1:574231126409:web:b7ed93ac4ea62e247dc158"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Gestion des messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
    console.log('📱 Message reçu en arrière-plan:', payload);
    
    const notificationTitle = payload.notification?.title || '💬 Nouveau message VIP';
    const notificationOptions = {
        body: payload.notification?.body || 'Vous avez reçu un nouveau message',
        icon: '/Misterpips.jpg',
        badge: '/Misterpips.jpg',
        tag: 'vip-chat-message',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
            {
                action: 'open',
                title: 'Ouvrir le chat',
                icon: '/Misterpips.jpg'
            },
            {
                action: 'close',
                title: 'Fermer'
            }
        ],
        data: {
            url: '/trading-dashboard.html',
            timestamp: Date.now()
        }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification cliquée:', event);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                // Chercher une fenêtre existante
                for (const client of clientList) {
                    if (client.url.includes('trading-dashboard.html') && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Ouvrir une nouvelle fenêtre
                if (clients.openWindow) {
                    return clients.openWindow('/trading-dashboard.html');
                }
            })
        );
    }
});

// Notification instantanée via postMessage
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon } = event.data;
        
        const options = {
            body: body,
            icon: icon || '/Misterpips.jpg',
            badge: '/Misterpips.jpg',
            tag: 'instant-notification',
            requireInteraction: false,
            vibrate: [100, 50, 100],
            timestamp: Date.now()
        };
        
        self.registration.showNotification(title, options);
    }
});