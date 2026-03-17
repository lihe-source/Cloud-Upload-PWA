// Firebase v2.0 應用程式
let firebaseApp = null;
let auth = null;
let storage = null;
let db = null;
let currentUser = null;
let uploadTasks = new Map();

// 簡單的加密/解密
function encryptData(data) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decryptData(encrypted) {
    try {
        const decrypted = decodeURIComponent(escape(atob(encrypted)));
        return JSON.parse(decrypted);
    } catch (e) {
        return null;
    }
}

// Firebase 設定管理
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
        if (encrypted) {
            return decryptData(encrypted);
        }
        return null;
    } catch (e) {
        console.error('載入設定失敗:', e);
        return null;
    }
}

function clearFirebaseConfig() {
    localStorage.removeItem('fb_config_v2');
    showToast('Firebase 設定已清除', 'info');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setupModalEvents();
    
    const config = loadFirebaseConfig();
    if (config) {
        initializeFirebase(config);
    } else {
        showConfigModal();
    }
    
    initializeApp();
});

// 設定模態框事件
function setupModalEvents() {
    const saveBtn = document.getElementById('saveFirebaseConfigBtn');
    const clearBtn = document.getElementById('clearFirebaseConfigBtn');
    const closeBtn = document.getElementById('closeConfigModal');
    const settingsBtn = document.getElementById('settingsButton');
    const radios = document.querySelectorAll('input[name="configMethod"]');
    
    saveBtn.addEventListener('click', handleSaveConfig);
    clearBtn.addEventListener('click', handleClearConfig);
    closeBtn.addEventListener('click', hideConfigModal);
    settingsBtn.addEventListener('click', showConfigModal);
    
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('jsonMethod').style.display = 
                e.target.value === 'json' ? 'block' : 'none';
            document.getElementById('manualMethod').style.display = 
                e.target.value === 'manual' ? 'block' : 'none';
        });
    });
    
    // 點擊模態框外部關閉（僅在已有設定時）
    document.getElementById('firebaseConfigModal').addEventListener('click', (e) => {
        if (e.target.id === 'firebaseConfigModal' && loadFirebaseConfig()) {
            hideConfigModal();
        }
    });
}

function showConfigModal() {
    const modal = document.getElementById('firebaseConfigModal');
    const config = loadFirebaseConfig();
    
    if (config) {
        document.getElementById('firebaseConfigJson').value = JSON.stringify(config, null, 2);
    }
    
    modal.style.display = 'flex';
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
            projectId: document.getElementById('projectIdInput').value.trim(),
            storageBucket: document.getElementById('storageBucketInput').value.trim(),
            messagingSenderId: document.getElementById('messagingSenderIdInput').value.trim(),
            appId: document.getElementById('appIdInput').value.trim()
        };
    }
    
    // 驗證必要欄位
    const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missing = required.filter(key => !config[key]);
    
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
    if (confirm('確定要清除 Firebase 設定嗎？清除後需要重新輸入。')) {
        clearFirebaseConfig();
        if (auth && currentUser) {
            auth.signOut();
        }
        document.getElementById('firebaseConfigJson').value = '';
        document.getElementById('authButton').disabled = true;
        updateAuthUI(null);
    }
}

// 初始化 Firebase
function initializeFirebase(config) {
    try {
        if (firebaseApp) {
            firebaseApp.delete();
        }
        
        firebaseApp = firebase.initializeApp(config);
        auth = firebase.auth();
        storage = firebase.storage();
        db = firebase.firestore();
        
        // 監聽認證狀態變化
        auth.onAuthStateChanged(handleAuthStateChanged);
        
        document.getElementById('authButton').disabled = false;
        showToast('Firebase 已初始化', 'success');
        
    } catch (error) {
        console.error('Firebase 初始化失敗:', error);
        showToast('Firebase 初始化失敗：' + error.message, 'error');
        showConfigModal();
    }
}

// 處理認證狀態變化
function handleAuthStateChanged(user) {
    currentUser = user;
    updateAuthUI(user);
    
    if (user) {
        showToast(`歡迎，${user.displayName || user.email}！`, 'success');
        loadFiles();
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
        document.getElementById('userAvatar').src = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email);
        document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
    } else {
        authButton.classList.remove('connected');
        icon.textContent = '🔐';
        text.textContent = '登入 Google';
        
        userInfo.style.display = 'none';
    }
}

