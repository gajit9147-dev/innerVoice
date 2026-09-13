// ============================================================
// client/public/sw.js
// InnerVoice Progressive Web App (PWA) Service Worker
// Provides offline shell caching and resilient navigation fallback
// ============================================================

const CACHE_NAME = "innervoice-pwa-v5";
const STATIC_ASSETS = ["/manifest.json", "/assets/logo.png"];

// Install Event — cache critical static metadata
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Cache addAll warning:", err);
      });
    }),
  );
  self.skipWaiting();
});

// Activate Event — cleanup old caches (v1, v2, v3, etc.)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing outdated cache:", key);
            return caches.delete(key);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch Event — Network-first for navigation/assets, completely bypass API and cross-origin
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Do not intercept non-GET requests (POST, PUT, DELETE, etc.)
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Strictly ignore cross-origin requests (e.g. Google Auth, Railway API, Cloudflare)
  if (url.origin !== self.location.origin) return;

  // Never intercept API routes (/api/)
  if (url.pathname.startsWith("/api/") || url.pathname.includes("/api/"))
    return;

  // Navigation (HTML pages) — Always fresh from network, robust fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match("/index.html");
        if (cached) return cached;
        const rootCached = await caches.match("/");
        if (rootCached) return rootCached;

        // Guaranteed valid Response — prevents "Failed to convert value to Response"
        return new Response(
          '<!doctype html><html style="background:#090a0e;color:#f5f2eb;"><head><meta charset="utf-8"><title>InnerVoice • Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#090a0e;color:#f5f2eb;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;text-align:center;padding:24px;}</style></head><body><div style="max-width:380px;background:rgba(22,25,31,0.96);border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:32px;"><div style="font-size:28px;margin-bottom:12px;">🌙</div><h2 style="font-family:serif;font-weight:normal;margin:0 0 10px 0;">Offline Sanctuary</h2><p style="font-size:13px;color:#9e9990;margin:0 0 20px 0;line-height:1.6;">Reconnecting to network...</p><button onclick="window.location.reload()" style="background:#e2b17a;border:none;color:#121418;font-weight:600;font-size:13px;padding:10px 22px;border-radius:12px;cursor:pointer;">Try Again</button></div></body></html>',
          { headers: { "Content-Type": "text/html" }, status: 200 },
        );
      }),
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
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // Guaranteed valid Response — avoids Service Worker crash on missing asset
        return new Response("", {
          status: 404,
          statusText: "Not Found in Cache",
        });
      }),
  );
});
