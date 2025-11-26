// Business Plan Builder - Service Worker
// Enables offline functionality
// FIXED: Relative paths & comprehensive caching

const CACHE_NAME = 'bp-builder-v2'; // Bump version to force update

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './print.css',
  './app.js',
  './manifest.json',
  // Ensure these icon files actually exist in the folder!
  './icon-192.png', 
  './icon-512.png'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing & Caching App...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate immediately
      .catch(err => {
        console.error('[Service Worker] Cache failed! Check if all files exist:', err);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Network fallback
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
