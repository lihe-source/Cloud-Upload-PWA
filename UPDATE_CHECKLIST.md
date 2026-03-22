# ✅ 更新檢查清單 - 每次更新必讀

## 📝 必須修改的檔案

每次更新程式時，**必須**修改以下檔案：

### 1️⃣ version.js

找到並修改：
```javascript
const APP_VERSION = 'v3.3.0'; // ← 改成新版本號，例如 v3.3.1
const BUILD_DATE = '2026-03-22'; // ← 改成今天的日期
```

### 2️⃣ service-worker.js

找到並修改：
```javascript
const CACHE_VERSION = 'v3.3.0'; // ← 改成新版本號，例如 v3.3.1
```

**⚠️ 重要：兩個檔案的版本號必須一致！**

---

## 🚀 完整更新流程

### Step 1：修改程式碼

修改 `app.js`, `styles.css`, `index.html` 等檔案。

### Step 2：更新版本號

**version.js：**
```javascript
const APP_VERSION = 'v3.3.1'; // 從 v3.3.0 → v3.3.1
const BUILD_DATE = '2026-03-23'; // 更新日期
```

**service-worker.js：**
```javascript
const CACHE_VERSION = 'v3.3.1'; // 從 v3.3.0 → v3.3.1
```

### Step 3：提交到 GitHub

```bash
git add .
git commit -m "Update to v3.3.1: 修正XX問題"
git push
```

### Step 4：等待部署

等待 1-5 分鐘讓 GitHub Pages 部署。

### Step 5：測試

1. 開啟應用程式
2. 等待 10-30 秒
3. 應該會看到更新通知 🎉
4. 點擊「立即更新」

---

## ❌ 常見錯誤

### 錯誤 1：忘記更新版本號

```javascript
// ❌ 錯誤 - 沒有更新
const CACHE_VERSION = 'v3.3.0'; // 舊版本

// ✅ 正確 - 已更新
const CACHE_VERSION = 'v3.3.1'; // 新版本
```

**結果：** 使用者看不到更新！

### 錯誤 2：版本號不一致

```javascript
// version.js
const APP_VERSION = 'v3.3.1';

// service-worker.js
const CACHE_VERSION = 'v3.3.0'; // ❌ 不一致！
```

**結果：** 可能造成混亂！

### 錯誤 3：只更新一個檔案

❌ 只改 version.js  
❌ 只改 service-worker.js  

✅ **兩個都要改！**

---

## 📋 快速檢查

更新前，快速確認：

```
□ version.js 的 APP_VERSION 已改
□ version.js 的 BUILD_DATE 已改
□ service-worker.js 的 CACHE_VERSION 已改
□ 兩個版本號一致
□ 已 git commit
□ 已 git push
```

---

## 🎯 版本號規則

### 格式

```
vX.Y.Z

X = 主版本（重大更新）
Y = 次版本（新功能）
Z = 修訂版本（錯誤修正）
```

### 範例

```
v3.3.0 → v3.3.1  (修正錯誤)
v3.3.1 → v3.3.2  (再修正錯誤)
v3.3.2 → v3.4.0  (新功能)
v3.4.0 → v4.0.0  (重大改版)
```

---

## 💡 提示

### 使用 Git Tag

```bash
git tag v3.3.1
git push --tags
```

這樣可以在 GitHub 上看到版本歷史。

### 記錄更新內容

在 `version.js` 中：

```javascript
const VERSION_HISTORY = {
  'v3.3.1': {
    date: '2026-03-23',
    changes: [
      '✅ 修正登入錯誤',
      '✅ 改進介面'
    ]
  }
};
```

---

## 🔍 測試更新

### 本地測試

1. 啟動應用程式
2. 修改版本號
3. 重新整理（Ctrl + Shift + R）
4. 檢查 Console：
   ```
   [SW] Installing Service Worker v3.3.1
   [SW] Activating Service Worker v3.3.1
   ```

### 部署後測試

1. 等待 GitHub Pages 部署
2. 清除瀏覽器快取
3. 重新開啟應用程式
4. 應該會看到更新通知

---

## 🎉 完成！

只要記住：

**每次更新 = 修改兩個版本號**

1. version.js → APP_VERSION
2. service-worker.js → CACHE_VERSION

就這麼簡單！🚀

---

## 📞 需要幫助？

參考完整文件：
- `PWA_UPDATE_GUIDE.md` - 完整更新指南
- `README.md` - 使用說明

**記住：版本號是關鍵！** ✨
