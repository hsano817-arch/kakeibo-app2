// v2: ネットワーク優先。オンライン時は常に最新のファイルを取得し、
// 通信できない時だけキャッシュ（前回開いた時の内容）を使う。
const CACHE_NAME = 'kakeibo-cache-v6';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(event.request))
  );
});
