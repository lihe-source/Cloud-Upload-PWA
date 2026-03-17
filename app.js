// 雲端檔案傳輸系統 v2.0 - Firebase PWA
// GitHub Pages 優化版本

'use strict';

let firebaseApp = null;
let auth = null;
let storage = null;
let db = null;
let currentUser = null;
let uploadTasks = new Map();

// ─── 加密/解密 (Base64 混淆，防止明文儲存) ───────────────────────────────────
function encryptData(data) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decryptData(encrypted) {
    try {
        return JSON.parse(decodeURIComponent(escape(atob(encrypted))));
    } catch {
        return null;
    }
}

// ─── Firebase 設定管理 ────────────────────────────────────────────────────────
function saveFirebaseConfig(config) {
    try {
        localStorage.setItem('fb_config_v2', encryptData(config));
        return true;
    } catch (e) {
        console.error('儲存設定失敗:', e);
        return false;
    }
}

function loadFirebaseConfig() {
    try {
        const encrypted = localStorage.getItem('fb_config_v2');
        return encrypted ? decryptData(encrypted) : null;
    } catch (e) {
        console.error('載入設定失敗:', e);
        return null;
    }
}

function clearFirebaseConfig() {
    localStorage.removeItem('fb_config_v2');
    showToast('Firebase 設定已清除', 'info');
}

// ─── 初始化入口 ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setupModalEvents();
    initializeApp();

    const config = loadFirebaseConfig();
    if (config) {
        initializeFirebase(config);
    } else {
        showConfigModal();
    }
});

// ─── 設定模態框事件 ───────────────────────────────────────────────────────────
function setupModalEvents() {
    document.getElementById('saveFirebaseConfigBtn').addEventListener('click', handleSaveConfig);
    document.getElementById('clearFirebaseConfigBtn').addEventListener('click', handleClearConfig);
    document.getElementById('closeConfigModal').addEventListener('click', hideConfigModal);
    document.getElementById('settingsButton').addEventListener('click', showConfigModal);

    document.querySelectorAll('input[name="configMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('jsonMethod').style.display =
                e.target.value === 'json' ? 'block' : 'none';
            document.getElementById('manualMethod').style.display =
                e.target.value === 'manual' ? 'block' : 'none';
        });
    });

    // 點擊模態框背景關閉（僅在已有設定時）
    document.getElementById('firebaseConfigModal').addEventListener('click', (e) => {
        if (e.target.id === 'firebaseConfigModal' && loadFirebaseConfig()) {
            hideConfigModal();
        }
    });
}

function showConfigModal() {
    const config = loadFirebaseConfig();
    if (config) {
        document.getElementById('firebaseConfigJson').value = JSON.stringify(config, null, 2);
    }
    document.getElementById('firebaseConfigModal').style.display = 'flex';
}

function hideConfigModal() {
    document.getElementById('firebaseConfigModal').style.display = 'none';
}

function handleSaveConfig() {
    const method = document.querySelector('input[name="configMethod"]:checked').value;
    let config;

    if (method === 'json') {
        try {
            config = JSON.parse(document.getElementById('firebaseConfigJson').value.trim());
        } catch {
            showToast('JSON 格式錯誤，請檢查', 'error');
            return;
        }
    } else {
        config = {
            apiKey:            document.getElementById('apiKeyInput').value.trim(),
            authDomain:        document.getElementById('authDomainInput').value.trim(),
            projectId:         document.getElementById('projectIdInput').value.trim(),
            storageBucket:     document.getElementById('storageBucketInput').value.trim(),
            messagingSenderId: document.getElementById('messagingSenderIdInput').value.trim(),
            appId:             document.getElementById('appIdInput').value.trim()
        };
    }

    const missing = ['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId']
        .filter(k => !config[k]);

    if (missing.length > 0) {
        showToast(`缺少必要欄位：${missing.join(', ')}`, 'error');
        return;
    }

    if (saveFirebaseConfig(config)) {
        hideConfigModal();
        showToast('設定已儲存，正在初始化...', 'success');
        initializeFirebase(config);
    } else {
        showToast('儲存設定失敗', 'error');
    }
}

