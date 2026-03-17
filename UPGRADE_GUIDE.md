# 🚀 v2.0 升級指南

## 🎉 歡迎使用 v2.0 - Firebase 版本！

v2.0 完全重構，從 Google Drive API 改為使用 **Firebase**，帶來更簡單的設定流程和更強大的功能。

---

## ✨ v2.0 新功能

### 🔥 改用 Firebase 平台

| 功能 | v1.0 (Google Drive) | v2.0 (Firebase) |
|------|---------------------|-----------------|
| **儲存服務** | Google Drive API | Firebase Storage |
| **認證方式** | OAuth 2.0 | Firebase Auth |
| **元數據管理** | 無 | Firestore Database |
| **設定複雜度** | 需要 Client ID + API Key | 僅需 Firebase Config |
| **安全規則** | OAuth 範圍 | Firebase Security Rules |

### 📋 主要改進

✅ **設定更簡單**
- v1.0：需要建立 OAuth 同意畫面、Client ID、API Key
- v2.0：只需複製 Firebase Config，一次搞定

✅ **認證更方便**
- v1.0：複雜的 OAuth 流程
- v2.0：內建 Google 登入，一鍵完成

✅ **檔案管理更完善**
- v1.0：檔案散落在 Google Drive
- v2.0：Firestore 統一管理所有元數據

✅ **安全性更強**
- v1.0：依賴 OAuth 範圍
- v2.0：細緻的 Security Rules 控制

✅ **免費額度更大**
- Firebase Spark 方案：5 GB 儲存空間
- 足夠個人和小團隊使用

---

## 🔄 從 v1.0 遷移到 v2.0

### 重要提醒

⚠️ **v1.0 和 v2.0 不相容**

- v1.0 的檔案儲存在 Google Drive
- v2.0 的檔案儲存在 Firebase Storage
- 兩者無法直接遷移

### 建議的遷移方式

**方案 1：平行使用（推薦）**
- 保留 v1.0 版本存取舊檔案
- 使用 v2.0 版本上傳新檔案
- 逐步將重要檔案手動搬移

**方案 2：重新上傳**
- 從 v1.0 下載所有需要的檔案
- 在 v2.0 重新上傳

**方案 3：僅使用 v2.0**
- 如果 v1.0 沒有重要檔案
- 直接改用 v2.0

---

## 📦 v2.0 檔案結構

```
cloud-uploader-v2/
├── index-v2.html          # 主頁面（Firebase 版本）
├── app-v2.js              # 核心邏輯（Firebase 版本）
├── styles-v2.css          # 樣式（Firebase 主題）
├── manifest.json          # PWA 配置
├── service-worker.js      # 離線支援
├── icon-192.png           # 應用圖標
├── icon-512.png           # 應用圖標
├── FIREBASE_SETUP.md      # Firebase 設定指南
├── firebase-wizard.html   # 視覺化設定精靈
├── README-v2.md           # v2.0 說明文件
└── UPGRADE_GUIDE.md       # 本文件
```

---

## 🎯 快速開始（v2.0）

### 步驟 1：取得 Firebase Config

1. 前往 https://console.firebase.google.com/
2. 建立新專案
3. 新增網頁應用程式
4. 複製 `firebaseConfig`

### 步驟 2：啟動應用程式

```bash
python -m http.server 8000
```

開啟：`http://localhost:8000`

### 步驟 3：輸入設定

在彈出的對話框貼上 Firebase Config，點擊「儲存並啟動」

### 步驟 4：開始使用

點擊「登入 Google」→ 開始上傳檔案！

---

## 🔐 安全性比較

### v1.0 安全機制

```
✅ OAuth 2.0 授權
✅ 僅存取應用建立的檔案
❌ 無細緻權限控制
❌ API Key 可能外洩
```

### v2.0 安全機制

```
✅ Firebase Authentication
✅ Security Rules 細緻控制
✅ 使用者只能存取自己的檔案
✅ Config 公開也安全（由規則保護）
✅ 自動防止未授權存取
```

---

## 💡 功能對照表

| 功能 | v1.0 | v2.0 | 說明 |
|------|------|------|------|
| 多檔案上傳 | ✅ | ✅ | 兩版本都支援 |
| 斷點續傳 | ✅ | ✅ | 兩版本都支援 |
| 拖放上傳 | ✅ | ✅ | 兩版本都支援 |
| 下載檔案 | ✅ | ✅ | 兩版本都支援 |
| 分享連結 | ✅ | ✅ | v2.0 是直接下載連結 |
| 刪除檔案 | ✅ | ✅ | 兩版本都支援 |
| 檔案搜尋 | ✅ | ✅ | 兩版本都支援 |
| 元數據管理 | ❌ | ✅ | v2.0 用 Firestore |
| 使用者頭像 | ❌ | ✅ | v2.0 顯示 Google 頭像 |
| 離線支援 | ✅ | ✅ | 兩版本都是 PWA |

---

## 📊 成本比較

### v1.0 (Google Drive API)

**免費額度：**
- 15 GB 儲存空間（與 Gmail 共用）
- 無流量限制

**限制：**
- API 配額限制
- 需要複雜的 OAuth 設定

### v2.0 (Firebase)

**免費額度（Spark 方案）：**
- 5 GB 儲存空間（專用）
- 每月 1 GB 下載流量
- 每天 50,000 次讀取
- 每天 20,000 次寫入

**優勢：**
- 對個人使用完全足夠
- 設定簡單
- 超額後才收費（可控制）

---

## ❓ 常見問題

### Q1: 我應該升級到 v2.0 嗎？

**建議升級，如果您：**
- 想要更簡單的設定流程
- 需要更好的檔案管理
- 想要更強的安全控制
- 是新使用者

**可以繼續使用 v1.0，如果您：**
- 已經有很多檔案在 Google Drive
- 不想重新設定
- 需要更大的免費儲存空間

### Q2: v2.0 的檔案儲存在哪裡？

**A:** Firebase Storage，與 Google Drive 是不同的服務。

### Q3: v1.0 還會繼續維護嗎？

**A:** v1.0 將維持現狀，但新功能只會加入 v2.0。

### Q4: 可以同時使用 v1.0 和 v2.0 嗎？

**A:** 可以！它們是完全獨立的應用程式。

### Q5: Firebase 設定會外洩嗎？

**A:** Firebase Config 是設計成公開的，安全性由 Security Rules 保護，不需要隱藏。

---

## 🎓 學習資源

### v2.0 專屬文件

- **FIREBASE_SETUP.md** - 完整設定教學
- **firebase-wizard.html** - 視覺化設定精靈
- **README-v2.md** - 功能說明

### Firebase 官方資源

- **Firebase 文件**: https://firebase.google.com/docs
- **Security Rules**: https://firebase.google.com/docs/rules
- **定價說明**: https://firebase.google.com/pricing

---

## 🎯 下一步

1. **閱讀 FIREBASE_SETUP.md** - 了解完整設定流程
2. **使用 firebase-wizard.html** - 跟著精靈一步步設定
3. **測試上傳功能** - 先上傳小檔案測試
4. **設定安全規則** - 確保資料安全

---

## 💬 回饋與支援

如果您在使用 v2.0 時遇到問題：

1. 查看 **FIREBASE_SETUP.md** 的疑難排解區
2. 檢查瀏覽器控制台（F12）的錯誤訊息
3. 確認 Firebase 設定是否正確

---

**歡迎使用 v2.0！** 🎉

更簡單、更強大、更安全的雲端檔案傳輸體驗！
