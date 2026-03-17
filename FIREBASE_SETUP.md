# 🔥 Firebase 設定完整指南 - v2.0

## 📋 為什麼選擇 Firebase？

相比 Google Drive API，Firebase 有以下優勢：

✅ **設定更簡單** - 只需一組設定，不需要 OAuth 配置  
✅ **認證更方便** - 內建 Google 登入  
✅ **更好的檔案管理** - Firestore 儲存元數據  
✅ **更強大的安全規則** - 細緻的權限控制  
✅ **免費額度充足** - Spark 方案免費使用  

**預計設定時間：5-10 分鐘**

---

## 步驟 1：建立 Firebase 專案（2 分鐘）

### 1.1 進入 Firebase Console

前往：https://console.firebase.google.com/

使用 Google 帳號登入。

### 1.2 建立新專案

1. 點擊「新增專案」或「建立專案」
2. 輸入專案名稱：`雲端檔案傳輸` 或您喜歡的名稱
3. (選擇性) 啟用 Google Analytics
   - 如不需要可以關閉
4. 點擊「建立專案」
5. 等待約 30 秒，專案建立完成

---

## 步驟 2：新增網頁應用程式（1 分鐘）

### 2.1 註冊應用程式

1. 在專案首頁，點擊「網頁」圖示（`</>`）
2. 輸入應用程式暱稱：`雲端傳輸 Web`
3. **不需要**勾選「設定 Firebase Hosting」
4. 點擊「註冊應用程式」

### 2.2 複製 Firebase 設定

會顯示一段 JavaScript 代碼：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**複製整個 `firebaseConfig` 物件的內容（大括號內的所有內容）**

點擊「繼續前往主控台」

---

## 步驟 3：啟用 Authentication（1 分鐘）

### 3.1 進入 Authentication

1. 在左側選單點擊「Authentication」
2. 點擊「開始使用」按鈕

### 3.2 啟用 Google 登入

1. 在「登入方式」分頁
2. 點擊「Google」
3. 切換開關至「啟用」
4. 輸入專案支援電子郵件（選擇您的 Gmail）
5. 點擊「儲存」

---

## 步驟 4：啟用 Cloud Firestore（1 分鐘）

### 4.1 建立資料庫

1. 在左側選單點擊「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇位置：
   - 建議選擇 `asia-east1` (台灣) 或 `asia-northeast1` (日本)
4. 安全規則：選擇「以**測試模式**啟動」
   - 之後會設定正確的規則
5. 點擊「啟用」

### 4.2 設定安全規則

1. 在 Firestore 頁面，點擊「規則」分頁
2. 將規則替換為：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 檔案集合：只能讀寫自己的檔案
    match /files/{fileId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == resource.data.uploadedBy;
      allow create: if request.auth != null 
                    && request.auth.uid == request.resource.data.uploadedBy;
    }
  }
}
```

3. 點擊「發布」

---

## 步驟 5：啟用 Cloud Storage（1 分鐘）

### 5.1 建立儲存空間

1. 在左側選單點擊「Storage」
2. 點擊「開始使用」
3. 安全規則：選擇「以**測試模式**啟動」
4. Storage 位置：使用與 Firestore 相同的位置
5. 點擊「完成」

### 5.2 設定安全規則

1. 在 Storage 頁面，點擊「Rules」分頁
2. 將規則替換為：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 使用者只能讀寫自己資料夾下的檔案
    match /{userId}/{allPaths=**} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
    }
  }
}
```

3. 點擊「發布」

---

## 步驟 6：設定應用程式

### 6.1 啟動應用程式

**Python（推薦）：**
```bash
cd 您的專案路徑
python -m http.server 8000
```

**Node.js：**
```bash
npx http-server -p 8000
```

### 6.2 開啟瀏覽器

前往：`http://localhost:8000`

### 6.3 輸入 Firebase 設定

第一次開啟時會顯示「Firebase 專案設定」對話框：

**方法 1（推薦）：貼上完整 JSON**

直接貼上步驟 2.2 複製的整個 config：

```json
{
  "apiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789012",
  "appId": "1:123456789012:web:abcdef123456"
}
```

