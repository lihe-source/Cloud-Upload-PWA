// 雲端檔案傳輸系統 v2.0 - Service Worker
// 更新此版本號可強制讓所有使用者重新快取資源
const CACHE_VERSION = 'v2.1';
const CACHE_NAME    = `cloud-uploader-${CACHE_VERSION}`;

const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// ─── 安裝：預快取靜態資源 ─────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting()) // 立即接管，不等待舊 SW 失效
    );
});

// ─── 啟用：清除舊快取 ─────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim()) // 立即控制所有頁面
    );
});

// ─── 請求攔截（Cache First for assets，Network First for HTML）─────────────────
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 跳過非 GET 請求
    if (event.request.method !== 'GET') return;

    // 跳過外部 API（Firebase, Google Fonts, etc.）
    const BYPASS_ORIGINS = [
        'googleapis.com',
        'accounts.google.com',
        'gstatic.com',
        'firebaseio.com',
        'firebasestorage.googleapis.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'ui-avatars.com'
    ];
    if (BYPASS_ORIGINS.some(o => url.hostname.includes(o))) return;

    // HTML → Network First（確保總是最新版本）
    if (event.request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 靜態資源 → Cache First
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response.ok && response.type === 'basic') {
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, response.clone()));
                    }
                    return response;
                });
            })
            .catch(() => caches.match('./index.html'))
    );
});

// ─── 背景同步（預留）─────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-files') {
        event.waitUntil(Promise.resolve());
    }
});

// ─── 推播通知 ─────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    event.waitUntil(
        self.registration.showNotification(data.title || '雲端傳輸', {
            body:    data.body || '有新通知',
            icon:    './icon-192.png',
            badge:   './icon-192.png',
            vibrate: [200, 100, 200],
            data:    { url: data.url || './' }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            const url = event.notification.data?.url || './';
            const existing = windowClients.find(c => c.url === url && 'focus' in c);
            return existing ? existing.focus() : clients.openWindow(url);
        })
    );
});
