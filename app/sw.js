const cacheName = 'resto-cache-v3';
const resources = [
  'index.html',
  'restaurant.html',
  'css/style.css',
  'js/idb.js',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js'
];

self.addEventListener('install', event => {
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