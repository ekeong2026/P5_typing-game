# P5_typing-game

五年級倉頡打字遊戲，供 P5A–P5F、學號 1–36 使用。

網站：https://ekeong2026.github.io/P5_typing-game/

## 使用方式

開啟網站，進入遊戲頁，選擇班別及學號。
完成遊戲後，成績傳送至自用 Google Apps Script，並保留本機瀏覽器紀錄。

## 維護

- `index.html`：頁面及登入選單。
- `js/config.js`：Google Apps Script 接口與遊戲設定。
- `js/app.js`：遊戲及成績同步。
- `js/data.js`、`js/cangjie.js`：題庫及倉頡資料。
- `css/style.css`：樣式。

目前仍保留原專案的首頁標題、部分六年級說明及歷史排行榜示例，待後續調整。
登入未使用密碼，班別及學號不能用作可靠的身分驗證。成績試算表應保持私人。

## 原始專案

改編自：https://github.com/lam013088/P6_typing-game
P6_typing game
