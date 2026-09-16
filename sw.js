// Her büyük güncellemede buradaki sürümü artır (v2, v3, v4...)
const CACHE_NAME = 'omu-tip-v4';

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'hesaplayici.html',
  'kaynaklar.html',
  'iletisim.html',
  'manifest.json'
];

// 1. Yeni servis işçisi kurulur kurulmaz devreye girsin (beklemesin)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 2. Yeni versiyon gelince ESKİ versiyonun tüm önbelleğini otomatik çöpe at
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

// 3. NETWORK-FIRST: Önce internetten en günceli çek, hafızayı tazele; internet yoksa hafızadan ver
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
