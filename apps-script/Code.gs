/** 五年級打字遊戲後端：貼到與成績試算表綁定的 Apps Script Code.gs。
 * 首次在編輯器執行 setup，然後部署為網頁應用程式。
 * 公開接口只使用班別與學號；這不是有密碼驗證的學生帳戶系統。
 */
const LOG_SHEET = '遊戲紀錄';
const SUMMARY_SHEET = '成績總覽';
const DATA_CACHE_KEY = 'typing_game_leaderboard_v2';
const DATA_CACHE_SECONDS = 30;
const LOG_HEADERS = ['請求編號', '接收時間', '年級', '班別', '學號', '模式', '本次得分', '本次擊倒數', '完成秒數', '題量', '周次'];
const SUMMARY_HEADERS = ['年級', '班別', '學號', '累計得分', '累計擊倒數', '連體字得分', '分體字得分', '特殊字得分', '最佳10字秒數', '最後接收時間'];

function setup() {
  // getActiveSpreadsheet 只在編輯器初始化使用；網頁接口改用已儲存的 ID。
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('請從成績試算表的「擴充功能 → Apps Script」開啟並執行 setup。');
  PropertiesService.getScriptProperties().setProperty('SCORE_SPREADSHEET_ID', book.getId());
  ensureSheet_(book, LOG_SHEET, LOG_HEADERS);
  ensureSheet_(book, SUMMARY_SHEET, SUMMARY_HEADERS);
  refreshSummary();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('打字遊戲').addItem('更新成績總覽', 'refreshSummary').addToUi();
}

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.action && e.parameter.action !== 'get_data') {
      throw new Error('不支援的查詢。');
    }
    return json_(readDataCached_());
  } catch (error) {
    return json_({ status: 'error', message: error.message });
  }
}

function doPost(e) {
  let lock;
  try {
    const payload = validate_(JSON.parse(e && e.postData ? e.postData.contents : '{}'));
    lock = LockService.getScriptLock();
    lock.waitLock(20000);
    const sheet = book_().getSheetByName(LOG_SHEET);
    if (!sheet) throw new Error('請先執行 setup。');
    // 請求編號隨原成績保存；重試同一筆資料不會重複累計。
    if (hasRequestId_(sheet, payload.requestId)) {
      // 上一次可能已寫入紀錄，但在更新總覽時中斷；重試時順道修復總覽。
      writeSummary_();
      clearDataCache_();
      return json_({ status: 'success', requestId: payload.requestId, duplicate: true });
    }
    const receivedAt = new Date();
    sheet.appendRow([
      payload.requestId, receivedAt, 5, payload.cls, payload.num, payload.mode,
      payload.scoreDelta, payload.killDelta, payload.bestTime, payload.wordCount, payload.weekKey
    ]);
    updateSummaryStudent_(payload, receivedAt);
    clearDataCache_();
    SpreadsheetApp.flush();
    return json_({ status: 'success', requestId: payload.requestId });
  } catch (error) {
    return json_({ status: 'error', message: error.message });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function hasRequestId_(sheet, requestId) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  return sheet.getRange(2, 1, lastRow - 1, 1)
    .createTextFinder(requestId)
    .matchEntireCell(true)
    .findNext() !== null;
}

function validate_(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) throw new Error('資料格式不正確。');
  if (p.grade !== 5 || !/^P5[A-F]$/.test(p.cls) || !Number.isInteger(p.num) || p.num < 1 || p.num > 36) {
    throw new Error('只接受 P5A–P5F，學號 1–36。');
  }
  if (typeof p.requestId !== 'string' || !/^[A-Za-z0-9_-]{8,100}$/.test(p.requestId)) {
    throw new Error('缺少有效的請求編號。');
  }
  const mode = p.gameMode || p.mode;
  if (!['connected', 'split', 'special', 'speed'].includes(mode)) throw new Error('遊戲模式不正確。');
  const delta = p.scoreDelta;
  if (!Number.isInteger(delta) || delta < 0 || delta > 10000) throw new Error('本次得分不正確。');
  if (!Number.isInteger(p.killDelta) || p.killDelta < 0 || p.killDelta > 1) throw new Error('本次擊倒數不正確。請使用最新的遊戲版本。');
  if (typeof p.weekKey !== 'string' || !/^w\d{1,2}(?:_hw\d{1,2})?$/.test(p.weekKey)) throw new Error('周次不正確。');
  if (p.wordCount !== 10 && p.wordCount !== 20) throw new Error('題量不正確。');
  let bestTime = '';
  if (mode === 'speed') {
    if (typeof p.bestTime !== 'number' || !Number.isFinite(p.bestTime) || p.bestTime <= 0 || p.bestTime >= 900) {
      throw new Error('完成秒數必須大於 0 且小於 900。');
    }
    if (delta !== 0 || p.killDelta !== 0) throw new Error('手速賽不累計討伐積分。');
    bestTime = p.bestTime;
  }
  return { requestId: p.requestId, cls: p.cls, num: p.num, mode,
    scoreDelta: delta, killDelta: p.killDelta, bestTime,
    wordCount: p.wordCount, weekKey: p.weekKey };
}

