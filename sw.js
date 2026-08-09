const CACHE_NAME = 'vitalcare-v6.0-fresh';

// Install: Skip waiting immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Activate: Purge ALL old caches and claim clients immediately
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// Fetch: Network-First strategy (always get fresh files from server)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, clone);
        });
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});
