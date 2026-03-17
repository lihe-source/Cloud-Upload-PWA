# 🔥 雲端檔案傳輸系統 v2.0

> 基於 Firebase Storage + Firestore 的 PWA 檔案管理應用，可一鍵部署至 GitHub Pages。

[![Deploy to GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?logo=github)](https://pages.github.com/)
[![Firebase](https://img.shields.io/badge/Powered%20by-Firebase-orange?logo=firebase)](https://firebase.google.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green?logo=pwa)](https://web.dev/progressive-web-apps/)

## ✨ 功能特色

- 📤 拖放 / 點選 / 貼上（Ctrl+V）多檔案上傳
- 📊 即時上傳進度條
- 🔍 檔案即時搜尋（Ctrl+F）
- 🔗 一鍵複製下載連結
- 🗑️ 刪除 Storage 與 Firestore 記錄
- 🔐 Google 帳號登入（僅顯示自己的檔案）
- 📱 PWA：可安裝至桌面 / 手機主畫面
- ⚡ Service Worker 離線快取
- 🌙 深色主題 UI

---

## 🚀 部署到 GitHub Pages（5 步驟）

### 步驟 1 — Fork / 建立 Repository

```bash
git clone https://github.com/YOUR_USERNAME/cloud-uploader.git
cd cloud-uploader
```

### 步驟 2 — 啟用 GitHub Pages

前往 Repository → **Settings** → **Pages**
- Source 選擇 **GitHub Actions**

### 步驟 3 — 推送程式碼

```bash
git add .
git commit -m "🚀 Initial deploy"
git push origin main
```

GitHub Actions 將自動執行 `.github/workflows/deploy.yml` 並部署至：
```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

### 步驟 4 — 設定 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/) 建立新專案
2. 啟用 **Authentication** → Sign-in method → **Google**
3. 啟用 **Storage** → 設定規則（見下方）
4. 啟用 **Firestore Database** → 設定規則（見下方）
5. 前往 **專案設定** → 新增 Web 應用程式 → 複製 `firebaseConfig`

#### Firebase Storage 規則

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{userId}/{allPaths=**} {
      allow read:  if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 100 * 1024 * 1024; // 100MB 限制
    }
  }
}
```

#### Firestore 規則

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /files/{fileId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == resource.data.uploadedBy;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.uploadedBy;
    }
  }
}
```

#### Firestore 複合索引

首次使用時 Console 可能顯示「需要索引」錯誤，點擊錯誤訊息中的連結自動建立，或手動建立：

| Collection | Fields                      |
|------------|-----------------------------|
| files      | uploadedBy ASC, uploadedAt DESC |

### 步驟 5 — 設定授權網域

Firebase Console → Authentication → **Settings** → 授權網域 → 新增：

```
YOUR_USERNAME.github.io
```

---

## 🔧 本機開發

```bash
# 使用任意 HTTP Server（需要 HTTPS 或 localhost 才能使用 Service Worker）
npx serve .
# 或
python3 -m http.server 8080
```

瀏覽器開啟 `http://localhost:8080`，首次啟動時輸入 Firebase 設定即可。

---

## 📁 專案結構

```
.
├── index.html          # 主頁面
├── app.js              # 核心邏輯（Firebase 操作、UI 互動）
├── styles.css          # 樣式
├── service-worker.js   # PWA Service Worker（快取策略）
├── manifest.json       # PWA Manifest
├── icon-192.png        # PWA 圖示
├── icon-512.png        # PWA 圖示
├── .nojekyll           # 停用 GitHub Pages Jekyll 處理
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions 自動部署
```

---

## ⚙️ 技術規格

| 項目 | 說明 |
|------|------|
| Firebase SDK | v10.7.1 (compat 模式) |
| 認證 | Google OAuth 2.0 |
| 儲存 | Firebase Storage |
| 資料庫 | Cloud Firestore |
| 單檔限制 | 100 MB |
| 快取策略 | HTML: Network First / 靜態資源: Cache First |

---

## 🔒 安全說明

- Firebase 設定（apiKey 等）儲存於**使用者本機** `localStorage`，並以 Base64 混淆，不存入任何伺服器
- 每位使用者**只能存取自己上傳的檔案**（由 Firestore / Storage Rules 強制執行）
- `apiKey` 是公開識別符，安全性由 Firebase Rules 保障

---

## 📄 License

MIT © 2025
