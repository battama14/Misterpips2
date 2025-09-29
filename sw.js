// Service Worker Ultra Simple
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    self.clients.claim();
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SHOW_NOTIFICATION') {
        const { title, body } = event.data;
        
        self.registration.showNotification(title, {
            body: body,
            icon: 'Misterpips.jpg',
            badge: 'Misterpips.jpg',
            vibrate: [100, 50, 100],
            requireInteraction: false
        });
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