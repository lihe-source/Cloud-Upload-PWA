# 📱 PWA 更新指南 - v3.3 智慧更新機制

## 🎯 問題解決

### 遇到的問題

當您在 GitHub Pages 或其他平台更新 PWA 程式後，使用者的瀏覽器仍然顯示舊版本。

**原因：** Service Worker 快取機制會保留舊版本的檔案。

### v3.3 的解決方案

✅ **自動檢測更新** - Service Worker 會自動檢查新版本  
✅ **智慧通知** - 顯示友善的更新提示  
✅ **一鍵更新** - 使用者點擊即可更新  
✅ **網路優先策略** - HTML/JS/CSS 優先從網路獲取  

---

## 🚀 v3.3 更新機制

### 自動更新流程

1. **使用者開啟應用程式**
   - Service Worker 檢查是否有新版本

2. **發現新版本**
   - 下載新檔案並快取
   - 顯示更新通知

3. **使用者點擊「立即更新」**
   - 清除舊快取
   - 重新載入頁面
   - 套用新版本

### 手動更新選項

使用者也可以：
- 按 Ctrl + F5 強制重新整理
- 清除瀏覽器快取

---

## 📝 開發者指南 - 如何發布更新

### 🔴 重要！每次更新必須做的事

每次更新程式碼時，**必須修改以下 3 個檔案**的版本號：

#### 1. `version.js`（必須！）

```javascript
const APP_VERSION = 'v3.3.1'; // 修改此行
const BUILD_DATE = '2026-03-23'; // 修改此行
```

#### 2. `service-worker.js`（必須！）

```javascript
const CACHE_VERSION = 'v3.3.1'; // 修改此行
```

#### 3. `index.html`（可選，但建議）

```html
<title>雲端檔案傳輸系統 v3.3.1</title>
<h1>雲端傳輸 <span class="version">v3.3.1</span></h1>
```

---

## 📋 更新流程（開發者）

### 步驟 1：修改程式碼

修改 `app.js`, `styles.css`, `index.html` 或其他檔案。

### 步驟 2：更新版本號

**務必修改以下檔案：**

**version.js：**
```javascript
const APP_VERSION = 'v3.3.1'; // 從 v3.3.0 改為 v3.3.1
const BUILD_DATE = '2026-03-23'; // 更新日期
```

**service-worker.js：**
```javascript
const CACHE_VERSION = 'v3.3.1'; // 從 v3.3.0 改為 v3.3.1
```

### 步驟 3：提交到 GitHub

```bash
git add .
git commit -m "Update to v3.3.1"
git push
```

### 步驟 4：等待部署

GitHub Pages 通常需要 1-5 分鐘部署。

### 步驟 5：測試更新

1. 開啟應用程式
2. 等待 10-30 秒
3. 應該會看到更新通知
4. 點擊「立即更新」

---

## 🔍 哪些檔案需要更新版本號？

### ✅ 必須更新（每次）

1. **version.js** - APP_VERSION 和 BUILD_DATE
2. **service-worker.js** - CACHE_VERSION

### 📝 建議更新（視情況）

3. **index.html** - title 和顯示的版本號
4. **manifest.json** - name 或 description（可選）

### ❌ 不需要更新

- app.js（除非是版本號相關的代碼）
- styles.css
- 其他檔案

---

## 💡 版本號命名規則

### 語義化版本

建議使用 `vX.Y.Z` 格式：

- **X（主版本）** - 重大更新（例如：v3 → v4）
- **Y（次版本）** - 新功能（例如：v3.2 → v3.3）
- **Z（修訂版本）** - 錯誤修正（例如：v3.3.0 → v3.3.1）

### 範例

```
v3.3.0 - 初始版本（加入更新機制）
v3.3.1 - 修正小錯誤
v3.3.2 - 修正另一個錯誤
v3.4.0 - 加入新功能
v4.0.0 - 重大改版
```

---

## 🐛 疑難排解

### 問題 1：使用者看不到更新通知

**可能原因：**
- Service Worker 版本號沒有更新
- 快取還沒更新

**解決方法：**
1. 確認 `service-worker.js` 的 CACHE_VERSION 已更新
2. 確認 `version.js` 的 APP_VERSION 已更新
3. 等待 1-2 分鐘讓 Service Worker 檢測
4. 手動重新整理（Ctrl + F5）

