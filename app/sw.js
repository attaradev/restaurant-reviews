const cacheName = 'resto-cache-v3';
const resources = [
  'index.html',
  'restaurant.html',
  'css/style.css',
  'js/idb.js',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://use.fontawesome.com/releases/v5.3.1/css/all.css'
];

self.addEventListener('install', event => {
  console.log('[SERVICE WORKER] Installing service worker');
  event.waitUntil(
    caches.open(cacheName)
    .then(cache => {
      cache.addAll(resources);
    })
    .catch(err => console.log(err))
  )
})

self.addEventListener('activate', event => {
  console.log('[SERVICE WORKER] Activating service worker');
  const currentCaches = [cacheName];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const storageUrl = event.request.url.split(/[?#]/)[0];
  if (event.request.method.toLowerCase() === 'get') {
    event.respondWith(
      caches.open(cacheName)
      .then(cache => {
        return cache.match(event.request)
          .then(response => {
            const fetchPromise = fetch(event.request)
              .then(networkResponse => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              })
            return response || fetchPromise;
          })
      })
      .catch(err => console.log(err))
    );
  }
});