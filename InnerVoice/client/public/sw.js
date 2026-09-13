// ============================================================
// client/public/sw.js
// InnerVoice Progressive Web App (PWA) Service Worker
// Provides offline shell caching and resilient navigation fallback
// ============================================================

const CACHE_NAME = "innervoice-pwa-v2";
const STATIC_ASSETS = [
  "/manifest.json",
  "/assets/logo.png"
];

// Install Event — cache critical static metadata
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Cache addAll warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event — cleanup old caches (v1, etc.)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing outdated cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event — Network-first for all navigation and scripts to prevent stale chunk errors
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Do not intercept non-GET or cross-origin API requests
  if (request.method !== "GET") return;

  // Let IndexedDB/Axios handle dynamic API requests (/api/)
  if (request.url.includes("/api/")) return;

  // Navigation (HTML pages) — Always fresh from network
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/index.html") || caches.match("/");
      })
    );
    return;
  }

  // Static Assets (JS, CSS, images, fonts) — Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful same-origin responses
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