function readData_() {
  const sheet = book_().getSheetByName(LOG_SHEET);
  if (!sheet) throw new Error('請先執行 setup。');
  const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, LOG_HEADERS.length).getValues() : [];
  const students = {};
  for (const letter of 'ABCDEF') {
    const cls = 'P5' + letter;
    for (let num = 1; num <= 36; num++) {
      students[cls + '_' + num] = { cls, num, name: cls + ' ' + String(num).padStart(2, '0') + '號',
        score: 0, grandTotal: 0, totalScore: 0, kills: 0,
        mode1Score: 0, mode2Score: 0, mode3Score: 0, weekly_speed: {}, best10: null, lastTime: '' };
    }
  }
  const best = {};
  const seen = new Set();
  for (const row of rows) {
    const [id, received, grade, cls, num, mode, delta, kills, seconds, count, week] = row;
    const st = students[cls + '_' + num];
    const normalizedId = String(id || '').trim();
    // 新紀錄以 requestId 去重；沒有 ID 的歷史列則逐筆保留及計算。
    if ((normalizedId && seen.has(normalizedId)) || grade !== 5 || !st) continue;
    if (normalizedId) seen.add(normalizedId);
    st.grandTotal += Number(delta) || 0;
    st.kills += Number(kills) || 0;
    const modeField = { connected: 'mode1Score', split: 'mode2Score', special: 'mode3Score' }[mode];
    if (modeField) st[modeField] += Number(delta) || 0;
    const date = received instanceof Date ? received : new Date(received);
    if (!isNaN(date.getTime())) {
      const iso = date.toISOString();
      if (iso > st.lastTime) st.lastTime = iso;
    }
    if (mode === 'speed' && typeof seconds === 'number' && seconds > 0 && seconds < 900 && count === 10) {
      const key = cls + '_' + num + '_' + week;
      if (!best[key] || seconds < best[key].bestTime) {
        best[key] = { cls, num, name: st.name, bestTime: seconds, wordCount: count, weekKey: week };
      }
      st.weekly_speed[week] = Math.min(st.weekly_speed[week] || Infinity, seconds);
      st.best10 = Math.min(st.best10 || Infinity, seconds);
    }
    st.score = st.totalScore = st.grandTotal;
  }
  const combatLeaderboard = Object.values(students).sort((a, b) => b.grandTotal - a.grandTotal || a.cls.localeCompare(b.cls) || a.num - b.num);
  // 依周次分組，避免另一周的最佳秒數混入當周榜單。
  const speedByWeek = { overall: [] };
  const overall = {};
  for (const record of Object.values(best)) {
    (speedByWeek[record.weekKey] = speedByWeek[record.weekKey] || []).push(record);
    const key = record.cls + '_' + record.num;
    if (!overall[key] || record.bestTime < overall[key].bestTime) overall[key] = record;
  }
  speedByWeek.overall = Object.values(overall);
  Object.values(speedByWeek).forEach(list => list.sort((a, b) => a.bestTime - b.bestTime || a.cls.localeCompare(b.cls) || a.num - b.num));
  const class_top10 = {};
  for (const letter of 'ABCDEF') {
    const cls = 'P5' + letter;
    class_top10[cls] = combatLeaderboard.filter(st => st.cls === cls && st.grandTotal > 0).slice(0, 10);
  }
  return { status: 'success', combatLeaderboard, speedByWeek,
    top40: combatLeaderboard.filter(st => st.grandTotal > 0).slice(0, 40), class_top10 };
}

