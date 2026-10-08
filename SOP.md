# P5 打字遊戲 GitHub 管理 SOP

本文件規定本專案的修改、測試、發布及還原方法。目標是讓教師可以直接在 GitHub 管理專案，同時保護正式網站及學生資料。

## 1. 管理原則

- `main` 只保存已檢查、可以正式上線的版本。
- 每次修改先建立獨立分支，再透過 Pull Request 合併至 `main`。
- 不把學生姓名、完整成績表、Google Sheet 內容或私人資料上載至 GitHub。
- Google Apps Script 網址可以存放在程式設定中，但試算表必須維持私人存取。
- 每次發布前必須測試登入、遊戲、成績傳送及排行榜。

## 2. 常用檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | 網頁結構、標題及載入檔案版本 |
| `js/config.js` | Google Apps Script 接口及遊戲設定 |
| `js/app.js` | 登入、遊戲、成績傳送及排行榜功能 |
| `js/data.js` | 周次字庫、題目及排行榜初始資料 |
| `js/cangjie.js` | 倉頡碼資料 |
| `css/style.css` | 頁面樣式 |

## 3. 分支命名

使用簡短英文名稱：

- 每周字庫：`week-06-words`
- 修正問題：`fix-ranking-chart`
- 修改介面：`update-login-screen`
- 文件更新：`docs-update-sop`

不要直接在 `main` 修改正式檔案。

## 4. 每星期新增四組字庫

1. 在 GitHub Issues 選用「每週字庫更新」範本，填寫周次及第 1–4 組字庫。
2. 從 `main` 建立分支，例如 `week-06-words`。
3. 修改 `js/data.js` 中相應周次及四組字庫。
4. 如頁面會快取舊檔案，在 `index.html` 更新 JavaScript 的版本參數。
5. 檢查每組字詞是否有重複、錯字、空白行或不適合小五程度的內容。
6. 完成測試後建立 Pull Request。
7. Pull Request 合併至 `main` 後，等待 GitHub Pages 完成部署。
8. 開啟正式網站再次檢查周次、四組字庫及成績傳送。

## 5. 修改及發布程序

1. 建立新的 Issue，記錄修改目的及驗收條件。
2. 建立對應分支。
3. 在 GitHub 或 `github.dev` 修改檔案。
4. 每項完整修改建立一個清楚的 commit，例如：`Add week 6 word sets`。
5. 建立 Pull Request，填寫修改摘要、測試結果及資料安全檢查。
6. 檢查 Files changed，確認沒有學生個人資料、密碼或試算表內容。
7. 合併 Pull Request 至 `main`。
8. 到 Actions 確認 Pages 部署顯示成功。
9. 檢查正式網站：<https://ekeong2026.github.io/P5_typing-game/>

## 6. 發布前檢查表

- [ ] 顯示「五年級」，班別為 P5A–P5F。
- [ ] 學號只可選擇 1–36。
- [ ] 登入及開始遊戲正常。
- [ ] 本周四組字庫及周次正確。
- [ ] 完成遊戲後可傳送成績。
- [ ] 現有 P5 成績沒有被清除。
- [ ] 排行榜沒有顯示 `undefined`。
- [ ] 班級統計圖人數正確。
- [ ] 手機、平板及電腦可以操作。
- [ ] GitHub Actions 的 Pages 部署成功。

## 7. 還原方法

### 尚未合併

在 Pull Request 關閉修改分支，`main` 不受影響。

### 已合併但網站有問題

1. 找出導致問題的 Pull Request。
2. 使用 GitHub 的 Revert 功能建立還原 Pull Request。
3. 檢查還原內容後合併。
4. 等待 Pages 重新部署並再次測試。

不要刪除 Git 歷史或強制覆蓋 `main`。

## 8. 版本標籤

重要版本完成後建立標籤：

- `v1.0-p5-launch`
- `v1.1-week06`
- `v1.2-week07`

標籤只用於已成功上線及完成檢查的版本。

## 9. Google Apps Script 及資料安全

- Google Sheet 保持私人，只有授權教師可以查看。
- 網頁只顯示班別、學號及遊戲成績，不加入學生姓名。
- 不在 Issue、Pull Request、commit 或程式碼張貼完整成績表。
- 更改 Apps Script 後要重新部署，並測試讀取及寫入。
- 清除或大量修改成績前，先建立 Google Sheet 備份。
- Git 還原程式不會還原 Google Sheet 成績。

## 10. 每周建議工作次序

1. 教師提供周次及四組字庫。
2. 建立 Issue 和分支。
3. 更新字庫及版本參數。
4. 執行發布前檢查。
5. 建立及檢查 Pull Request。
6. 合併並等待 GitHub Pages 部署。
7. 在正式網站驗證。
8. 如屬重要版本，建立標籤。
