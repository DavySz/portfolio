// Service Worker for Portfolio PWA
const CACHE_NAME = 'portfolio-v2';
const STATIC_CACHE = 'static-v2';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) return;

  // Navegação é network-first: com cache-first, um deploy novo continuava
  // servindo o index.html velho, que aponta para chunks com hash que não
  // existem mais — tela branca até um hard refresh.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Só guarda o que vale a pena reencontrar offline. `cache.put`
          // REJEITA uma resposta redirecionada (e `/artigos/<slug>/` vira um
          // 308 para a forma sem barra), e guardar um 404 faria a página de
          // erro reaparecer offline no lugar da que existe.
          if (response.ok && !response.redirected) {
            const copy = response.clone();
            caches
              .open(STATIC_CACHE)
              .then((cache) => cache.put(event.request, copy))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Assets têm hash no nome: o conteúdo nunca muda para a mesma URL,
  // então cache-first é seguro e é o que deixa a visita seguinte instantânea.
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache images, fonts, and scripts
            if (
              !response.redirected &&
              event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|woff2|woff|ttf|js|css)$/)
            ) {
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseToCache))
                .catch(() => {});
            }

            return response;
          })
          .catch(() => {
            // Return offline page if available
            return caches.match('/index.html');
          });
      })
  );
});
