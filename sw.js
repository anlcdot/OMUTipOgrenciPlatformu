const CACHE_NAME = 'omu-tip-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'hesaplayici.html',
  'kaynaklar.html',
  'iletisim.html'
];

// Uygulama ilk kurulduğunda dosyaları hafızaya al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// İnternet olmasa bile sayfaları hafızadan getir
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
