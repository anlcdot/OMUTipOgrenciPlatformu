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

// 3. NETWORK-FIRST (Tarayıcı HTTP önbelleğini baypas ederek doğrudan ağdan al)
self.addEventListener('fetch', (event) => {
  // Yalnızca GET isteklerini ele al
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // Ağ isteğini tarayıcı cache'ini atlayarak (revalidate ederek) yap
    fetch(event.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
