// Service Worker v3.4 - 自動更新機制
// ⚠️ 重要：每次更新應用程式時，必須修改此版本號！
const CACHE_VERSION = 'v3.4.0';
const CACHE_NAME = `cloud-uploader-${CACHE_VERSION}`;

// 需要快取的檔案
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './version.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ═══════════════════════════════════════════════════════════════════════
// 安裝 Service Worker
// ═══════════════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // 跳過等待，立即啟用新版本
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// ═══════════════════════════════════════════════════════════════════════
// 啟用 Service Worker
// ═══════════════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // 刪除舊版本的快取
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 立即控制所有頁面
        return self.clients.claim();
      })
      .then(() => {
        // 通知所有客戶端已更新
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: CACHE_VERSION
            });
          });
        });
      })
  );
});

// ═══════════════════════════════════════════════════════════════════════
// 攔截請求 - 網路優先策略（確保獲取最新內容）
// ═══════════════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // 跳過 Firebase 和 Google API 請求
  if (url.includes('googleapis.com') || 
      url.includes('accounts.google.com') ||
      url.includes('gstatic.com') ||
      url.includes('firebaseio.com') ||
      url.includes('firebase.com')) {
    return;
  }

  // 對於 HTML、JS、CSS 使用網路優先策略
  if (url.includes('.html') || 
      url.includes('.js') || 
      url.includes('.css') ||
      url.includes('version.js')) {
    event.respondWith(networkFirstStrategy(event.request));
  } else {
    // 其他資源使用快取優先策略
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 策略：網路優先（用於 HTML/JS/CSS，確保獲取最新版本）
// ═══════════════════════════════════════════════════════════════════════
async function networkFirstStrategy(request) {
  try {
    // 先嘗試從網路獲取
    const networkResponse = await fetch(request);
    
    // 如果成功，更新快取
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // 網路失敗，返回快取
    console.log('[SW] Network failed, using cache:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline - 網路連線失敗', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 策略：快取優先（用於圖片等靜態資源）
// ═══════════════════════════════════════════════════════════════════════
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return new Response('Resource not available', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 推送通知
// ═══════════════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新版本已發布！',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      version: CACHE_VERSION
    },
    actions: [
      {
        action: 'update',
        title: '立即更新'
      },
      {
        action: 'close',
        title: '稍後再說'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('雲端傳輸 v3', options)
  );
});

// ═══════════════════════════════════════════════════════════════════════
// 通知點擊
// ═══════════════════════════════════════════════════════════════════════
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'update') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        if (clientList.length > 0) {
          clientList[0].postMessage({ type: 'FORCE_UPDATE' });
          return clientList[0].focus();
        }
        return clients.openWindow('./');
      })
    );
  } else {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 訊息處理（從主程式接收訊息）
// ═══════════════════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_VERSION
    });
  }
});

console.log('[SW] Service Worker loaded', CACHE_VERSION);
