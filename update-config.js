// ═══════════════════════════════════════════════════════════════════════
// 🆕 v3.4 - 自動更新設定
// ═══════════════════════════════════════════════════════════════════════

// 更新設定選項
const UPDATE_STRATEGIES = {
    AUTO: 'auto',           // 自動更新（預設）
    NOTIFY: 'notify',       // 顯示通知
    MANUAL: 'manual'        // 完全手動
};

// 取得更新策略
function getUpdateStrategy() {
    const saved = localStorage.getItem('update_strategy');
    return saved || UPDATE_STRATEGIES.AUTO; // 預設自動更新
}

// 設定更新策略
function setUpdateStrategy(strategy) {
    localStorage.setItem('update_strategy', strategy);
    showToast('更新設定已儲存', 'success');
}

// 自動更新倒數計時
let autoUpdateTimer = null;
let autoUpdateCountdown = 10; // 10 秒倒數

// 顯示自動更新倒數
function showAutoUpdateCountdown(version) {
    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.className = 'update-notification auto';
    notification.innerHTML = `
        <div class="update-content">
            <div class="update-icon">🚀</div>
            <div class="update-message">
                <strong>新版本 ${version} 已下載完成</strong>
                <p id="countdown-text">將在 <span id="countdown">${autoUpdateCountdown}</span> 秒後自動更新...</p>
            </div>
            <button class="update-button" onclick="updateAppNow()">
                立即更新
            </button>
            <button class="update-dismiss" onclick="cancelAutoUpdate()">
                取消自動更新
            </button>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 開始倒數
    let countdown = autoUpdateCountdown;
    const countdownElement = document.getElementById('countdown');
    
    autoUpdateTimer = setInterval(() => {
        countdown--;
        if (countdownElement) {
            countdownElement.textContent = countdown;
        }
        
        if (countdown <= 0) {
            clearInterval(autoUpdateTimer);
            updateAppNow();
        }
    }, 1000);
}

// 立即更新
function updateAppNow() {
    if (autoUpdateTimer) {
        clearInterval(autoUpdateTimer);
        autoUpdateTimer = null;
    }
    
    const notification = document.getElementById('updateNotification');
    if (notification) {
        notification.remove();
    }
    
    showToast('正在更新應用程式...', 'info');
    
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

// 取消自動更新
function cancelAutoUpdate() {
    if (autoUpdateTimer) {
        clearInterval(autoUpdateTimer);
        autoUpdateTimer = null;
    }
    
    const notification = document.getElementById('updateNotification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    showToast('已取消自動更新，請稍後手動重新載入', 'info');
}

// 顯示更新設定對話框
function showUpdateSettings() {
    const currentStrategy = getUpdateStrategy();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>⚙️ 更新設定</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body">
                <p><strong>選擇應用程式更新方式：</strong></p>
                
                <div class="update-strategy-options">
                    <label class="strategy-option ${currentStrategy === UPDATE_STRATEGIES.AUTO ? 'selected' : ''}">
                        <input type="radio" name="updateStrategy" value="${UPDATE_STRATEGIES.AUTO}" 
                               ${currentStrategy === UPDATE_STRATEGIES.AUTO ? 'checked' : ''}>
                        <div class="strategy-info">
                            <strong>🚀 自動更新（推薦）</strong>
                            <p>檢測到新版本後，10 秒內自動更新</p>
                            <small>✅ 最方便，無需手動操作</small>
                        </div>
                    </label>
                    
                    <label class="strategy-option ${currentStrategy === UPDATE_STRATEGIES.NOTIFY ? 'selected' : ''}">
                        <input type="radio" name="updateStrategy" value="${UPDATE_STRATEGIES.NOTIFY}"
                               ${currentStrategy === UPDATE_STRATEGIES.NOTIFY ? 'checked' : ''}>
                        <div class="strategy-info">
                            <strong>🔔 顯示通知</strong>
                            <p>顯示更新通知，由您決定何時更新</p>
                            <small>⚡ 平衡自動化與控制</small>
                        </div>
                    </label>
                    
                    <label class="strategy-option ${currentStrategy === UPDATE_STRATEGIES.MANUAL ? 'selected' : ''}">
                        <input type="radio" name="updateStrategy" value="${UPDATE_STRATEGIES.MANUAL}"
                               ${currentStrategy === UPDATE_STRATEGIES.MANUAL ? 'checked' : ''}>
                        <div class="strategy-info">
                            <strong>✋ 手動更新</strong>
                            <p>不顯示任何通知，完全由您控制</p>
                            <small>🔧 適合進階使用者</small>
                        </div>
                    </label>
                </div>
                
                <div class="alert alert-info" style="margin-top: 1.5rem;">
                    <strong>💡 提示：</strong>自動更新可確保您使用最新功能和安全修正。
                </div>
                
                <div class="modal-actions" style="margin-top: 1.5rem;">
                    <button class="btn btn-primary" onclick="saveUpdateStrategy()">
                        儲存設定
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        取消
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 更新選項樣式
    modal.querySelectorAll('input[name="updateStrategy"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            modal.querySelectorAll('.strategy-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            e.target.closest('.strategy-option').classList.add('selected');
        });
    });
}

// 儲存更新策略
function saveUpdateStrategy() {
    const selected = document.querySelector('input[name="updateStrategy"]:checked');
    if (selected) {
        setUpdateStrategy(selected.value);
        document.querySelector('.modal').remove();
    }
}

console.log('[UpdateConfig] Auto-update configuration loaded. Strategy:', getUpdateStrategy());
