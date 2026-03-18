# 🎯 雲端檔案傳輸系統 v3.2

## 🆓 完全免費 - 使用 Realtime Database

**不使用 Storage，完全避免收費疑慮！**

---

## ✨ 核心特點

✅ **完全免費** - 使用 Realtime Database（不使用 Storage）  
✅ **大流量** - 10 GB/月 下載流量  
✅ **用量監控** - 即時顯示使用量  
✅ **簡單設定** - 10 分鐘完成  

---

## 📊 免費額度

```
儲存空間：1 GB
下載流量：10 GB/月
檔案大小：建議 < 20 MB
```

**個人使用完全免費！**

---

## 🚀 快速開始

### 1. 設定 Firebase（10 分鐘）

#### 步驟 1：建立專案
1. 前往 https://console.firebase.google.com/
2. 點擊「新增專案」
3. 輸入專案名稱，點擊「建立專案」

#### 步驟 2：啟用 Authentication
1. 左側選單 → Authentication
2. 點擊「開始使用」
3. 選擇「Google」登入
4. 啟用並儲存

**⭐ 重要：設定授權域名（必須！）**
5. 點擊頂部的「Settings」分頁
6. 往下捲動到「Authorized domains」
7. 點擊「Add domain」，輸入 `localhost`，點擊「Add」
8. 再次點擊「Add domain」，輸入 `127.0.0.1`，點擊「Add」

💡 **為什麼需要這步驟？** 沒有設定會出現登入錯誤！詳見 `AUTH_DOMAIN_SETUP.md`

#### 步驟 3：啟用 Realtime Database
1. 左側選單 → Realtime Database
2. 點擊「建立資料庫」
3. 選擇位置（建議 us-central1）
4. 選擇「以鎖定模式啟動」
5. 點擊「啟用」

#### 步驟 4：設定 Security Rules
在 Realtime Database → 規則，貼上：

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

點擊「發布」

#### 步驟 5：取得設定
1. 專案設定 → 您的應用程式
2. 點擊「網頁」圖示（</>）
3. 註冊應用程式
4. **複製整個 firebaseConfig**（確保包含 databaseURL）

```javascript
{
  "apiKey": "AIza...",
  "authDomain": "xxx.firebaseapp.com",
  "databaseURL": "https://xxx.firebaseio.com",  // ⭐ 必須有
  "projectId": "xxx",
  "messagingSenderId": "123...",
  "appId": "1:123..."
}
```

### 2. 啟動應用程式

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx http-server -p 8000
```

開啟瀏覽器：`http://localhost:8000`

### 3. 輸入設定

1. 第一次開啟會顯示設定對話框
2. 貼上 Firebase Config
3. 點擊「儲存並啟動」

### 4. 開始使用

1. 點擊「登入 Google」
2. 上傳檔案（建議 < 20 MB）
3. 完全免費！

---

## 💡 使用建議

### 適合上傳的檔案

✅ 文件（PDF, DOCX, TXT）- 完美  
✅ 圖片（JPG, PNG）- 壓縮後上傳  
✅ 程式碼（ZIP）- 非常適合  
✅ 小型資料檔 - 完美  

### 不建議上傳

❌ 影片（太大）  
❌ RAW 照片（太大）  
❌ 大型壓縮檔（> 20 MB）  

### 優化技巧

1. **壓縮圖片**
   - 使用 TinyPNG 或 Squoosh
   - 可節省 80% 空間

2. **定期清理**
   - 刪除不需要的舊檔案
   - 應用程式內建用量監控

3. **檔案命名**
   - 使用日期命名（方便管理）
   - 例：2024-03-17_report.pdf

---

## 📋 功能列表

✅ 多檔案併發上傳  
✅ 拖放上傳  
✅ 即時用量監控  
✅ 下載檔案  
✅ 刪除檔案  
✅ 搜尋檔案  
✅ PWA 支援（可安裝）  

---

## 💰 成本說明

### 完全免費

個人使用**完全在免費額度內**：

```
每月上傳 50 個檔案（平均 10 MB）
= 約 665 MB（Base64 後）
✅ 在 1 GB 額度內

每月下載 20 次
= 約 266 MB
✅ 在 10 GB 額度內
```

### 超額成本（幾乎不會發生）

```
儲存：每 GB $1/月
下載：每 10 GB $1/月

結論：個人使用不會超額
```

---

## 🔧 檔案結構

```
v3.2/
├── index.html         # 主頁面
├── app.js            # 核心邏輯
├── styles.css        # 樣式
├── manifest.json     # PWA 配置
├── service-worker.js # 離線支援
├── icon-192.png      # 應用圖標
├── icon-512.png      # 應用圖標
└── README.md         # 本文件
```

---

## ⚠️ 注意事項

### 檔案大小限制

建議 < 20 MB，因為：
- Base64 編碼會增加 33% 大小
- 20 MB → Base64 後約 26.6 MB
- 確保上傳和下載效能

### Security Rules 很重要

沒有設定 Security Rules 會導致：
- ❌ 無法上傳檔案
- ❌ 無法讀取檔案

**請務必依照設定步驟設定規則！**

---

## 🐛 疑難排解

### 問題：上傳失敗

**解決方法：**
1. 檢查 Security Rules 是否正確設定
2. 確認檔案 < 20 MB
3. 按 F12 查看控制台錯誤訊息

### 問題：找不到 databaseURL

**解決方法：**
1. 確認已啟用 Realtime Database
2. 重新複製 Firebase Config
3. 確保 databaseURL 包含在內

### 問題：下載速度慢

**這是正常的！**
- Base64 解碼需要時間
- 大檔案會稍慢一些

---

## 📞 需要幫助？

### 設定問題

1. 確認已完成所有設定步驟
2. 檢查 Firebase Console 的服務狀態
3. 查看瀏覽器控制台（F12）

### 使用問題

1. 確認已登入 Google 帳號
2. 檢查檔案大小是否超過限制
3. 查看用量監控是否接近上限

---

## 🎉 開始使用

1. ✅ 設定 Firebase（10 分鐘）
2. ✅ 啟動應用程式
3. ✅ 登入並上傳檔案
4. ✅ 完全免費！

**享受雲端檔案傳輸的便利！** 🚀