**方法 2：逐一輸入欄位**

也可以選擇「方法 2」逐一輸入各個欄位。

點擊「💾 儲存並啟動」

---

## 步驟 7：測試功能

### 7.1 登入

1. 點擊「登入 Google」按鈕
2. 選擇您的 Google 帳號
3. 允許授權

### 7.2 上傳測試

1. 選擇一個小檔案（1-5 MB）
2. 拖曳到上傳區域或點擊「選擇檔案」
3. 觀察上傳進度
4. 檔案出現在清單中

### 7.3 測試功能

- ⬇️ 下載檔案
- 🔗 複製下載連結
- 🗑 刪除檔案

---

## ✅ 設定完成！

現在您可以：

✅ 使用 Google 帳號登入  
✅ 上傳檔案到 Firebase Storage  
✅ 檔案元數據儲存在 Firestore  
✅ 下載、分享、刪除檔案  
✅ 完整的斷點續傳支援  

---

## 📊 Firebase 免費額度

**Spark（免費）方案包含：**

| 服務 | 免費額度 |
|------|---------|
| **Storage** | 5 GB 儲存空間 |
| **Storage** | 每月 1 GB 下載流量 |
| **Firestore** | 1 GB 儲存空間 |
| **Firestore** | 每天 50,000 次讀取 |
| **Firestore** | 每天 20,000 次寫入 |
| **Authentication** | 無限制使用者 |

對於個人使用來說，免費額度非常充足！

---

## 🔐 安全性說明

### 為什麼安全規則很重要？

Firebase 的安全規則確保：

✅ 使用者只能存取自己的檔案  
✅ 未登入的人無法上傳/下載  
✅ 無法刪除別人的檔案  

### 目前的安全規則

**Firestore：**
- 只能讀寫 `uploadedBy` 欄位等於自己 UID 的文件

**Storage：**
- 只能讀寫 `{userId}/` 資料夾下的檔案
- 其中 `{userId}` 必須等於登入者的 UID

---

## ❓ 常見問題

### Q1: Firebase 設定會外洩嗎？

**A:** Firebase Config 是公開的，不需要隱藏。安全性由 **安全規則** 保護，而不是靠隱藏設定。

### Q2: 如何查看已上傳的檔案？

**A:** 
1. 前往 Firebase Console → Storage
2. 可以看到所有上傳的檔案（依使用者 UID 分類）

### Q3: 如何修改 Firebase 設定？

**A:** 點擊右上角的「⚙️ 設定」按鈕即可修改或清除設定。

### Q4: 可以使用其他登入方式嗎？

**A:** 可以！Firebase 支援：
- Email/密碼
- Facebook
- Twitter
- GitHub
- 電話號碼
等多種登入方式。需要在 Authentication 中啟用。

### Q5: 超過免費額度怎麼辦？

**A:** 
1. Firebase 會自動停止服務（不會收費）
2. 可以升級到 Blaze（隨用隨付）方案
3. 只為超出部分付費，非常便宜

---

## 🔧 進階設定（選擇性）

### 1. 設定自訂網域

如果有自己的網域：

1. Firebase Console → Authentication → Settings
2. 在「授權網域」加入您的網域
3. 在 Hosting 中設定自訂網域

### 2. 啟用離線持續性

在 `app-v2.js` 加入：

```javascript
db.enablePersistence()
  .catch((err) => {
    console.log('離線模式失敗:', err);
  });
```

### 3. 監控使用量

1. Firebase Console → Usage and billing
2. 查看各項服務的使用情況
3. 設定預算提醒

---

## 📚 更多資源

- **官方文件**: https://firebase.google.com/docs
- **安全規則指南**: https://firebase.google.com/docs/rules
- **定價說明**: https://firebase.google.com/pricing

---

## 🎉 完成！

恭喜您成功設定 Firebase！

相比 v1.0 的 Google Drive API：
- ✅ 設定步驟更少（7 步 vs 步驟更多）
- ✅ 不需要 OAuth 複雜配置
- ✅ 更好的檔案管理
- ✅ 更強大的安全控制

**立即開始使用您的雲端檔案傳輸系統吧！** 🚀
