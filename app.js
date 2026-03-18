// 雲端檔案傳輸系統 v3.2 - Realtime Database 完全免費版
'use strict';

let firebaseApp = null;
let auth = null;
let database = null;
let currentUser = null;
let uploadTasks = new Map();

// 免費額度限制
const FREE_LIMIT = {
    storage: 1 * 1024 * 1024 * 1024, // 1 GB
    maxFileSize: 20 * 1024 * 1024    // 20 MB（建議限制，Base64 後約 26 MB）
};

// ═══════════════════════════════════════════════════════════════════════
// 加密/解密設定
// ═══════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════
// Firebase 設定管理
// ═══════════════════════════════════════════════════════════════════════
function saveFirebaseConfig(config) {
    try {
        localStorage.setItem('fb_config_v3', encryptData(config));
        return true;
    } catch (e) {
        console.error('儲存設定失敗:', e);
        return false;
    }
}

function loadFirebaseConfig() {
    try {
        const encrypted = localStorage.getItem('fb_config_v3');
        return encrypted ? decryptData(encrypted) : null;
    } catch (e) {
        console.error('載入設定失敗:', e);
        return null;
    }
}

function clearFirebaseConfig() {
    localStorage.removeItem('fb_config_v3');
    showToast('Firebase 設定已清除', 'info');
}

