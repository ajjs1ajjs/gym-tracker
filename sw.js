const CACHE_NAME = "gym-tracker-v5";
const urlsToCache = /*PRECACHE*/ [];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
  // NOTE: do NOT skipWaiting() here — let the new worker stay in `waiting` so
  // the app can show its update banner and skipWaiting only on user confirm
  // (the SKIP_WAITING message below). Auto-skip caused surprise reloads.
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        // Same-origin assets are "basic"; the pinned CDN libs (chart.js,
        // canvas-confetti) are "cors" — cache those too so charts/confetti
        // keep working offline.
        const url = event.request.url;
        const isCdn = url.startsWith("https://cdn.jsdelivr.net/");
        if (response.type !== "basic" && !isCdn) {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          if (isCdn || url.includes("/images/") || url.includes("/js/")) {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      }).catch((err) => {
        // Offline navigation (e.g. cold launch from start_url './') won't match
        // a cached document by URL — fall back to the precached app shell.
        if (event.request.mode === "navigate") {
          return caches.match("./index.html").then(
            (shell) => shell || caches.match("index.html"),
          );
        }
        throw err;
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