### 問題 2：更新後仍是舊版本

**解決方法：**

開發者工具（F12）：
1. Application → Service Workers
2. 點擊「Unregister」
3. 重新整理頁面

或者：
1. Application → Storage → Clear site data
2. 重新整理頁面

### 問題 3：Service Worker 沒有更新

**檢查：**

開發者工具（F12） → Console：
```
[SW] Installing Service Worker v3.3.1
[SW] Activating Service Worker v3.3.1
```

如果沒看到這些訊息，表示 Service Worker 沒有更新。

**解決：**
1. 確認版本號已修改
2. 清除快取
3. 重新整理

---

## 📊 更新策略

### 網路優先 vs 快取優先

v3.3 使用混合策略：

**網路優先（HTML, JS, CSS）：**
- 優先從網路獲取最新版本
- 確保使用者總是獲得最新代碼
- 網路失敗時才使用快取

**快取優先（圖片, 圖標）：**
- 優先使用快取
- 提升載入速度
- 減少網路請求

### 程式碼

```javascript
// service-worker.js

// HTML, JS, CSS - 網路優先
if (url.includes('.html') || url.includes('.js') || url.includes('.css')) {
    event.respondWith(networkFirstStrategy(request));
}
// 其他 - 快取優先
else {
    event.respondWith(cacheFirstStrategy(request));
}
```

---

## 📱 使用者體驗

### 自動更新通知

當有新版本時，使用者會看到：

```
┌─────────────────────────────────────┐
│ 🎉  新版本可用！                      │
│                                     │
│     版本 v3.3.1 已準備就緒            │
│                                     │
│  [立即更新]  [稍後再說]               │
└─────────────────────────────────────┘
```

### 更新流程

1. 使用者點擊「立即更新」
2. 顯示「正在更新應用程式...」
3. 頁面自動重新整理
4. 套用新版本

---

## 🎯 最佳實踐

### 1. 每次更新都修改版本號

```javascript
// ❌ 錯誤（忘記更新）
const CACHE_VERSION = 'v3.3.0'; // 舊版本

// ✅ 正確（記得更新）
const CACHE_VERSION = 'v3.3.1'; // 新版本
```

### 2. 使用有意義的版本號

```javascript
// ❌ 不好
const APP_VERSION = 'v1';

// ✅ 好
const APP_VERSION = 'v3.3.1';
```

### 3. 記錄更新內容

```javascript
const VERSION_HISTORY = {
  'v3.3.1': {
    date: '2026-03-23',
    changes: [
      '✅ 修正登入錯誤',
      '✅ 改進用量監控'
    ]
  }
};
```

### 4. 測試更新流程

每次發布前：
1. 在本地測試更新
2. 確認版本號正確
3. 確認更新通知正常顯示
4. 確認快取正確清除

---

## 📚 技術細節

### Service Worker 生命週期

```
安裝（Install）
    ↓
等待（Waiting）
    ↓
啟用（Activate）
    ↓
控制（Controlling）
```

### v3.3 的改進

1. **skipWaiting()** - 跳過等待，立即啟用
2. **clients.claim()** - 立即控制所有頁面
3. **自動通知** - 通知使用者有新版本
4. **網路優先** - 確保獲取最新代碼

---

## ✅ 檢查清單

每次更新時，請確認：

- [ ] 已修改 `version.js` 的 APP_VERSION
- [ ] 已修改 `version.js` 的 BUILD_DATE
- [ ] 已修改 `service-worker.js` 的 CACHE_VERSION
- [ ] 版本號一致（version.js 和 service-worker.js）
- [ ] 已提交到 Git
- [ ] 已推送到 GitHub
- [ ] 等待部署完成（1-5 分鐘）
- [ ] 測試更新通知是否正常

---

## 🎉 總結

v3.3 的智慧更新機制讓 PWA 更新變得簡單：

✅ **開發者** - 只需修改 2 個檔案的版本號  
✅ **使用者** - 自動檢測更新，一鍵更新  
✅ **體驗** - 友善的通知，流暢的更新流程  

**記住：每次更新必須修改版本號！**

---

## 📞 需要幫助？

如果更新有問題：

1. 檢查版本號是否已更新
2. 檢查 Console 的錯誤訊息
3. 清除快取並重新測試
4. 參考本文件的疑難排解章節

**v3.3 讓 PWA 更新變得簡單可靠！** 🚀
