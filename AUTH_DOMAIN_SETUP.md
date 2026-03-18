# 🔒 授權域名設定指南

## 錯誤訊息

```
Firebase: This domain is not authorized for OAuth operations 
for your Firebase project. Edit the list of authorized domains 
from the Firebase console. (auth/unauthorized-domain).
```

---

## 🎯 問題原因

Firebase 預設只允許特定域名進行 Google 登入（OAuth）。

當您在未授權的域名（例如 `localhost`、`127.0.0.1` 或您的自訂域名）上運行應用程式時，登入會失敗。

---

## ✅ 解決方法（3 步驟，1 分鐘）

### 步驟 1：前往 Firebase Console

開啟：https://console.firebase.google.com/

選擇您的專案

### 步驟 2：進入授權域名設定

1. 左側選單 → **Authentication**
2. 點擊頂部的 **Settings**（設定）分頁
3. 往下捲動到 **Authorized domains**（授權域名）區域

### 步驟 3：加入您的域名

1. 點擊「**Add domain**」（加入域名）按鈕
2. 輸入您的域名：
   - 如果使用 localhost：輸入 `localhost`
   - 如果使用 IP：輸入 `127.0.0.1`
   - 如果使用自訂域名：輸入完整域名（例如：`myapp.example.com`）
3. 點擊「**Add**」（加入）

---

## 📋 常見域名設定

### 本地開發

如果您在本地開發，請加入以下域名：

```
localhost
127.0.0.1
```

**步驟：**
1. Add domain → 輸入 `localhost` → Add
2. Add domain → 輸入 `127.0.0.1` → Add

### 使用不同的 Port

Firebase 不需要指定 port，以下都會通過：
- `http://localhost:8000`
- `http://localhost:3000`
- `http://localhost:5500`

只需要加入 `localhost` 即可。

### 部署到伺服器

如果部署到 GitHub Pages、Netlify、Vercel 等：

**範例：**
- GitHub Pages: `username.github.io`
- Netlify: `myapp.netlify.app`
- 自訂域名: `myapp.com`

**步驟：**
Add domain → 輸入完整域名 → Add

---

## 🔍 檢查當前域名

### 方法 1：查看瀏覽器網址列

當前域名就是網址列中的域名部分：

```
http://localhost:8000/index.html
       ^^^^^^^^^ 這是域名

https://myapp.netlify.app/
         ^^^^^^^^^^^^^^^^^ 這是域名
```

### 方法 2：應用程式會自動顯示

當出現授權域名錯誤時，應用程式會自動顯示當前域名，並提供設定指南。

---

## ⚠️ 注意事項

### 1. 不需要加入協議（http/https）

❌ 錯誤：`http://localhost`  
✅ 正確：`localhost`

### 2. 不需要加入 Port

❌ 錯誤：`localhost:8000`  
✅ 正確：`localhost`

### 3. 不需要加入路徑

❌ 錯誤：`myapp.com/index.html`  
✅ 正確：`myapp.com`

### 4. 預設已授權的域名

Firebase 專案預設已授權以下域名：
- `localhost`（通常）
- `*.firebaseapp.com`（您的 Firebase Hosting 域名）

但有時候需要手動確認。

---

## 🐛 疑難排解

### 問題 1：已加入域名但還是失敗

**解決：**
1. 確認域名拼寫正確（不含 http、port、路徑）
2. 清除瀏覽器快取（Ctrl + Shift + Delete）
3. 重新載入頁面（Ctrl + F5）
4. 重新嘗試登入

### 問題 2：找不到 Authorized domains

**解決：**
1. 確認已進入正確的專案
2. 確認已啟用 Authentication
3. 路徑：Authentication → Settings → 往下捲動

### 問題 3：無法加入域名（按鈕反灰）

**可能原因：**
- 域名格式不正確
- 域名已存在
- 達到域名數量上限（免費方案通常沒有限制）

**解決：**
- 檢查域名格式
- 查看已授權域名列表

---

## 📸 視覺化步驟

### 1. 進入 Authentication

```
Firebase Console → 選擇專案 → Authentication
```

### 2. 點擊 Settings

```
Authentication 頁面頂部 → Settings 分頁
```

### 3. 找到 Authorized domains

```
Settings 頁面 → 往下捲動 → Authorized domains 區域
```

### 4. 加入域名

```
點擊 "Add domain" → 輸入域名 → 點擊 "Add"
```

---

## ✅ 設定完成檢查

設定完成後，請確認：

- [x] localhost 已加入（如果本地開發）
- [x] 127.0.0.1 已加入（如果使用 IP）
- [x] 生產域名已加入（如果已部署）
- [x] 已儲存變更
- [x] 已重新載入應用程式
- [x] 可以成功登入

---

## 💡 快速解決

如果您急著解決問題：

1. **開啟 Firebase Console**  
   https://console.firebase.google.com/

2. **點擊此連結**  
   https://console.firebase.google.com/project/_/authentication/settings  
   （會自動跳到 Authentication Settings）

3. **加入 `localhost`**  
   Add domain → `localhost` → Add

4. **重新載入應用程式並登入**

---

## 🎉 完成

設定完成後，您應該可以正常登入了！

如果還有問題，請檢查：
- Firebase 專案是否正確
- Authentication 是否已啟用 Google 登入
- 網路連線是否正常

---

## 📞 需要更多幫助？

### 常見錯誤碼

| 錯誤碼 | 原因 | 解決方法 |
|--------|------|---------|
| `auth/unauthorized-domain` | 域名未授權 | 參考本指南加入域名 |
| `auth/popup-blocked` | 彈出視窗被阻擋 | 允許彈出視窗 |
| `auth/popup-closed-by-user` | 使用者關閉登入視窗 | 重新登入 |
| `auth/network-request-failed` | 網路連線失敗 | 檢查網路 |

### 官方文件

Firebase Authentication 授權域名文件：  
https://firebase.google.com/docs/auth/web/redirect-best-practices

---

**設定完成，開始使用！** 🚀