// 應用初始化
function initializeApp() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const selectButton = document.getElementById('selectButton');
    const authButton = document.getElementById('authButton');
    const refreshButton = document.getElementById('refreshButton');
    const searchInput = document.getElementById('searchInput');
    const cancelUpload = document.getElementById('cancelUpload');

    // 拖放上傳
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

    // 點擊上傳
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

    // 授權按鈕
    authButton.addEventListener('click', handleAuthClick);

    // 重新整理按鈕
    refreshButton.addEventListener('click', loadFiles);

    // 搜尋功能
    searchInput.addEventListener('input', (e) => {
        filterFiles(e.target.value);
    });

    // 取消上傳
    cancelUpload.addEventListener('click', cancelAllUploads);

    // 註冊 Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .catch(err => console.error('Service Worker 註冊失敗:', err));
    }
}

// 認證處理
async function handleAuthClick() {
    if (!auth) {
        showToast('請先設定 Firebase', 'error');
        showConfigModal();
        return;
    }
    
    if (currentUser) {
        // 登出
        await auth.signOut();
        showToast('已登出', 'info');
        document.getElementById('filesList').innerHTML = `
            <div class="empty-state">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                    <path d="M30 20H55L70 35V80H30V20Z" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                    <path d="M55 20V35H70" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
                </svg>
                <p>尚未上傳任何檔案</p>
            </div>
        `;
    } else {
        // 登入
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error('登入失敗:', error);
            showToast('登入失敗：' + error.message, 'error');
        }
    }
}

// 處理檔案上傳
async function handleFiles(files) {
    if (!currentUser) {
        showToast('請先登入', 'error');
        return;
    }

    if (files.length === 0) return;

    const progressSection = document.getElementById('uploadProgress');
    const progressList = document.getElementById('progressList');
    progressSection.style.display = 'block';

    // 併發上傳所有檔案
    const uploadPromises = files.map(file => uploadFile(file));
    
    try {
        await Promise.all(uploadPromises);
        showToast(`成功上傳 ${files.length} 個檔案`, 'success');
        setTimeout(() => {
            progressSection.style.display = 'none';
            progressList.innerHTML = '';
        }, 2000);
        loadFiles();
    } catch (error) {
        console.error('上傳錯誤:', error);
    }
}

// 上傳單個檔案（支援斷點續傳）
async function uploadFile(file) {
    const taskId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const fileName = `${currentUser.uid}/${Date.now()}_${file.name}`;
    
    // 創建進度UI
    const progressItem = createProgressItem(file.name, taskId);
    document.getElementById('progressList').appendChild(progressItem);

    try {
        const storageRef = storage.ref(fileName);
        const uploadTask = storageRef.put(file);
        
        uploadTasks.set(taskId, uploadTask);

        // 監聽進度
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                updateProgress(taskId, progress, snapshot.bytesTransferred, snapshot.totalBytes);
            },
            (error) => {
                console.error('上傳錯誤:', error);
                updateProgressError(taskId, error.message);
                uploadTasks.delete(taskId);
            },
            async () => {
                // 上傳完成
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                
                // 儲存檔案元數據到 Firestore
                await db.collection('files').add({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: downloadURL,
                    storagePath: fileName,
                    uploadedBy: currentUser.uid,
                    uploadedByEmail: currentUser.email,
                    uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdAt: new Date().toISOString()
                });
                
                updateProgress(taskId, 100, file.size, file.size);
                uploadTasks.delete(taskId);
            }
        );

        // 等待上傳完成
        await uploadTask;
        return true;
    } catch (error) {
        console.error('上傳錯誤:', error);
        updateProgressError(taskId, error.message);
        uploadTasks.delete(taskId);
        throw error;
    }
}

// UI 更新函數
function createProgressItem(fileName, taskId) {
    const item = document.createElement('div');
    item.className = 'progress-item';
    item.id = `progress-${taskId}`;
    item.innerHTML = `
        <div class="progress-item-header">
            <div class="progress-item-name">${fileName}</div>
            <div class="progress-item-status">0%</div>
        </div>
        <div class="progress-bar">
            <div class="progress-bar-fill" style="width: 0%"></div>
        </div>
    `;
    return item;
}

