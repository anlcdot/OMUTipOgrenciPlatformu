const CACHE_VERSION = 'v3'; // Sürümü güncelledik, her büyük değişimde v4, v5 yap
const CACHE_NAME = 'omu-tip-static-' + CACHE_VERSION;

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'hesaplayici.html',
  'kaynaklar.html',
  'iletisim.html',
  'manifest.json'
];

// 1. Yeni sürüm beklemeden kurulsun
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 2. Sadece eski sürümlere ait cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Sadece eski omu-tip-static önbelleklerini sil, diğer site verilerine dokunma
          if (key.startsWith('omu-tip-static-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Ağ Öncelikli Strateji (Güvenli Hâl)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate';

  if (isNavigation) {
    event.respondWith(
      fetch(event.request) // no-cache bayrağı kaldırıldı, tarayıcıyı loop'a sokan ana etkenlerden biriydi
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
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
