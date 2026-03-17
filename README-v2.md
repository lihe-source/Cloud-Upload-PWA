# 🔥 雲端檔案傳輸系統 v2.0 - Firebase 版本

基於 **Firebase** 的 Progressive Web App（PWA）檔案上傳系統，提供更簡單的設定流程和更強大的功能。

![Version](https://img.shields.io/badge/version-2.0.0-orange)
![Firebase](https://img.shields.io/badge/Firebase-Ready-orange)
![PWA](https://img.shields.io/badge/PWA-Enabled-blue)

---

## ✨ v2.0 新特性

### 🔥 完全基於 Firebase

| 服務 | 用途 |
|------|------|
| **Firebase Storage** | 檔案儲存 |
| **Cloud Firestore** | 元數據管理 |
| **Firebase Authentication** | Google 登入 |

### 📋 核心功能

✅ **多檔案併發上傳** - 同時上傳多個檔案  
✅ **斷點續傳** - 上傳中斷自動繼續  
✅ **拖放上傳** - 拖曳檔案到瀏覽器  
✅ **檔案管理** - 下載、分享、刪除  
✅ **Google 登入** - 一鍵登入認證  
✅ **使用者頭像** - 顯示 Google 個人資料  
✅ **即時搜尋** - 快速找到檔案  
✅ **PWA 支援** - 可安裝為桌面應用  

### 📊 詳細資訊顯示

- 📅 上傳時間（YYYY/MM/DD HH:MM）
- 📄 檔案名稱（含附檔名）
- 💾 檔案大小（MB）
- 👤 上傳者資訊

---

## 🚀 快速開始

### 步驟 1：設定 Firebase（5 分鐘）

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案
3. 啟用 Authentication（Google 登入）
4. 啟用 Cloud Firestore
5. 啟用 Cloud Storage
6. 複製 Firebase Config

詳細教學請參考：**[FIREBASE_SETUP.md](FIREBASE_SETUP.md)**

### 步驟 2：啟動應用程式

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx http-server -p 8000
```

### 步驟 3：輸入 Firebase 設定

1. 開啟瀏覽器：`http://localhost:8000`
2. 在彈出的對話框貼上 Firebase Config
3. 點擊「💾 儲存並啟動」

### 步驟 4：開始使用

1. 點擊「登入 Google」
2. 授權登入
3. 開始上傳檔案！

---

## 📁 檔案結構

```
cloud-uploader-v2/
├── index-v2.html          # 主頁面
├── app-v2.js              # 核心邏輯
├── styles-v2.css          # Firebase 主題樣式
├── manifest.json          # PWA 配置
├── service-worker.js      # 離線支援
├── icon-192.png           # 應用圖標
├── icon-512.png           # 應用圖標
├── FIREBASE_SETUP.md      # 📖 Firebase 設定教學
├── firebase-wizard.html   # 🧙 視覺化設定精靈
├── README-v2.md           # 本文件
└── UPGRADE_GUIDE.md       # 從 v1.0 升級指南
```

---

## 🔐 安全性

### Firebase Security Rules

**Firestore：**
```javascript
// 使用者只能讀寫自己的檔案
allow read, write: if request.auth.uid == resource.data.uploadedBy;
```

**Storage：**
```javascript
// 使用者只能存取自己的資料夾
match /{userId}/{allPaths=**} {
  allow read, write: if request.auth.uid == userId;
}
```

### 資料保護

✅ **Firebase Config 加密儲存** - 本地 localStorage  
✅ **Security Rules 保護** - 細緻權限控制  
✅ **使用者隔離** - 無法存取他人檔案  
✅ **認證必要** - 未登入無法操作  

---

## 💰 成本說明

### Firebase Spark（免費）方案

| 服務 | 免費額度 |
|------|---------|
| **Storage** | 5 GB 儲存空間 |
| **Storage** | 每月 1 GB 下載流量 |
| **Firestore** | 1 GB 儲存空間 |
| **Firestore** | 每天 50,000 次讀取 |
| **Firestore** | 每天 20,000 次寫入 |
| **Authentication** | 無限制使用者 |

**💡 對個人使用完全足夠！**

---

## 🎯 v2.0 vs v1.0

| 特性 | v1.0 (Google Drive) | v2.0 (Firebase) |
|------|---------------------|-----------------|
| **設定複雜度** | ⭐⭐⭐ | ⭐ |
| **認證方式** | OAuth 2.0 | Firebase Auth |
| **元數據管理** | 無 | Firestore |
| **安全控制** | OAuth 範圍 | Security Rules |
| **免費儲存** | 15 GB（共用） | 5 GB（專用） |
| **設定步驟** | ~10 步 | ~7 步 |

**建議新使用者使用 v2.0！**

---

## 📚 文件說明

| 文件 | 說明 | 適合對象 |
|------|------|---------|
| **README-v2.md** | 功能介紹（本文件） | 所有人 |
| **FIREBASE_SETUP.md** | 完整設定教學 | ⭐ 新使用者必讀 |
| **firebase-wizard.html** | 視覺化精靈 | 需要引導 |
| **UPGRADE_GUIDE.md** | v1.0 → v2.0 升級 | v1.0 使用者 |

---

## ❓ 常見問題

### Q1: Firebase Config 會外洩嗎？

**A:** Firebase Config 是設計成公開的，不需要隱藏。安全性由 Security Rules 保護。

### Q2: 如何修改 Firebase 設定？

**A:** 點擊右上角的「⚙️ 設定」按鈕即可修改或清除。

### Q3: 可以多人共用嗎？

**A:** 可以！每個使用者用自己的 Google 帳號登入，檔案完全隔離。

### Q4: 超過免費額度怎麼辦？

**A:** Firebase 會自動停止服務（不會收費）。可升級到 Blaze 方案，只為超出部分付費。

### Q5: v1.0 的檔案可以遷移嗎？

**A:** 無法直接遷移。建議手動下載重要檔案後重新上傳，或參考 UPGRADE_GUIDE.md。

---

## 🌟 技術特點

### 前端技術

- **HTML5** - 語意化標記
- **CSS3** - Firebase 主題設計
- **Vanilla JavaScript** - 無框架依賴
- **PWA** - 離線支援、可安裝

### Firebase 服務

- **Firebase SDK 10.7.1** - 最新穩定版
- **Storage** - 檔案儲存
- **Firestore** - NoSQL 資料庫
- **Authentication** - 認證服務

### 核心機制

**斷點續傳：**
```javascript
// Firebase 原生支援 resumable uploads
const uploadTask = storageRef.put(file);
uploadTask.on('state_changed', onProgress);
```

**併發上傳：**
```javascript
// Promise.all 同時上傳多個檔案
await Promise.all(files.map(file => uploadFile(file)));
```

---

## 🔧 進階功能（開發中）

計劃加入的功能：

- 📁 資料夾管理
- 🏷️ 標籤分類
- 🔍 全文搜尋
- 📊 使用量統計
- 🔗 批量分享
- 📱 行動版優化
- 🌐 多語言支援

---

## 📞 技術支援

遇到問題？

1. 查看 **FIREBASE_SETUP.md** 疑難排解
2. 檢查瀏覽器控制台（F12）
3. 確認 Firebase 設定正確
4. 查看 Firebase Console 的使用量

---

## 📜 授權

本專案採用 MIT 授權。

---

## 🙏 致謝

- **Firebase** - 提供強大的後端服務
- **Google Fonts** - 提供精美字體
- **Iconify** - 提供圖示資源

---

**立即開始使用更簡單、更強大的 v2.0！** 🚀

---

## 🔗 相關連結

- [Firebase 官方文件](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase 定價](https://firebase.google.com/pricing)
- [Security Rules 指南](https://firebase.google.com/docs/rules)
