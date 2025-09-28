// Service Worker - Misterpips Mobile Optimizations
const CACHE_NAME = 'misterpips-v1.2';
const urlsToCache = [
    '/',
    '/index.html',
    '/trading-dashboard.html',
    '/planning-forex.html',
    '/vip-space.html',
    '/styles.css',
    '/vip-styles.css',
    '/mobile-responsive.css',
    '/chat-mobile-styles.css',
    '/dashboard-styles.css',
    '/mobile-optimizations.js',
    '/Misterpips.jpg'
];

// Installation du service worker
self.addEventListener('install', function(event) {
    console.log('📦 Service Worker: Installation');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('📦 Service Worker: Cache ouvert');
                return cache.addAll(urlsToCache.map(url => {
                    return new Request(url, { cache: 'reload' });
                }));
            })
            .catch(function(error) {
                console.error('📦 Service Worker: Erreur cache:', error);
            })
    );
    self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', function(event) {
    console.log('🔄 Service Worker: Activation');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', function(event) {
    // Stratégie Cache First pour les ressources statiques
    if (event.request.destination === 'style' || 
        event.request.destination === 'script' || 
        event.request.destination === 'image' ||
        event.request.url.includes('.css') ||
        event.request.url.includes('.js') ||
        event.request.url.includes('.jpg') ||
        event.request.url.includes('.png')) {
        
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then(function(response) {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
                })
        );
    }
    // Stratégie Network First pour les pages HTML et APIs
    else if (event.request.destination === 'document' || 
             event.request.url.includes('firebase') ||
             event.request.url.includes('api')) {
        
        event.respondWith(
            fetch(event.request)
                .then(function(response) {
                    if (response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    return response;
                })
                .catch(function() {
                    return caches.match(event.request);
                })
        );
    }
});

// Gestion des notifications push
self.addEventListener('push', function(event) {
    console.log('📱 Service Worker: Notification push reçue');
    
    let notificationData = {};
    
    if (event.data) {
        try {
            notificationData = event.data.json();
        } catch (e) {
            notificationData = {
                title: 'Misterpips',
                body: event.data.text() || 'Nouvelle notification',
                icon: '/Misterpips.jpg',
                badge: '/Misterpips.jpg'
            };
        }
    }
    
    const options = {
        body: notificationData.body || 'Nouvelle notification Misterpips',
        icon: notificationData.icon || '/Misterpips.jpg',
        badge: notificationData.badge || '/Misterpips.jpg',
        tag: 'misterpips-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: 'Ouvrir',
                icon: '/Misterpips.jpg'
            },
            {
                action: 'close',
                title: 'Fermer'
            }
        ],
        data: {
            url: notificationData.url || '/',
            timestamp: Date.now()
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(
            notificationData.title || '💬 Misterpips VIP',
            options
        )
    );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', function(event) {
    console.log('📱 Service Worker: Clic notification');
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                // Chercher une fenêtre existante
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        if (urlToOpen !== '/') {
                            client.navigate(urlToOpen);
                        }
                        return;
                    }
                }
                
                // Ouvrir nouvelle fenêtre si aucune trouvée
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Gestion des messages depuis l'application
self.addEventListener('message', function(event) {
    console.log('📱 Service Worker: Message reçu:', event.data);
    
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const options = {
            body: event.data.body,
            icon: event.data.icon || '/Misterpips.jpg',
            badge: '/Misterpips.jpg',
            tag: 'misterpips-chat',
            requireInteraction: false,
            vibrate: [200, 100, 200],
            data: {
                url: '/trading-dashboard.html',
                timestamp: Date.now()
            }
        };
        
        self.registration.showNotification(
            event.data.title || '💬 Nouveau message VIP',
            options
        );
    }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', function(event) {
    console.log('🔄 Service Worker: Synchronisation:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Synchroniser les données en attente
            syncPendingData()
        );
    }
});

async function syncPendingData() {
    try {
        // Récupérer les données en attente depuis IndexedDB ou localStorage
        const pendingData = JSON.parse(localStorage.getItem('pendingSync') || '[]');
        
        for (const data of pendingData) {
            try {
                await fetch(data.url, {
                    method: data.method || 'POST',
                    headers: data.headers || { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data.body)
                });
                
                console.log('✅ Service Worker: Données synchronisées:', data.id);
            } catch (error) {
                console.error('❌ Service Worker: Erreur sync:', error);
            }
        }
        
        // Nettoyer les données synchronisées
        localStorage.removeItem('pendingSync');
        
    } catch (error) {
        console.error('❌ Service Worker: Erreur synchronisation:', error);
    }
}

// Gestion des erreurs
self.addEventListener('error', function(event) {
    console.error('❌ Service Worker: Erreur:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Service Worker: Promise rejetée:', event.reason);
});

console.log('🚀 Service Worker Misterpips chargé');