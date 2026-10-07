/**
 * =========================================================================
 * 🔤 CANGJIE.JS - 倉頡三代標準字碼引擎與演算法工具庫
 * 🤖 AI 迭代維護指南：
 *    - 本模組負責「字根自動查表按鍵」與「洗牌演算法」，嚴禁在此寫死手寫按鍵字串
 *    - autoDeriveWordKeys 會自動依據 codes 陣列生成 keys 與 full 顯示字串
 * =========================================================================
 */

// 倉頡 24 字母與特殊鍵碼對照字典 (官方三代標準)
const CANGJIE_RADICAL_MAP = {
  '日': 'A', '月': 'B', '金': 'C', '木': 'D', '水': 'E', '火': 'F', '土': 'G',
  '竹': 'H', '戈': 'I', '十': 'J', '大': 'K', '中': 'L', '一': 'M', '弓': 'N',
  '人': 'O', '心': 'P', '手': 'Q', '口': 'R', '尸': 'S', '廿': 'T', '山': 'U',
  '女': 'V', '田': 'W', '卜': 'Y', '難': 'X', '重': 'X'
};

/**
 * 🎲 Fisher-Yates (Knuth) 標準隨機洗牌演算法 (無偏差均勻分佈)
 */
function fisherYatesShuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * 自動由字根陣列動態推導按鍵與字串，消除手寫轉寫錯誤
 */
function autoDeriveWordKeys(item) {
  if (!item) return item;
  if (item.codes && Array.isArray(item.codes)) {
    item.keys = item.codes.map(c => CANGJIE_RADICAL_MAP[c] || 'X');
    item.full = `${item.codes.join('')} (${item.keys.join('')})`;
    if (!item.secret || item.secret.startsWith(item.char + '：')) {
      item.secret = `${item.char}：${item.full}`;
    }
  } else if (item.prefix_codes && item.body_codes) {
    item.prefix_keys = item.prefix_codes.map(c => CANGJIE_RADICAL_MAP[c] || 'X');
    item.body_keys = item.body_codes.map(c => CANGJIE_RADICAL_MAP[c] || 'X');
    const allCodes = [...item.prefix_codes, ...item.body_codes];
    const allKeys = [...item.prefix_keys, ...item.body_keys];
    item.full = `${allCodes.join('')} (${allKeys.join('')})`;
  }
  return item;
}

/**
 * 評定目前總分所對應的訓練家境界與解鎖技能清單
 */
function evalTierAndSkills(score) {
  let currentTier = TIERS[0];
  let nextTier = TIERS[1];
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (score >= TIERS[i].min) {
      currentTier = TIERS[i];
      nextTier = TIERS[i + 1] || null;
      break;
    }
  }
  const unlockedSkills = SKILLS.filter(s => score >= s.reqPts);
  return { currentTier, nextTier, unlockedSkills };
}

/**
 * 手速賽秒數段位評定
 */
function getSpeedTier(sec) {
  if (sec <= 12.0) return '⚡ 神速天王';
  if (sec <= 16.0) return '👑 鍵盤宗師';
  if (sec <= 22.0) return '🔥 疾風射手';
  if (sec <= 30.0) return '💎 靈動遊俠';
  if (sec <= 42.0) return '🥇 穩健獵人';
  if (sec <= 60.0) return '🥈 見習學徒';
  return '🥉 新手訓練家';
}

/**
 * 懸浮提示框 (Toast)
 */
function showPassToast(msg) {
  try {
    let t = document.getElementById('pass-toast-banner');
    if (!t) {
      t = document.createElement('div');
      t.id = 'pass-toast-banner';
      t.style.cssText = 'position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:#0F172A; color:#F8FAFC; border:1.5px solid #38BDF8; padding:10px 22px; border-radius:30px; font-weight:800; font-size:13.5px; z-index:999999; box-shadow:0 6px 18px rgba(0,0,0,0.3); transition:all 0.25s ease; opacity:0; pointer-events:none;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    if (window._passToastTimer) clearTimeout(window._passToastTimer);
    window._passToastTimer = setTimeout(() => {
      if (t) {
        t.style.opacity = '0';
        t.style.transform = 'translateX(-50%) translateY(10px)';
      }
    }, 2200);
  } catch(e) {
    console.log('[Toast]', msg);
  }
}