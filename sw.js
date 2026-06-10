const CACHE_NAME = "game-studio-v1";
const STATIC_ASSETS = [
  "./launcher.html",
  "./manifest.json"
];

// 安装 - 缓存静态资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("缓存静态资源");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活 - 清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 请求拦截 - 缓存优先策略
self.addEventListener("fetch", (event) => {
  // 只处理GET请求
  if (event.request.method !== "GET") return;

  // 游戏文件使用网络优先（保持最新）
  if (event.request.url.endsWith(".html") && !event.request.url.includes("launcher.html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 其他资源使用缓存优先
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