function handleClearConfig() {
    if (!confirm('確定要清除 Firebase 設定嗎？清除後需要重新輸入。')) return;
    clearFirebaseConfig();
    if (auth && currentUser) auth.signOut();
    document.getElementById('firebaseConfigJson').value = '';
    document.getElementById('authButton').disabled = true;
    updateAuthUI(null);
    clearFilesList();
}

// ─── 初始化 Firebase ──────────────────────────────────────────────────────────
function initializeFirebase(config) {
    try {
        // 使用 DEFAULT app：Compat SDK 的 Google Auth provider
        // 必須綁定在 DEFAULT app，否則會拋出 auth/configuration-not-found
        const existingDefault = firebase.apps.find(a => a.name === '[DEFAULT]');
        if (existingDefault) {
            existingDefault.delete().catch(() => {});
        }

        firebaseApp = firebase.initializeApp(config); // 不傳 name → DEFAULT
        auth    = firebase.auth();
        storage = firebase.storage();
        db      = firebase.firestore();

        // 啟用 Firestore 離線快取
        db.enablePersistence({ synchronizeTabs: true })
          .catch(err => {
              if (err.code === 'failed-precondition') {
                  console.warn('Firestore 離線快取：多標籤頁模式，僅主標籤生效');
              } else if (err.code === 'unimplemented') {
                  console.warn('此瀏覽器不支援 Firestore 離線快取');
              }
          });

        auth.onAuthStateChanged(handleAuthStateChanged);

        // 處理 signInWithRedirect 登入後的回傳（頁面重載時自動執行）
        handleRedirectResult();

        document.getElementById('authButton').disabled = false;
        showToast('Firebase 已初始化 ✓', 'success');

    } catch (error) {
        console.error('Firebase 初始化失敗:', error);
        showToast('Firebase 初始化失敗：' + error.message, 'error');
        showConfigModal();
    }
}

// ─── 認證 ─────────────────────────────────────────────────────────────────────
function handleAuthStateChanged(user) {
    currentUser = user;
    updateAuthUI(user);
    if (user) {
        showToast(`歡迎，${user.displayName || user.email}！`, 'success');
        loadFiles();
    } else {
        clearFilesList();
    }
}

