// Service Worker for 상상렌트카 - Basic caching implementation
const CACHE_NAME = 'sangsang-rentcar-v1.0.0';
const STATIC_CACHE = 'sangsang-static-v1.0.0';
const DYNAMIC_CACHE = 'sangsang-dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/static/css/style.css',
    '/static/js/main.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap'
];

// Install event - Cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - Serve cached content when available
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin) &&
        !event.request.url.startsWith('https://fonts.googleapis.com') &&
        !event.request.url.startsWith('https://cdnjs.cloudflare.com') &&
        !event.request.url.startsWith('https://cdn.tailwindcss.com')) return;

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Don't cache non-successful responses
                        if (!networkResponse.ok) {
                            return networkResponse;
                        }

                        // Clone the response for caching
                        const responseClone = networkResponse.clone();

                        // Cache successful responses
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Return offline fallback for HTML pages
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/');
                        }
                    });
            })
    );
});

// Background sync for offline form submissions (if implemented)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Implement background sync logic here if needed
    return Promise.resolve();
}