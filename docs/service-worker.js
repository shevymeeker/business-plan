// Business Plan Builder - Service Worker
// Enables offline functionality for contractors

const CACHE_NAME = 'business-plan-builder-v1';
const urlsToCache = [
  '/business-plan/',
  '/business-plan/index.html',
  '/business-plan/styles.css',
  '/business-plan/print.css',
  '/business-plan/app.js',
  '/business-plan/manifest.json',
  '/business-plan/icon-180.png',
  '/business-plan/icon-192.png',
  '/business-plan/icon-512.png'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, adding files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All files cached successfully');
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache when offline (offline-first strategy)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return cached response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        // Try to fetch from network
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the new response for future use
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(error => {
          // Network request failed, check if we have a cached version
          console.log('Fetch failed; returning offline page instead.', error);
          // You could return a custom offline page here if desired
          return caches.match('./index.html');
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Message event - allow clients to communicate with service worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