function readDataCached_() {
  const cache = CacheService.getScriptCache();
  try {
    const cached = cache.get(DATA_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    // 快取失效時仍可直接讀取試算表，不影響排行榜。
  }
  const data = readData_();
  try {
    cache.put(DATA_CACHE_KEY, JSON.stringify(data), DATA_CACHE_SECONDS);
  } catch (error) {
    // 資料超過快取限制時，退回即時計算。
  }
  return data;
}

function clearDataCache_() {
  try {
    CacheService.getScriptCache().remove(DATA_CACHE_KEY);
  } catch (error) {
    // 清除快取失敗不應阻止成績寫入。
  }
}

function refreshSummary() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    writeSummary_();
  } finally {
    lock.releaseLock();
  }
}

function writeSummary_() {
  const data = readData_();
  const sheet = ensureSheet_(book_(), SUMMARY_SHEET, SUMMARY_HEADERS);
  // 成績總覽固定依 P5A–P5F、學號 1–36 排列，方便教師查閱。
  const students = data.combatLeaderboard.slice().sort((a, b) =>
    a.cls.localeCompare(b.cls) || a.num - b.num
  );
  const rows = students.map(st => [5, st.cls, st.num, st.grandTotal, st.kills,
    st.mode1Score, st.mode2Score, st.mode3Score, st.best10 === null ? '' : st.best10, st.lastTime]);
  sheet.getRange(2, 1, rows.length, SUMMARY_HEADERS.length).setValues(rows);
  clearDataCache_();
  SpreadsheetApp.flush();
}

function updateSummaryStudent_(payload, receivedAt) {
  const sheet = ensureSheet_(book_(), SUMMARY_SHEET, SUMMARY_HEADERS);
  const classIndex = payload.cls.charCodeAt(2) - 'A'.charCodeAt(0);
  const rowNumber = 2 + classIndex * 36 + payload.num - 1;
  const current = sheet.getRange(rowNumber, 1, 1, SUMMARY_HEADERS.length).getValues()[0];

  // 如總覽排列曾被人手改動，先按原始紀錄安全重建，再取得正確的一行。
  if (current[0] !== 5 || current[1] !== payload.cls || current[2] !== payload.num) {
    writeSummary_();
    return;
  }

  const updated = current.slice();
  updated[3] = (Number(current[3]) || 0) + payload.scoreDelta;
  updated[4] = (Number(current[4]) || 0) + payload.killDelta;
  const modeColumn = { connected: 5, split: 6, special: 7 }[payload.mode];
  if (modeColumn !== undefined) {
    updated[modeColumn] = (Number(current[modeColumn]) || 0) + payload.scoreDelta;
  }
  if (payload.mode === 'speed' && payload.wordCount === 10) {
    const oldBest = Number(current[8]);
    updated[8] = oldBest > 0 ? Math.min(oldBest, payload.bestTime) : payload.bestTime;
  }
  updated[9] = receivedAt.toISOString();
  sheet.getRange(rowNumber, 1, 1, SUMMARY_HEADERS.length).setValues([updated]);
}

function book_() {
  const id = PropertiesService.getScriptProperties().getProperty('SCORE_SPREADSHEET_ID');
  if (!id) throw new Error('請先在 Apps Script 編輯器執行 setup。');
  return SpreadsheetApp.openById(id);
}

function ensureSheet_(book, name, headers) {
  const sheet = book.getSheetByName(name) || book.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    const actual = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (headers.some((header, i) => actual[i] !== header)) throw new Error(name + ' 欄位不符，請另建成績試算表。');
  }
  return sheet;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
