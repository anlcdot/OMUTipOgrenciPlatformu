const CACHE_NAME = 'omu-tip-static-v2';

const ASSETS_TO_CACHE = [
  'index.html',
  'hesaplayici.html',
  'kaynaklar.html',
  'iletisim.html',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Sayfa geçişleri her zaman ağdan gelsin; ağ yoksa önbellekten dön
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Diğer dosyalar (CSS, JS, görseller) önbellekten, yoksa ağdan
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
