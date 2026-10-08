# P5_typing-game

五年級倉頡打字遊戲，供 P5A–P5F、學號 1–36 使用。

網站：<https://ekeong2026.github.io/P5_typing-game/>

## 使用方式

開啟網站，進入遊戲頁，選擇班別及學號。完成遊戲後，成績傳送至自用 Google Apps Script，並保留本機瀏覽器紀錄。

## GitHub 管理

本專案採用分支及 Pull Request 管理：

1. 每次修改先從 `main` 建立獨立分支。
2. 完成修改及測試後建立 Pull Request。
3. 檢查內容及資料安全後才合併至 `main`。
4. GitHub Pages 會從 `main` 自動發布正式網站。

詳細程序請參閱 [P5 打字遊戲 GitHub 管理 SOP](SOP.md)。

每星期由教師提供周次及第1至第4組字庫，再依照 SOP 更新、測試及發布。

## 維護

- `index.html`：頁面及登入選單。
- `js/config.js`：Google Apps Script 接口與遊戲設定。
- `js/app.js`：遊戲及成績同步。
- `js/data.js`、`js/cangjie.js`：題庫及倉頡資料。
- `css/style.css`：樣式。

首頁、登入、排行榜與本機成績儲存均已改為五年級版本。初始名冊包含 P5A–P5F、每班學號 1–36，歷史排行榜示例已清除。

登入未使用密碼，班別及學號不能用作可靠的身分驗證。成績試算表應保持私人。

## 原始專案

改編自：<https://github.com/lam013088/P6_typing-game>

P6_typing game
