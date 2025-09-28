// Service Worker Principal - Notifications Optimisées
const CACHE_NAME = 'misterpips-v1';

// Installation du service worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installé');
    self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activé');
    event.waitUntil(clients.claim());
});

// Gestion des messages pour notifications instantanées
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon } = event.data;
        
        const options = {
            body: body,
            icon: icon || '/Misterpips.jpg',
            badge: '/Misterpips.jpg',
            tag: 'instant-notification-' + Date.now(),
            requireInteraction: false,
            vibrate: [200, 100, 200],
            timestamp: Date.now(),
            actions: [
                {
                    action: 'open',
                    title: 'Ouvrir',
                    icon: '/Misterpips.jpg'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification cliquée');
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                // Chercher une fenêtre existante avec le dashboard
                for (const client of clientList) {
                    if (client.url.includes('trading-dashboard.html') && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Chercher n'importe quelle fenêtre Misterpips
                for (const client of clientList) {
                    if (client.url.includes('misterpips') && 'focus' in client) {
                        return client.navigate('/trading-dashboard.html').then(() => client.focus());
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

// Push notifications
self.addEventListener('push', (event) => {
    console.log('📱 Push notification reçue:', event);
    
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'Nouveau message',
            icon: '/Misterpips.jpg',
            badge: '/Misterpips.jpg',
            tag: 'push-notification',
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200],
            timestamp: Date.now()
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || '💬 Misterpips', options)
        );
    }
});