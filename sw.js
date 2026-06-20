const CACHE_NAME = 'iron-log-v3';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// Background timer notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TIMER_DONE') {
    self.registration.showNotification('Iron Log', {
      body: 'Rest Timer Complete — Time for your next set!',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA2klEQVR4nO2ZwQ6AIBBDZ+P/f7M3jQc1KrILLNp9CYkhTGcKAhFCCCGEEEIIwQQAvACkYlnGFtKcFCb2YXsD3ABuAFf9K7Axk9vIjU8jm/N/A3ABmCt0m/C0GdsGbk7qxkeR2Y2WI5sLdZtwABh8A/N+J3Ycl0c25WPIJjylsBLxjSwr1DNwwQV4aUb8JCDUAa4AUzfgI2PERbwkINQBrgBr4EVHoQJ4AexwgXI7EXPEcfHkV4dWCfXUGh3LIJvw3mIPVf18BN+qQgxJfx5CCGEEEKIv8sTp+dRwkCfLDkAAAAASUVORK5CYII=',
      vibrate: [200, 100, 200],
      tag: 'rest-timer',
      requireInteraction: true
    });
  }
});
