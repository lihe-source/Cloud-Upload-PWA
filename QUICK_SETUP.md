# ⚡ 快速設定指南 - 10 分鐘完成

## 📋 準備工作

需要：Google 帳號

---

## 🚀 設定步驟

### 步驟 1：建立 Firebase 專案（2 分鐘）

1. 前往 https://console.firebase.google.com/
2. 點擊「新增專案」
3. 輸入專案名稱：`雲端檔案傳輸`
4. 點擊「建立專案」

### 步驟 2：啟用 Authentication（1 分鐘）

1. 左側選單 → **Authentication**
2. 點擊「開始使用」
3. 選擇「**Google**」
4. 啟用，點擊「儲存」

**⭐ 重要：設定授權域名**
5. 點擊頂部的「**Settings**」分頁
6. 往下捲動到「**Authorized domains**」
7. 點擊「**Add domain**」
8. 輸入 `localhost`，點擊「**Add**」
9. 再次點擊「**Add domain**」
10. 輸入 `127.0.0.1`，點擊「**Add**」

### 步驟 3：啟用 Realtime Database（2 分鐘）

1. 左側選單 → **Realtime Database**
2. 點擊「建立資料庫」
3. 位置：選擇 `us-central1`
4. 模式：選擇「**以鎖定模式啟動**」
5. 點擊「啟用」

### 步驟 4：設定 Security Rules（1 分鐘）

1. 在 Realtime Database 頁面
2. 點擊「**規則**」分頁
3. 複製以下規則並貼上：

```json
{
  "rules": {
    "files": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

4. 點擊「**發布**」

### 步驟 5：取得 Firebase Config（2 分鐘）

1. 點擊左上角「專案總覽」旁的齒輪 → 「專案設定」
2. 往下捲動到「您的應用程式」區域
3. 點擊「**網頁**」圖示（`</>`）
4. 應用程式暱稱：`雲端傳輸`
5. 點擊「註冊應用程式」
6. **複製整個 firebaseConfig 物件**

範例：
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

⚠️ **重要：確保包含 `databaseURL`！**

### 步驟 6：啟動應用程式（1 分鐘）

```bash
python -m http.server 8000
```

開啟瀏覽器：`http://localhost:8000`

### 步驟 7：輸入設定（1 分鐘）

1. 會自動彈出「Firebase 專案設定」對話框
2. 將步驟 5 複製的 config **貼上**
3. 點擊「💾 儲存並啟動」

---

## ✅ 完成！

現在可以：

1. 點擊「**登入 Google**」
2. 授權登入
3. 開始上傳檔案！

---

## 🎯 重點提醒

### ⚠️ 常見錯誤

**錯誤 1：上傳失敗**
→ 檢查 Security Rules 是否正確設定

**錯誤 2：找不到 databaseURL**
→ 確認已啟用 Realtime Database

**錯誤 3：無法登入**
→ 確認已啟用 Google Authentication

### ✅ 設定檢查清單

- [ ] Firebase 專案已建立
- [ ] Authentication（Google）已啟用
- [ ] Realtime Database 已建立
- [ ] Security Rules 已設定並發布
- [ ] Firebase Config 已複製（包含 databaseURL）
- [ ] 已貼上設定到應用程式
- [ ] 已成功登入 Google

---

## 💡 下一步

### 開始使用

1. 上傳測試檔案（< 5 MB）
2. 查看用量監控
3. 嘗試下載和刪除功能

### 優化使用

1. 壓縮圖片後再上傳
2. 定期清理不需要的檔案
3. 檔案大小保持在 < 20 MB

---

**設定完成，開始享受免費的雲端檔案傳輸！** 🎉