function updateAuthUI(user) {
    const authButton = document.getElementById('authButton');
    const userInfo   = document.getElementById('userInfo');
    const icon       = authButton.querySelector('.auth-icon');
    const text       = authButton.querySelector('.auth-text');

    if (user) {
        authButton.classList.add('connected');
        icon.textContent = '✓';
        text.textContent = '登出';
        userInfo.style.display = 'flex';
        const avatarUrl = user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=FFA000&color=fff`;
        document.getElementById('userAvatar').src = avatarUrl;
        document.getElementById('userName').textContent =
            user.displayName || user.email.split('@')[0];
    } else {
        authButton.classList.remove('connected');
        icon.textContent = '🔐';
        text.textContent = '登入 Google';
        userInfo.style.display = 'none';
    }
}

// ─── 應用初始化（UI 事件綁定）────────────────────────────────────────────────
function initializeApp() {
    const uploadZone   = document.getElementById('uploadZone');
    const fileInput    = document.getElementById('fileInput');
    const selectButton = document.getElementById('selectButton');
    const authButton   = document.getElementById('authButton');
    const refreshButton= document.getElementById('refreshButton');
    const searchInput  = document.getElementById('searchInput');
    const cancelUpload = document.getElementById('cancelUpload');

    // 拖放上傳
    uploadZone.addEventListener('dragover',  (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        handleFiles(Array.from(e.dataTransfer.files));
    });

    // 點擊選擇
    selectButton.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('click', (e) => {
        if (e.target === uploadZone || e.target.closest('.upload-icon, h2, p')) {
            fileInput.click();
        }
    });
    fileInput.addEventListener('change', (e) => {
        handleFiles(Array.from(e.target.files));
        e.target.value = '';
    });

    authButton.addEventListener('click',    handleAuthClick);
    refreshButton.addEventListener('click', loadFiles);
    searchInput.addEventListener('input',   (e) => filterFiles(e.target.value));
    cancelUpload.addEventListener('click',  cancelAllUploads);

    // 貼上上傳（Ctrl+V）
    document.addEventListener('paste', (e) => {
        const files = Array.from(e.clipboardData?.files || []);
        if (files.length) handleFiles(files);
    });

    // 鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // 註冊 Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker 已註冊:', reg.scope))
            .catch(err => console.warn('Service Worker 註冊失敗:', err));
    }
}

// ─── Google 登入/登出 ─────────────────────────────────────────────────────────
async function handleAuthClick() {
    if (!auth) {
        showToast('請先設定 Firebase', 'error');
        showConfigModal();
        return;
    }

    if (currentUser) {
        await auth.signOut();
        showToast('已登出', 'info');
        return;
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    try {
        // 優先使用 Popup；GitHub Pages / 行動裝置若被攔截則自動改用 Redirect
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.warn('Popup 登入失敗，嘗試 Redirect 模式:', error.code);

        const REDIRECT_FALLBACK_CODES = [
            'auth/popup-blocked',
            'auth/popup-closed-by-user',   // 某些瀏覽器在 iframe/PWA 環境中會回傳此錯誤
            'auth/operation-not-supported-in-this-environment'
        ];

        if (REDIRECT_FALLBACK_CODES.includes(error.code)) {
            showToast('正在跳轉至 Google 登入頁面...', 'info');
            try {
                await auth.signInWithRedirect(provider);
                // Redirect 後頁面會重新載入，結果由 getRedirectResult 處理
            } catch (redirectError) {
                console.error('Redirect 登入失敗:', redirectError);
                showToast('登入失敗：' + redirectError.message, 'error');
            }
        } else if (error.code === 'auth/cancelled-popup-request') {
            // 使用者主動關閉，靜默處理
        } else {
            console.error('登入失敗:', error);
            showToast('登入失敗：' + error.message, 'error');
        }
    }
}

// 處理 Redirect 登入後的回傳結果（頁面重新載入後自動執行）
async function handleRedirectResult() {
    if (!auth) return;
    try {
        const result = await auth.getRedirectResult();
        if (result?.user) {
            // onAuthStateChanged 會自動更新 UI，這裡只補顯示 Toast
            showToast(`歡迎，${result.user.displayName || result.user.email}！`, 'success');
        }
    } catch (error) {
        if (error.code !== 'auth/no-auth-event') {
            console.error('Redirect 結果處理失敗:', error);
            showToast('登入失敗：' + error.message, 'error');
        }
    }
}

// ─── 檔案上傳 ─────────────────────────────────────────────────────────────────
async function handleFiles(files) {
    if (!currentUser) {
        showToast('請先登入再上傳檔案', 'error');
        return;
    }
    if (!files.length) return;

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
    const oversized = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length) {
        showToast(`以下檔案超過 100MB 限制：${oversized.map(f => f.name).join(', ')}`, 'error');
        return;
    }

    const progressSection = document.getElementById('uploadProgress');
    const progressList    = document.getElementById('progressList');
    progressSection.style.display = 'block';

    const results = await Promise.allSettled(files.map(file => uploadFile(file)));
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed    = results.filter(r => r.status === 'rejected').length;

    if (succeeded > 0) showToast(`成功上傳 ${succeeded} 個檔案${failed ? `，${failed} 個失敗` : ''}`, succeeded === files.length ? 'success' : 'info');
    if (failed === files.length) showToast('所有檔案上傳失敗', 'error');

    setTimeout(() => {
        progressSection.style.display = 'none';
        progressList.innerHTML = '';
    }, 3000);

    loadFiles();
}

async function uploadFile(file) {
    const taskId    = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const timestamp = Date.now();
    const safeName  = file.name.replace(/[#[\]*?/\\]/g, '_'); // 過濾 Storage 不合法字元
    const storagePath = `${currentUser.uid}/${timestamp}_${safeName}`;

    const progressItem = createProgressItem(file.name, taskId);
    document.getElementById('progressList').appendChild(progressItem);

    return new Promise((resolve, reject) => {
        const storageRef = storage.ref(storagePath);
        const uploadTask = storageRef.put(file, {
            contentType: file.type || 'application/octet-stream',
            customMetadata: { originalName: file.name, uploadedBy: currentUser.email }
        });

        uploadTasks.set(taskId, uploadTask);

        uploadTask.on('state_changed',
            (snapshot) => {
                const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                updateProgress(taskId, pct, snapshot.bytesTransferred, snapshot.totalBytes);
            },
            (error) => {
                updateProgressError(taskId, error.message);
                uploadTasks.delete(taskId);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    await db.collection('files').add({
                        name:              file.name,
                        size:              file.size,
                        type:              file.type || 'application/octet-stream',
                        url:               downloadURL,
                        storagePath,
                        uploadedBy:        currentUser.uid,
                        uploadedByEmail:   currentUser.email,
                        uploadedAt:        firebase.firestore.FieldValue.serverTimestamp(),
                        createdAt:         new Date().toISOString()
                    });
                    updateProgress(taskId, 100, file.size, file.size);
                    uploadTasks.delete(taskId);
                    resolve(downloadURL);
                } catch (err) {
                    updateProgressError(taskId, err.message);
                    reject(err);
                }
            }
        );
    });
}

// ─── 進度條 UI ────────────────────────────────────────────────────────────────
function createProgressItem(fileName, taskId) {
    const item = document.createElement('div');
    item.className = 'progress-item';
    item.id = `progress-${taskId}`;
    // 截斷過長的檔名
    const displayName = fileName.length > 40 ? fileName.slice(0, 37) + '…' : fileName;
    item.innerHTML = `
        <div class="progress-item-header">
            <div class="progress-item-name" title="${escapeHtml(fileName)}">${escapeHtml(displayName)}</div>
            <div class="progress-item-status">0%</div>
        </div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:0%"></div></div>
    `;
    return item;
}

function updateProgress(taskId, percent, uploaded, total) {
    const item = document.getElementById(`progress-${taskId}`);
    if (!item) return;
    const mb = n => (n / 1048576).toFixed(2);
    item.querySelector('.progress-item-status').textContent =
        `${percent.toFixed(1)}% (${mb(uploaded)}/${mb(total)} MB)`;
    item.querySelector('.progress-bar-fill').style.width = `${percent}%`;
}

function updateProgressError(taskId, message) {
    const item = document.getElementById(`progress-${taskId}`);
    if (!item) return;
    const status = item.querySelector('.progress-item-status');
    status.textContent = `錯誤: ${message}`;
    status.style.color = 'var(--danger)';
    item.querySelector('.progress-bar-fill').style.background = 'var(--danger)';
}

function cancelAllUploads() {
    uploadTasks.forEach(task => task.cancel());
    uploadTasks.clear();
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('progressList').innerHTML = '';
    showToast('已取消所有上傳', 'info');
}

// ─── 檔案清單 ─────────────────────────────────────────────────────────────────
let allFiles = [];

async function loadFiles() {
    if (!currentUser) return;

    try {
        const snapshot = await db.collection('files')
            .where('uploadedBy', '==', currentUser.uid)
            .orderBy('uploadedAt', 'desc')
            .get();

        allFiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const searchTerm = document.getElementById('searchInput').value;
        displayFiles(searchTerm ? allFiles.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())) : allFiles);
    } catch (error) {
        console.error('載入檔案失敗:', error);
        // Firestore index 尚未建立時，給予友善提示
        if (error.code === 'failed-precondition') {
            showToast('需要建立 Firestore 索引，請查看 Console 中的連結', 'error');
        } else {
            showToast('載入檔案失敗：' + error.message, 'error');
        }
    }
}

function displayFiles(files) {
    const filesList = document.getElementById('filesList');

    if (!files.length) {
        filesList.innerHTML = `
            <div class="empty-state">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <path d="M30 20H55L70 35V80H30V20Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                    <path d="M55 20V35H70" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                </svg>
                <p>${currentUser ? '尚未上傳任何檔案' : '請先登入'}</p>
            </div>`;
        return;
    }

    filesList.innerHTML = files.map(file => createFileItem(file)).join('');

    files.forEach(file => {
        document.getElementById(`download-${file.id}`)?.addEventListener('click', () => downloadFile(file));
        document.getElementById(`copy-${file.id}`)?.addEventListener('click',     () => copyShareLink(file));
        document.getElementById(`delete-${file.id}`)?.addEventListener('click',   () => deleteFile(file));
    });
}

function clearFilesList() {
    allFiles = [];
    displayFiles([]);
}

function createFileItem(file) {
    const ext      = file.name.split('.').pop().toLowerCase();
    const icon     = getFileIcon(ext);
    const sizeMB   = (file.size / 1048576).toFixed(2);
    const timeStr  = formatDateTime(file.createdAt);
    const safeName = escapeHtml(file.name);

    return `
        <div class="file-item" data-name="${safeName.toLowerCase()}">
            <div class="file-icon">${icon}</div>
            <div class="file-info">
                <div class="file-name" title="${safeName}">${safeName}</div>
                <div class="file-meta">
                    <span>📅 ${timeStr}</span>
                    <span>💾 ${sizeMB} MB</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="action-button download" id="download-${file.id}" title="下載">⬇</button>
                <button class="action-button copy"     id="copy-${file.id}"     title="複製連結">🔗</button>
                <button class="action-button delete"   id="delete-${file.id}"   title="刪除">🗑</button>
            </div>
        </div>`;
}

function getFileIcon(ext) {
    const icons = {
        pdf:'📄', doc:'📝', docx:'📝', xls:'📊', xlsx:'📊',
        ppt:'📽', pptx:'📽', jpg:'🖼', jpeg:'🖼', png:'🖼',
        gif:'🖼', webp:'🖼', mp4:'🎥', avi:'🎥', mov:'🎥',
        mkv:'🎥', mp3:'🎵', wav:'🎵', flac:'🎵',
        zip:'📦', rar:'📦', '7z':'📦', tar:'📦', gz:'📦',
        txt:'📃', md:'📃', html:'🌐', css:'🎨', js:'⚡',
        ts:'⚡', json:'⚙', xml:'⚙', svg:'🎨', py:'🐍'
    };
    return icons[ext] || '📄';
}

function formatDateTime(dateString) {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d)) return '—';
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ─── 檔案操作 ─────────────────────────────────────────────────────────────────
function downloadFile(file) {
    const a = document.createElement('a');
    a.href = file.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
    showToast(`正在下載 ${file.name}`, 'success');
}

async function copyShareLink(file) {
    try {
        await navigator.clipboard.writeText(file.url);
        showToast('已複製下載連結 🔗', 'success');
    } catch {
        // Fallback：建立暫時 input
        const input = document.createElement('input');
        input.value = file.url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('已複製下載連結 🔗', 'success');
    }
}

async function deleteFile(file) {
    if (!confirm(`確定要刪除「${file.name}」嗎？此操作無法復原。`)) return;

    try {
        await storage.ref(file.storagePath).delete();
        await db.collection('files').doc(file.id).delete();
        showToast(`已刪除 ${file.name}`, 'success');
        loadFiles();
    } catch (error) {
        console.error('刪除失敗:', error);
        showToast('刪除失敗：' + error.message, 'error');
    }
}

// ─── 搜尋 ─────────────────────────────────────────────────────────────────────
function filterFiles(searchTerm) {
    if (!allFiles.length) return;
    const term = searchTerm.toLowerCase().trim();
    const filtered = term ? allFiles.filter(f => f.name.toLowerCase().includes(term)) : allFiles;
    displayFiles(filtered);
}

// ─── Toast 通知 ───────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast     = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ'}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
        <button class="toast-close" aria-label="關閉">✕</button>
    `;

    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

    // 自動移除
    setTimeout(() => toast.remove(), 5000);
}

// ─── 工具函式 ─────────────────────────────────────────────────────────────────
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
