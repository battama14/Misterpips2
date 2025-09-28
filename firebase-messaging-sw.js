// Service Worker pour Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Configuration Firebase
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

// Gérer les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
    console.log('Message reçu en arrière-plan:', payload);
    
    const notificationTitle = payload.notification.title || '💬 Nouveau message VIP';
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/Misterpips.jpg',
        badge: '/Misterpips.jpg',
        tag: 'vip-chat',
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: payload.data
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    console.log('Notification cliquée:', event);
    
    event.notification.close();
    
    // Ouvrir ou focus sur la fenêtre du site
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes('trading-dashboard.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/trading-dashboard.html');
            }
        })
    );
});