const CACHE_NAME = "punchlab-shell-20260624-121";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./src/chain-params.js",
  "./src/audio.js",
  "./src/dsp.js",
  "./src/files.js",
  "./src/templates.js",
  "./src/devices.js",
  "./src/mix.js",
  "./src/vocal.js",
  "./src/engine-contract.js",
  "./src/native-bridge.js",
  "./src/native-fixture.js",
  "./src/native-adapter.js",
  "./src/engine.js",
  "./src/project.js",
  "./src/project-zip.js",
  "./src/storage.js",
  "./src/platform.js",
  "./src/desktop.js",
  "./desktop-host-manifest.json",
  "./desktop-wrapper-manifest.json",
  "./plugin-host-manifest.json",
  "./desktop-package-manifest.json",
  "./manifest.webmanifest",
  "./assets/punchlab-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html"))),
  );
});
