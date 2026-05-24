const CACHE_NAME = "gym-tracker-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./js/main.js",
  "./js/ui.js",
  "./js/data.js",
  "./js/utils.js",
  "./js/timer.js",
  "./js/logbook.js",
  "./js/sync.js",
  "./js/stats.js",
  "./js/exercises.js",
  "./manifest.json",
  "./images/icon-192.png",
  "./images/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.includes("/images/")) {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      });
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});
