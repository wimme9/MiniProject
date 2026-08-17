/* =========================================================
   config.js — โหลดค่า config จาก data.json
   ⚠️ ถ้าเปิดไฟล์ index.html ตรงๆ (ดับเบิลคลิก) fetch จะถูก
   บล็อกด้วย CORS ระบบจะใช้ DEFAULT_CONFIG ด้านล่างแทน
   เพื่อให้ data.json ถูกใช้จริง ให้เปิดผ่าน local server:
   - VS Code: ติดตั้ง Live Server แล้วกด "Go Live"
   - หรือ: python -m http.server  (แล้วเปิด http://localhost:8000)
========================================================= */

// polyfill roundRect สำหรับเบราว์เซอร์เก่า
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

/* ค่า default — ให้เหมือน data.json (ใช้เมื่อเปิดไฟล์ตรงๆ) */
const DEFAULT_CONFIG = {
  game: {
    title: "Tiny Runner",
    width: 960,
    height: 540,
    groundY: 495,
    gravity: 2000,
    baseSpeed: 320,
    maxSpeed: 780,
    speedIncreasePerSecond: 4,
    shoeSpeedMultiplier: 1.5,
    pixelsPerMeter: 100,
    distanceScoreInterval: 100,
    distanceScoreReward: 20,
    invincibleTime: 1.5,
    background: "asset/sprite/Bg.jpg",
    spawnIntervalMin: 1.1,
    spawnIntervalMax: 2.2
  },
  player: {
    x: 150, w: 128, h: 160, slideH: 88,
    jumpVelocity: -760,
    slideDuration: 0.8,
    maxHp: 3,
    runFps: 10,
    sprites: {
      // player_sheet.png จริง 1920x1080, 5 คอลัมน์ x 2 แถว, เฟรมละ 384x540px
      // เดิน=เฟรม0-4, สไลด์=เฟรม5-8 (ไม่หมุนแล้ว)
      image: "asset/sprite/player_sheet.png",
      frameWidth: 384,
      frameHeight: 540,
      columns: 5,
      rows: 2,
      runFrames: [0, 1, 2, 3, 4],
      slideFrames: [5, 6, 7, 8],
      jumpFrame: 0
    }
  },
  obstacles: {
    crate: { w: 70, h: 110, kind: "ground", keepAspect: true, image: "asset/sprite/obstacle_crate.png" },
    spike: { w: 62, h: 40, kind: "ground", image: "asset/sprite/obstacle_spike.png" },
    bar: { w: 180, h: 260, kind: "high", gap: 200, image: "asset/sprite/obstacle_bar.png" },
    pit: { w: 130, h: 60, kind: "pit", image: "asset/sprite/pit.png" }
  },

  collectibles: {
    coin: { score: 10, w: 32, h: 32, image: "asset/sprite/coin.png" },
    gem: { score: 50, w: 34, h: 44, image: "asset/sprite/gem.png" },
    magnet: { duration: 5, w: 40, h: 40, image: "asset/sprite/magnet.png" },
    shoe: { duration: 5, w: 40, h: 40, image: "asset/sprite/shoe.png" }
  },
  spawn: {
    obstacleChance: 0.55,
    coinLineChance: 0.15,
    powerupChance: 0.1,
    gemChance: 0.12,
    coinLineLength: 6,
    magnetRadius: 260,
    magnetPullSpeed: 700
  },
  ui: {
    font: "bold 20px 'Segoe UI', Tahoma, sans-serif",
    colorScore: "#ffd34d",
    colorHp: "#ff6b6b"
  }
};

let CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
CONFIG.loaded = false;

/* merge ค่า data.json ทับค่า default แบบลึก */
function mergeConfig(base, extra) {
  if (extra === undefined || extra === null) return base;
  if (Array.isArray(base) || Array.isArray(extra)) {
    return Array.isArray(extra) ? extra.slice() : extra;
  }
  if (typeof base !== 'object' || typeof extra !== 'object') return extra;
  const out = {};
  const keys = new Set([...Object.keys(base), ...Object.keys(extra)]);
  for (const k of keys) {
    out[k] = (k in extra) ? mergeConfig(base[k], extra[k]) : base[k];
  }
  return out;
}

async function loadConfig() {
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    CONFIG = mergeConfig(DEFAULT_CONFIG, data);
    CONFIG.loaded = true;
    console.log('✅ โหลด data.json สำเร็จ');
  } catch (err) {
    CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    console.warn('⚠️ โหลด data.json ไม่ได้ (เปิดไฟล์ตรงๆ?) ใช้ค่า default แทน', err);
  }
}

/* ---------- ตัวช่วยวาดรูป ---------- */
function loadImage(src) {
  if (!src) return null;
  const img = new Image();
  img.src = src;
  return img;
}

function isImgReady(img) {
  return img && img.complete && img.naturalWidth > 0;
}

/* วาดรูปถ้าโหลดได้ ถ้าไม่ได้ให้วาด fallback แทน (เกมยังเล่นได้) */
function drawImageOr(ctx, img, x, y, w, h, fallback) {
  if (isImgReady(img)) ctx.drawImage(img, x, y, w, h);
  else if (fallback) fallback(ctx, x, y, w, h);
}