// Her büyük güncellemede buradaki sürümü artır
const CACHE_NAME = 'omu-tip-v9';

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'hesaplayici.html',
  'kaynaklar.html',
  'iletisim.html',
  'manifest.json'
];

// 1. Yeni sürüm beklemeden anında kurulsun
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 2. Eski sürüme (v8 vb.) ait tüm önbelleği temizle ve sayfaları hemen devral
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Ağ Stratejisi: Sayfa açılışlarında (HTML) doğrudan sunucudan al, sadece internetsizken önbellekten oku
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate' || 
                       (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Statik dosyalar için önce önbellek, yoksa ağ
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
