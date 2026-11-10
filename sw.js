const CACHE = "beam-20261110142037";
const PRECACHE = ["./","./index.html","./probe.html","./icon.svg","./manifest.webmanifest","./assets/main.js","./assets/probe.js","./assets/styles.js","./assets/encoder.worker-BuoN2ac8.js","./assets/styles.css"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE);
        await cache.put("./index.html", response.clone());
        return response;
      } catch {
        const cached = await caches.match("./index.html");
        if (cached) return cached;
        throw new Error("Beam is offline and has no cached page.");
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    return fetch(request);
  })());
});
