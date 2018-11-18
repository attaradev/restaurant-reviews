const PRECACHE = 'precache-v1';
const DYNAMIC_CACHE = 'dynamic-cache';

const PRECACHE_URLS = [
  '/',
  'css/styles.css',
  'js/idb.js',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
    .then(cache => cache.addAll(PRECACHE_URLS))
    .then(self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('activated sw');
  const currentCaches = [PRECACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    })
    .then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    })
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const storageUrl = event.request.url.split(/[?#]/)[0];

  if (storageUrl.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(storageUrl).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(DYNAMIC_CACHE).then(cache => {
          return fetch(event.request).then(response => {
            return cache.put(storageUrl, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});

// self.addEventListener('sync', (event) => {
//   if (event.id == 'add-review') {
//     event.waitUntil(
//       caches.open('mygame-dynamic')
//       .then((cache) => {
//         return cache.add('/leaderboard.json');
//       })
//     );
//   }
// })