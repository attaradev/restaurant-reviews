importScripts('./js/idb');

const DB_NAME = 'RestoDB';
const CACHE_NAME = 'RestoCache';
const RESOURCES_TO_CACHE = [
  '/',
  '/css/style.css',
  '/js/idb.js',
  '/js/main.js',
  '/js/dbhelper.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => {
      return cache.addAll(RESOURCES_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);

  event.respondWith(
    caches.open(CACHE_NAME)
    .then((cache) => {
      return cache.match(event.request)
        .then((response) => {
          let fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
          return response || fetchPromise;
        })
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.id == 'add-review') {
    event.waitUntil(
      caches.open('mygame-dynamic')
      .then((cache) => {
        return cache.add('/leaderboard.json');
      })
    );
  }
});