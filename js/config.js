/**
 * =========================================================================
 * ⚙️ CONFIG.JS - 系統全域設定、段位與技能樹常數
 * 🤖 部署與跨電腦即時連動指南：
 *    - GAS_WEBHOOK_URL：請在此填入 Google Apps Script 網頁應用程式部署網址
 *    - GITHUB_PRIVACY_MODE：發布至 GitHub 時設為 true (去識別化純學號)
 *    - SPEED_WEEK_SCHEDULES：每週更換開放排程區間
 * =========================================================================
 */

window.CONFIG = window.CONFIG || {};
// 自用版本：連接自己的五年級成績試算表。
window.CONFIG.GAS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzwCAwcNHN5sIVkjL6BqJm9XDPBUSg3zvkXBQ_2yksE-8kc7NQiNjew1uNHIeN5e7IxFQ/exec';
if (typeof window.CONFIG.GITHUB_PRIVACY_MODE === 'undefined') {
  window.CONFIG.GITHUB_PRIVACY_MODE = true;
}
if (typeof window.CONFIG.VERSION === 'undefined') {
  window.CONFIG.VERSION = '2026.09.30-modular-v1.1';
}
var CONFIG = window.CONFIG;

// 🌟 段位稱號門檻對照表 (0 ~ 100,000分以上，共 14 大段位)
window.TIERS = window.TIERS || [
  { min: 0,      title: "新手訓練家", badge: "🥉", color: "#B45309", bg: "#FEF3C7" },
  { min: 50,     title: "見習訓練家", badge: "🥈", color: "#475569", bg: "#F1F5F9" },
  { min: 150,    title: "原野遊俠",   badge: "🥇", color: "#1D4ED8", bg: "#EFF6FF" },
  { min: 300,    title: "道館館主",   badge: "⚡", color: "#7C3AED", bg: "#F5F3FF" },
  { min: 600,    title: "四大天王",   badge: "🔥", color: "#C2410C", bg: "#FFF7ED" },
  { min: 1200,   title: "聯盟冠軍",   badge: "🏆", color: "#B91C1C", bg: "#FEF2F2" },
  { min: 2500,   title: "傳奇大師",   badge: "👑", color: "#047857", bg: "#ECFDF5" },
  { min: 5000,   title: "神域至尊",   badge: "🌌", color: "#4C1D95", bg: "#F3E8FF" },
  { min: 10000,  title: "極巨霸主",   badge: "🌠", color: "#9333EA", bg: "#FAF5FF" },
  { min: 20000,  title: "幻境領主",   badge: "🔮", color: "#BE185D", bg: "#FDF2F8" },
  { min: 35000,  title: "時空天尊",   badge: "🌀", color: "#0E7490", bg: "#ECFEFF" },
  { min: 50000,  title: "原始尊者",   badge: "💫", color: "#D97706", bg: "#FFFBEB" },
  { min: 75000,  title: "星穹聖皇",   badge: "🪐", color: "#4338CA", bg: "#EEF2FF" },
  { min: 100000, title: "創世神皇",   badge: "🔱", color: "#E11D48", bg: "#FFF1F2" }
];
var TIERS = window.TIERS;

// ⚔️ 11大解鎖技能樹 (覆蓋 0 ~ 100,000 分，適量增益兼顧平衡)
window.SKILLS = window.SKILLS || [
  { id: "focus",     name: "精準直覺", desc: "戰鬥開局 25% 概率感應正確精靈球，令其發出神聖光暈！", reqPts: 200,    rate: 0.25 },
  { id: "shield",    name: "聖盾防護", desc: "捕捉錯誤時 35% 概率格擋失誤，保留當前連擊！",         reqPts: 450,    rate: 0.35 },
  { id: "crit",      name: "烈焰爆擊", desc: "成功通關時 30% 概率觸發爆擊，額外獲得 +5 點傷害分！",     reqPts: 800,    rate: 0.30 },
  { id: "chain",     name: "極限連擊", desc: "連擊達 2 Hit 以上時，每次命中額外獎勵 +3 點連擊分！",     reqPts: 1500,   rate: 0.45 },
  { id: "divine",    name: "神域天罰", desc: "擊破魔王時 20% 概率降下九天神雷，額外獎勵 +6 點天罰分！",   reqPts: 3000,   rate: 0.20 },
  { id: "aura",      name: "波導感知", desc: "連擊達 3 Hit 以上時，25% 概率觸發波導同頻，額外獎勵 +2 分！", reqPts: 6000,   rate: 0.25 },
  { id: "dynamax",   name: "極巨衝能", desc: "擊破魔王時 20% 概率發動極巨衝能，額外獲得 +4 點極巨分！",   reqPts: 12000,  rate: 0.20 },
  { id: "timeward",  name: "時空結界", desc: "捕捉失誤時 30% 概率展開時空結界，化解失誤並守住連擊！",     reqPts: 25000,  rate: 0.30 },
  { id: "swift",     name: "疾風迅雷", desc: "極速答題通關時，25% 概率觸發神速疾風，額外獎勵 +3 點迅捷分！", reqPts: 45000,  rate: 0.25 },
  { id: "starlight", name: "星輝庇佑", desc: "連擊達 4 Hit 以上時，25% 概率降下星輝庇護，額外獲得 +4 分！", reqPts: 70000,  rate: 0.25 },
  { id: "genesis",   name: "創世審判", desc: "十萬神皇終極神技！通關時 15% 概率降下創世神光，額外榮獲 +6 分！", reqPts: 100000, rate: 0.15 }
];
var SKILLS = window.SKILLS;

// 📅 每周排程時間表 (2026/2027學年上學期)
window.SPEED_WEEK_SCHEDULES = window.SPEED_WEEK_SCHEDULES || [
  { week: 'w2', name: '第 2 周', title: '【第2周】字根複合與首尾特訓 (9/7 - 9/13)', start: new Date('2026-09-07T00:00:00+08:00'), end: new Date('2026-09-13T23:59:59+08:00') },
  { week: 'w3', name: '第 3 周', title: '【第 3 周】難字與分體字高頻特訓 (9/14 - 9/20)', start: new Date('2026-09-14T00:00:00+08:00'), end: new Date('2026-09-20T23:59:59+08:00') },
  { week: 'w4', name: '第 4 周', title: '【第 4 周】期初實力排位激戰 (9/21 - 10/04，第4/5周合拼)', start: new Date('2026-09-21T00:00:00+08:00'), end: new Date('2026-10-04T23:59:59+08:00') },
  { week: 'w6', name: '第 6 周', title: '【第 6 周】手速極限突破爭霸 (10/5 - 10/11)', start: new Date('2026-10-05T00:00:00+08:00'), end: new Date('2026-10-11T23:59:59+08:00') }
];
var TIERS = window.TIERS;
var SKILLS = window.SKILLS;
var SPEED_WEEK_SCHEDULES = window.SPEED_WEEK_SCHEDULES;
