// Service worker ringkas untuk NTT TEGUH - Sistem Quotation
// Cuma cache "shell" (index.html, manifest, icons) supaya app boleh dipasang (installable).
// Data sebenar (dalam iframe Apps Script) sentiasa dimuatkan terus dari network -
// perlu sambungan internet untuk guna sistem (data hidup dalam Google Sheets).

const CACHE_NAME = 'ntt-teguh-shell-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  // Hanya campur tangan untuk fail shell dari origin sendiri.
  // Semua request lain (termasuk iframe ke script.google.com) biar terus ke network.
  const isShellRequest = url.origin === self.location.origin;

  if (!isShellRequest) {
    return; // biar browser handle macam biasa (network)
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});