function updateProgress(taskId, percent, uploaded, total) {
    const item = document.getElementById(`progress-${taskId}`);
    if (!item) return;

    const statusEl = item.querySelector('.progress-item-status');
    const fillEl = item.querySelector('.progress-bar-fill');

    const uploadedMB = (uploaded / (1024 * 1024)).toFixed(2);
    const totalMB = (total / (1024 * 1024)).toFixed(2);

    statusEl.textContent = `${percent.toFixed(1)}% (${uploadedMB}/${totalMB} MB)`;
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
        task.cancel();
        uploadTasks.delete(taskId);
    });
    
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('progressList').innerHTML = '';
    
    showToast('已取消所有上傳', 'info');
}

// 載入檔案清單
async function loadFiles() {
    if (!currentUser) return;

    try {
        const snapshot = await db.collection('files')
            .where('uploadedBy', '==', currentUser.uid)
            .orderBy('uploadedAt', 'desc')
            .get();

        const files = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

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

    // 綁定事件
    files.forEach(file => {
        const downloadBtn = document.getElementById(`download-${file.id}`);
        const copyBtn = document.getElementById(`copy-${file.id}`);
        const deleteBtn = document.getElementById(`delete-${file.id}`);

        if (downloadBtn) downloadBtn.addEventListener('click', () => downloadFile(file));
        if (copyBtn) copyBtn.addEventListener('click', () => copyShareLink(file));
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
                <div class="file-name">${file.name}</div>
                <div class="file-meta">
                    <span>📅 ${createdTime}</span>
                    <span>💾 ${fileSize} MB</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="action-button download" id="download-${file.id}" title="下載">⬇</button>
                <button class="action-button copy" id="copy-${file.id}" title="複製連結">🔗</button>
                <button class="action-button delete" id="delete-${file.id}" title="刪除">🗑</button>
            </div>
        </div>
    `;
}

function getFileIcon(ext) {
    const icons = {
        'pdf': '📄',
        'doc': '📝', 'docx': '📝',
        'xls': '📊', 'xlsx': '📊',
        'ppt': '📽', 'pptx': '📽',
        'jpg': '🖼', 'jpeg': '🖼', 'png': '🖼', 'gif': '🖼',
        'mp4': '🎥', 'avi': '🎥', 'mov': '🎥',
        'mp3': '🎵', 'wav': '🎵',
        'zip': '📦', 'rar': '📦', '7z': '📦',
        'txt': '📃',
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

// 檔案操作
function downloadFile(file) {
    window.open(file.url, '_blank');
    showToast(`正在下載 ${file.name}`, 'success');
}

async function copyShareLink(file) {
    try {
        await navigator.clipboard.writeText(file.url);
        showToast('已複製下載連結', 'success');
    } catch (error) {
        console.error('複製失敗:', error);
        showToast('複製失敗', 'error');
    }
}

async function deleteFile(file) {
    if (!confirm(`確定要刪除「${file.name}」嗎？`)) {
        return;
    }

    try {
        // 刪除 Storage 中的檔案
        const storageRef = storage.ref(file.storagePath);
        await storageRef.delete();
        
        // 刪除 Firestore 中的記錄
        await db.collection('files').doc(file.id).delete();
        
        showToast(`已刪除 ${file.name}`, 'success');
        loadFiles();
    } catch (error) {
        console.error('刪除失敗:', error);
        showToast('刪除失敗：' + error.message, 'error');
    }
}

// 搜尋過濾
function filterFiles(searchTerm) {
    const fileItems = document.querySelectorAll('.file-item');
    const term = searchTerm.toLowerCase();

    fileItems.forEach(item => {
        const fileName = item.getAttribute('data-name');
        if (fileName.includes(term)) {
            item.style.display = 'grid';
        } else {
            item.style.display = 'none';
        }
    });
}

// Toast 通知
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close">✕</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });

    setTimeout(() => {
        toast.remove();
    }, 5000);
}
