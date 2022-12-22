// (A) CREATE/INSTALL CACHE
self.addEventListener("install", evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open("JSCam")
    .then(cache => cache.addAll([
      "assets/click.mp3",
      "assets/favicon.png",
      "assets/icon-512.png",
      "assets/maticon.woff2",
      "assets/js-cam.css",
      "assets/js-cam.js",
      "assets/js-cam-gallery.js",
      "CB-manifest.json",
      "js-cam.html"
    ]))
    .catch(err => console.error(err))
  );
});

// (B) CLAIM CONTROL INSTANTLY
self.addEventListener("activate", evt => self.clients.claim());

// (C) LOAD FROM CACHE FIRST, FALLBACK TO NETWORK IF NOT FOUND
self.addEventListener("fetch", evt => evt.respondWith(
  caches.match(evt.request).then(res => res || fetch(evt.request))
));