// ═══════════════════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════
// 設定模態框事件
// ═══════════════════════════════════════════════════════════════════════
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
            const jsonText = document.getElementById('firebaseConfigJson').value.trim();
            config = JSON.parse(jsonText);
        } catch (e) {
            showToast('JSON 格式錯誤，請檢查', 'error');
            return;
        }
    } else {
        config = {
            apiKey: document.getElementById('apiKeyInput').value.trim(),
            authDomain: document.getElementById('authDomainInput').value.trim(),
            databaseURL: document.getElementById('databaseURLInput').value.trim(),
            projectId: document.getElementById('projectIdInput').value.trim(),
            messagingSenderId: document.getElementById('messagingSenderIdInput').value.trim(),
            appId: document.getElementById('appIdInput').value.trim()
        };
    }

    // 驗證必要欄位（v3.0 需要 databaseURL）
    const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'messagingSenderId', 'appId'];
    const missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
        showToast(`缺少必要欄位：${missing.join(', ')}`, 'error');
        return;
    }

    if (!config.databaseURL.includes('firebaseio.com')) {
        showToast('databaseURL 格式不正確（應包含 firebaseio.com）', 'error');
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
    if (confirm('確定要清除 Firebase 設定嗎？')) {
        clearFirebaseConfig();
        if (auth && currentUser) {
            auth.signOut();
        }
        document.getElementById('firebaseConfigJson').value = '';
        document.getElementById('authButton').disabled = true;
        updateAuthUI(null);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 初始化 Firebase
// ═══════════════════════════════════════════════════════════════════════
function initializeFirebase(config) {
    try {
        const existingDefault = firebase.apps.find(a => a.name === '[DEFAULT]');
        if (existingDefault) {
            existingDefault.delete().catch(() => {});
        }

        firebaseApp = firebase.initializeApp(config);
        auth = firebase.auth();
        database = firebase.database();

        auth.onAuthStateChanged(handleAuthStateChanged);

        document.getElementById('authButton').disabled = false;
        showToast('Firebase 已初始化（Realtime Database）✓', 'success');

    } catch (error) {
        console.error('Firebase 初始化失敗:', error);
        showToast('Firebase 初始化失敗：' + error.message, 'error');
        showConfigModal();
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 認證
// ═══════════════════════════════════════════════════════════════════════
function handleAuthStateChanged(user) {
    currentUser = user;
    updateAuthUI(user);
    if (user) {
        showToast(`歡迎，${user.displayName || user.email}！`, 'success');
        loadFiles();
        calculateUsage();
    } else {
        clearFilesList();
    }
}

function updateAuthUI(user) {
    const authButton = document.getElementById('authButton');
    const userInfo = document.getElementById('userInfo');
    const icon = authButton.querySelector('.auth-icon');
    const text = authButton.querySelector('.auth-text');

    if (user) {
        authButton.classList.add('connected');
        icon.textContent = '✓';
        text.textContent = '登出';

        userInfo.style.display = 'flex';
        document.getElementById('userAvatar').src = user.photoURL || 
            'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email);
        document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
    } else {
        authButton.classList.remove('connected');
        icon.textContent = '🔐';
        text.textContent = '登入 Google';

        userInfo.style.display = 'none';
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 應用初始化
// ═══════════════════════════════════════════════════════════════════════
function initializeApp() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const selectButton = document.getElementById('selectButton');
    const authButton = document.getElementById('authButton');
    const refreshButton = document.getElementById('refreshButton');
    const searchInput = document.getElementById('searchInput');
    const cancelUpload = document.getElementById('cancelUpload');

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        handleFiles(Array.from(e.dataTransfer.files));
    });

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

    authButton.addEventListener('click', handleAuthClick);
    refreshButton.addEventListener('click', loadFiles);
    searchInput.addEventListener('input', (e) => filterFiles(e.target.value));
    cancelUpload.addEventListener('click', cancelAllUploads);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .catch(err => console.error('Service Worker 註冊失敗:', err));
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 認證處理
// ═══════════════════════════════════════════════════════════════════════
async function handleAuthClick() {
    if (!auth) {
        showToast('請先設定 Firebase', 'error');
        showConfigModal();
        return;
    }

    if (currentUser) {
        await auth.signOut();
        showToast('已登出', 'info');
        clearFilesList();
    } else {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error('登入失敗:', error);
            
            // 特別處理授權域名錯誤
            if (error.code === 'auth/unauthorized-domain') {
                showAuthDomainError();
            } else if (error.code === 'auth/popup-closed-by-user') {
                showToast('登入已取消', 'info');
            } else if (error.code === 'auth/popup-blocked') {
                showToast('彈出視窗被阻擋，請允許彈出視窗', 'warning');
            } else {
                showToast('登入失敗：' + error.message, 'error');
            }
        }
    }
}

// 顯示授權域名錯誤的詳細說明
function showAuthDomainError() {
    const currentDomain = window.location.hostname;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>🔒 授權域名設定</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div class="alert alert-error">
                    <strong>⚠️ 錯誤：</strong>此域名未授權進行 OAuth 登入
                </div>
                
                <p><strong>當前域名：</strong><code>${currentDomain}</code></p>
                
                <h3>解決方法（3 步驟，1 分鐘）</h3>
                
                <div class="step-box">
                    <strong>步驟 1：前往 Firebase Console</strong><br>
                    <a href="https://console.firebase.google.com/" target="_blank">https://console.firebase.google.com/</a>
                </div>
                
                <div class="step-box">
                    <strong>步驟 2：進入授權域名設定</strong><br>
                    左側選單 → <strong>Authentication</strong> → <strong>Settings</strong> → <strong>Authorized domains</strong>
                </div>
                
                <div class="step-box">
                    <strong>步驟 3：加入域名</strong><br>
                    點擊「<strong>Add domain</strong>」按鈕<br>
                    輸入：<code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${currentDomain}</code><br>
                    點擊「<strong>Add</strong>」
                </div>
                
                <div class="alert alert-info" style="margin-top: 1rem;">
                    <strong>💡 提示：</strong>如果使用 localhost，請加入：
                    <ul style="margin: 0.5rem 0 0 1.5rem;">
                        <li><code>localhost</code></li>
                        <li><code>127.0.0.1</code></li>
                    </ul>
                </div>
                
                <div class="modal-actions" style="margin-top: 1.5rem;">
                    <button class="btn btn-primary" onclick="window.open('https://console.firebase.google.com/project/_/authentication/settings', '_blank')">
                        開啟 Firebase Console
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        關閉
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ═══════════════════════════════════════════════════════════════════════
// 檔案處理 - Base64 轉換
// ═══════════════════════════════════════════════════════════════════════
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // 移除 data:xxx;base64,
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

// ═══════════════════════════════════════════════════════════════════════
// 處理檔案上傳
// ═══════════════════════════════════════════════════════════════════════
async function handleFiles(files) {
    if (!currentUser) {
        showToast('請先登入再上傳檔案', 'error');
        return;
    }
    if (!files.length) return;

    // 檢查檔案大小
    const oversized = files.filter(f => f.size > FREE_LIMIT.maxFileSize);
    if (oversized.length) {
        showToast(`以下檔案超過 ${FREE_LIMIT.maxFileSize / (1024 * 1024)} MB 限制：${oversized.map(f => f.name).join(', ')}`, 'error');
        return;
    }

    const progressSection = document.getElementById('uploadProgress');
    const progressList = document.getElementById('progressList');
    progressSection.style.display = 'block';

    const results = await Promise.allSettled(files.map(file => uploadFile(file)));
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    if (succeeded > 0) {
        showToast(`成功上傳 ${succeeded} 個檔案${failed ? `，${failed} 個失敗` : ''}`, 
            succeeded === files.length ? 'success' : 'info');
    }
    if (failed === files.length) {
        showToast('所有檔案上傳失敗', 'error');
    }

    setTimeout(() => {
        progressSection.style.display = 'none';
        progressList.innerHTML = '';
    }, 3000);

    loadFiles();
    calculateUsage();
}

// ═══════════════════════════════════════════════════════════════════════
// 上傳單個檔案到 Realtime Database
// ═══════════════════════════════════════════════════════════════════════
async function uploadFile(file) {
    const taskId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const fileId = database.ref().child('files').child(currentUser.uid).push().key;

    const progressItem = createProgressItem(file.name, taskId);
    document.getElementById('progressList').appendChild(progressItem);

    try {
        // 轉換為 Base64
        updateProgress(taskId, 30, file.size * 0.3, file.size, '轉換中...');
        const base64Data = await fileToBase64(file);

        // 準備檔案資料
        const fileData = {
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            data: base64Data,
            uploadedBy: currentUser.uid,
            uploadedByEmail: currentUser.email,
            uploadedAt: firebase.database.ServerValue.TIMESTAMP,
            createdAt: new Date().toISOString()
        };

        // 上傳到 Realtime Database
        updateProgress(taskId, 60, file.size * 0.6, file.size, '上傳中...');
        await database.ref(`files/${currentUser.uid}/${fileId}`).set(fileData);

        updateProgress(taskId, 100, file.size, file.size, '完成');
        return fileId;

    } catch (error) {
        console.error('上傳錯誤:', error);
        updateProgressError(taskId, error.message);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// UI 更新函數
// ═══════════════════════════════════════════════════════════════════════
function createProgressItem(fileName, taskId) {
    const item = document.createElement('div');
    item.className = 'progress-item';
    item.id = `progress-${taskId}`;
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

function updateProgress(taskId, percent, uploaded, total, status = '') {
    const item = document.getElementById(`progress-${taskId}`);
    if (!item) return;

    const statusEl = item.querySelector('.progress-item-status');
    const fillEl = item.querySelector('.progress-bar-fill');

    if (status) {
        statusEl.textContent = `${percent.toFixed(0)}% - ${status}`;
    } else {
        const uploadedMB = (uploaded / (1024 * 1024)).toFixed(2);
        const totalMB = (total / (1024 * 1024)).toFixed(2);
        statusEl.textContent = `${percent.toFixed(1)}% (${uploadedMB}/${totalMB} MB)`;
    }

    fillEl.style.width = `${percent}%`;
}

function updateProgressError(taskId, message) {
    const item = document.getElementById(`progress-${taskId}`);
    if (!item) return;

    const statusEl = item.querySelector('.progress-item-status');
    statusEl.textContent = `錯誤: ${message}`;
    statusEl.style.color = 'var(--danger)';
}

function cancelAllUploads() {
    uploadTasks.forEach((task, taskId) => {
        uploadTasks.delete(taskId);
    });

    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('progressList').innerHTML = '';

    showToast('已取消所有上傳', 'info');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════════
// 載入檔案清單
// ═══════════════════════════════════════════════════════════════════════
async function loadFiles() {
    if (!currentUser || !database) return;

    try {
        const snapshot = await database.ref(`files/${currentUser.uid}`).once('value');
        const filesData = snapshot.val() || {};

        const files = Object.keys(filesData).map(id => ({
            id,
            ...filesData[id]
        })).sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));

        displayFiles(files);
    } catch (error) {
        console.error('載入檔案失敗:', error);
        showToast('載入檔案失敗：' + error.message, 'error');
    }
}

function displayFiles(files) {
    const filesList = document.getElementById('filesList');

    if (files.length === 0) {
        filesList.innerHTML = `
            <div class="empty-state">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <path d="M30 20H55L70 35V80H30V20Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                    <path d="M55 20V35H70" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                </svg>
                <p>尚未上傳任何檔案</p>
            </div>
        `;
        return;
    }

    filesList.innerHTML = files.map(file => createFileItem(file)).join('');

    files.forEach(file => {
        const downloadBtn = document.getElementById(`download-${file.id}`);
        const deleteBtn = document.getElementById(`delete-${file.id}`);

        if (downloadBtn) downloadBtn.addEventListener('click', () => downloadFile(file));
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteFile(file));
    });
}

function createFileItem(file) {
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileIcon = getFileIcon(fileExt);
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    const createdTime = formatDateTime(file.createdAt);

    return `
        <div class="file-item" data-name="${file.name.toLowerCase()}">
            <div class="file-icon">${fileIcon}</div>
            <div class="file-info">
                <div class="file-name">${escapeHtml(file.name)}</div>
                <div class="file-meta">
                    <span>📅 ${createdTime}</span>
                    <span>💾 ${fileSize} MB</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="action-button download" id="download-${file.id}" title="下載">⬇</button>
                <button class="action-button delete" id="delete-${file.id}" title="刪除">🗑</button>
            </div>
        </div>
    `;
}

function getFileIcon(ext) {
    const icons = {
        'pdf': '📄', 'doc': '📝', 'docx': '📝', 'xls': '📊', 'xlsx': '📊',
        'ppt': '📽', 'pptx': '📽', 'jpg': '🖼', 'jpeg': '🖼', 'png': '🖼',
        'gif': '🖼', 'mp4': '🎥', 'avi': '🎥', 'mov': '🎥', 'mp3': '🎵',
        'wav': '🎵', 'zip': '📦', 'rar': '📦', '7z': '📦', 'txt': '📃',
        'html': '🌐', 'css': '🎨', 'js': '⚡'
    };
    return icons[ext] || '📄';
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// ═══════════════════════════════════════════════════════════════════════
// 檔案操作
// ═══════════════════════════════════════════════════════════════════════
async function downloadFile(file) {
    try {
        showToast('正在準備下載...', 'info');

        // 從 Base64 還原檔案
        const blob = base64ToBlob(file.data, file.type);
        const url = URL.createObjectURL(blob);

        // 觸發下載
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(`正在下載 ${file.name}`, 'success');
    } catch (error) {
        console.error('下載失敗:', error);
        showToast('下載失敗：' + error.message, 'error');
    }
}

async function deleteFile(file) {
    if (!confirm(`確定要刪除「${file.name}」嗎？`)) return;

    try {
        await database.ref(`files/${currentUser.uid}/${file.id}`).remove();
        showToast(`已刪除 ${file.name}`, 'success');
        loadFiles();
        calculateUsage();
    } catch (error) {
        console.error('刪除失敗:', error);
        showToast('刪除失敗：' + error.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 用量計算
// ═══════════════════════════════════════════════════════════════════════
async function calculateUsage() {
    if (!currentUser || !database) return;

    try {
        const snapshot = await database.ref(`files/${currentUser.uid}`).once('value');
        const filesData = snapshot.val() || {};

        let totalSize = 0;
        let fileCount = 0;

        Object.values(filesData).forEach(file => {
            // Base64 資料大小（實際儲存大小）
            const base64Size = file.data ? file.data.length : 0;
            totalSize += base64Size;
            fileCount++;
        });

        const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
        const totalGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
        const percentage = (totalSize / FREE_LIMIT.storage * 100).toFixed(1);

        const sizeText = totalGB >= 1 ? `${totalGB} GB` : `${totalMB} MB`;

        // 更新顯示
        const usageStats = document.getElementById('usageStats');
        usageStats.querySelector('.usage-fill').style.width = `${Math.min(percentage, 100)}%`;
        usageStats.querySelector('.usage-fill').textContent = `${percentage}%`;
        usageStats.querySelector('.usage-value').textContent = sizeText;
        usageStats.querySelectorAll('.usage-value')[2].textContent = `${fileCount} 個`;

        // 警告檢查
        if (percentage >= 90) {
            showToast('⚠️ 警告：儲存空間已使用 90%！', 'error');
        } else if (percentage >= 80) {
            showToast('⚠️ 提醒：儲存空間已使用 80%', 'warning');
        }

    } catch (error) {
        console.error('計算用量失敗:', error);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 搜尋過濾
// ═══════════════════════════════════════════════════════════════════════
function filterFiles(searchTerm) {
    const fileItems = document.querySelectorAll('.file-item');
    const term = searchTerm.toLowerCase();

    fileItems.forEach(item => {
        const fileName = item.getAttribute('data-name');
        item.style.display = fileName.includes(term) ? 'grid' : 'none';
    });
}

function clearFilesList() {
    document.getElementById('filesList').innerHTML = `
        <div class="empty-state">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <path d="M30 20H55L70 35V80H30V20Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                <path d="M55 20V35H70" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
            </svg>
            <p>尚未上傳任何檔案</p>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════════
// Toast 通知
// ═══════════════════════════════════════════════════════════════════════
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close">✕</button>
    `;

    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

    setTimeout(() => toast.remove(), 5000);
}
