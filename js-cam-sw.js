// (A) FILES TO CACHE
const cName = "JSCam",
cFiles = [
  // (A1) ICONS + FONTS
  "assets/favicon.png",
  "assets/icon-512.png",
  "assets/maticon.woff2",
  // (A2) CSS
  "assets/js-cam.css",
  // (A3) JS
  "assets/cb.js",
  "assets/js-cam.js",
  // (A4) MANIFEST
  "js-cam-manifest.json",
  // (A5) PAGES
  "js-cam.html",
  "gallery.inc",
  "home.inc"
];

// (B) CREATE/INSTALL CACHE
self.addEventListener("install", (evt) => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(cName)
    .then((cache) => { return cache.addAll(cFiles); })
    .catch((err) => { console.error(err) })
  );
});

// (C) LOAD FROM CACHE, FALLBACK TO NETWORK IF NOT FOUND
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request)
    .then((res) => { return res || fetch(evt.request); })
  );
});
