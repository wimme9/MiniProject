/* =========================================================
   game.js — คลาสหลัก: ฉาก, วงจรการเล่น, การเกิดสิ่งกีดขวาง,
   คะแนน, HP, ไอเทม, เอฟเฟกต์เสียง
========================================================= */

/* ---------- เสียงเอฟเฟกต์ (WebAudio) ---------- */
class AudioFX {
  constructor() { this.ctx = null; this.enabled = true; }
  init() {
    if (this.ctx || !this.enabled) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { this.enabled = false; }
  }
  beep(freq, dur, type = 'square', vol = 0.12) {
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t); o.stop(t + dur);
    } catch (e) { }
  }
  jump() { this.beep(520, 0.08, 'sine', 0.06); }
  coin() { this.beep(880, 0.07, 'square', 0.08); setTimeout(() => this.beep(1320, 0.07, 'square', 0.08), 60); }
  gem() { this.beep(660, 0.09, 'triangle', 0.1); setTimeout(() => this.beep(990, 0.09, 'triangle', 0.1), 80); setTimeout(() => this.beep(1320, 0.12, 'triangle', 0.1), 160); }
  power() { this.beep(523, 0.08, 'triangle', 0.1); setTimeout(() => this.beep(659, 0.08, 'triangle', 0.1), 80); setTimeout(() => this.beep(784, 0.1, 'triangle', 0.1), 160); }
  hit() { this.beep(160, 0.25, 'sawtooth', 0.15); }
}

/* ---------- เกมหลัก ---------- */
class Game {
  constructor(canvas, cfg, dpr = 1) {
    this.cfg = cfg;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    // ปรับสเกลตาม devicePixelRatio ให้ทุกอย่างยังวาดด้วยพิกัดตรรกะเดิม (960x540)
    // แต่ได้ความละเอียดจริงสูงกว่า ภาพจึงคมชัดขึ้น + ปิด smoothing กันภาพเบลอ
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = false;
    this.W = cfg.game.width;
    this.H = cfg.game.height;
    this.groundY = cfg.game.groundY;
    this.state = 'menu';        // menu | playing | gameover
    this.paused = false;
    this.calib = false;         // โหมดปรับ groundY แบบเรียลไทม์ (debug) — ปิดไว้เป็นค่าเริ่มต้น กด C เพื่อเปิด

    this.audio = new AudioFX();
    this.bgImage = loadImage(cfg.game.background);
    this.onStateChange = null;

    this.reset();
    this.buildBackground();
  }

  reset() {
    const g = this.cfg.game;
    this.score = 0;
    this.distance = 0;
    this.distPx = 0;
    this.speed = g.baseSpeed;
    this.time = 0;
    this.obstacles = [];
    this.collectibles = [];
    this.spawnTimer = 1;
    this.magnetTimer = 0;
    this.shoeTimer = 0;
    this.magnetRadius = this.cfg.spawn.magnetRadius;
    this.magnetPullSpeed = this.cfg.spawn.magnetPullSpeed;
    this.effects = [];          // ข้อความลอย +N
    this.flash = 0;             // แฟลชแดงตอนโดนชน
    this.isNewRecord = false;
    this.highScore = parseInt(localStorage.getItem('tinyRunnerHighScore') || '0', 10);
    this.player = new Player(this.cfg);
  }

  /* ---------- ฉาก ---------- */
  toMenu() { this.reset(); this.state = 'menu'; this.paused = false; this.emitState(); }
  start() { this.audio.init(); this.reset(); this.state = 'playing'; this.emitState(); }

  gameOver() {
    this.state = 'gameover';
    this.isNewRecord = this.score > this.highScore;
    if (this.isNewRecord) {
      this.highScore = this.score;
      localStorage.setItem('tinyRunnerHighScore', String(this.highScore));
    }
    this.audio.hit();
    this.emitState();
  }

  emitState() { if (this.onStateChange) this.onStateChange(this.state); }

  togglePause() { if (this.state === 'playing') this.paused = !this.paused; }

  /* ---------- โหมดปรับ groundY แบบเรียลไทม์ (debug) ---------- */
  adjustGroundY(delta) {
    this.cfg.game.groundY += delta;
    this.groundY = this.cfg.game.groundY;
    this.player.groundY = this.groundY;
  }

  /* ---------- อินพุต ---------- */
  press(action) {
    if (this.state === 'menu' && action === 'jump') { this.start(); return; }
    if (this.state === 'gameover' && action === 'jump') { this.start(); return; }
    if (this.state !== 'playing' || this.paused) return;
    if (action === 'jump') { this.player.jump(); this.audio.jump(); }
    else if (action === 'slide') this.player.slide();
  }

  /* ---------- อัปเดต ---------- */
  update(dt) {
    if (this.state === 'menu') {
      // ฉากหลังให้ตัวละครวิ่งอยู่หลังเมนู
      this.time += dt;
      this.player.update(dt);
      this.updateBackground(dt, this.cfg.game.baseSpeed * 0.6);
      return;
    }
    if (this.state !== 'playing' || this.paused) return;

    const g = this.cfg.game;
    this.time += dt;

    // ความเร็วเพิ่มขึ้นเรื่อยๆ (ยากขึ้นตามเวลา)
    this.speed = Math.min(this.speed + g.speedIncreasePerSecond * dt, g.maxSpeed);
    let moveSpeed = this.speed;
    if (this.shoeTimer > 0) {
      this.shoeTimer -= dt;
      moveSpeed = this.speed * g.shoeSpeedMultiplier;   // รองเท้าเร็ว x1.5
    }
    if (this.magnetTimer > 0) this.magnetTimer -= dt;

    // ระยะทาง + คะแนนทุก 100 เมตร
    this.distPx += moveSpeed * dt;
    const newDist = Math.floor(this.distPx / g.pixelsPerMeter);
    if (newDist > this.distance) {
      this.distance = newDist;
      if (this.distance % g.distanceScoreInterval === 0) {
        this.addScore(g.distanceScoreReward, 'ระยะ ' + this.distance + ' ม. +20');
      }
    }

    this.player.update(dt);
    this.updateBackground(dt, moveSpeed);

    // เกิดสิ่งกีดขวางตามช่วงเวลา
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawn();
      this.spawnTimer = g.spawnIntervalMin +
        Math.random() * (g.spawnIntervalMax - g.spawnIntervalMin);
    }

    for (const o of this.obstacles) o.update(dt, moveSpeed);
    for (const c of this.collectibles) c.update(dt, moveSpeed, this.player, this);

    this.obstacles = this.obstacles.filter(o => !o.offscreen());
    this.collectibles = this.collectibles.filter(c => !c.offscreen() && !c.taken);

    this.checkCollisions();
    this.updateEffects(dt);
    if (this.flash > 0) this.flash -= dt;
  }

  /* ---------- การเกิดของ ---------- */
  spawn() {
    const s = this.cfg.spawn;
    const spawnX = this.W + 60;
    // กันการซ้อน: มีสิ่งกีดขวางใกล้จุดเกิด ให้ข้ามรอบนี้
    for (const o of this.obstacles) {
      if (Math.abs(o.x - spawnX) < 120) return;
    }

    const roll = Math.random();
    if (roll < s.obstacleChance) {
      this.spawnObstacle(spawnX);
    } else if (roll < s.obstacleChance + s.coinLineChance) {
      this.spawnCoinLine(spawnX);
    } else if (roll < s.obstacleChance + s.coinLineChance + s.powerupChance) {
      this.spawnPowerup(spawnX);
    }
  }

  spawnObstacle(x) {
    const s = this.cfg.spawn;
    const roll = Math.random();
    let key;
    if (roll < 0.25) key = 'pit';
    else if (roll < 0.7) key = Math.random() < 0.5 ? 'crate' : 'spike';
    else key = 'bar';
    this.obstacles.push(new Obstacle(key, this.cfg, x));

    if (key === 'bar' && Math.random() < 0.7) {
      // เหรียญแนวพื้นก่อนคาน (ชวนสไลด์)
      for (let i = 0; i < 4; i++) {
        this.collectibles.push(new Collectible('coin', this.cfg, x - 160 + i * 40, this.groundY - 30));
      }
    } else if ((key === 'crate' || key === 'spike') && Math.random() < 0.5) {
      // เหรียญโค้งเหนือสิ่งกีดขวาง (ชวนกระโดด)
      const base = this.groundY - 90;
      for (let i = 0; i < 5; i++) {
        const yy = base - Math.sin(i / 4 * Math.PI) * 70;
        const kind = Math.random() < s.gemChance ? 'gem' : 'coin';
        this.collectibles.push(new Collectible(kind, this.cfg, x - 40 + i * 45, yy));
      }
    }
  }

  spawnCoinLine(x) {
    const s = this.cfg.spawn;
    const n = s.coinLineLength;
    const base = this.groundY - 90;
    for (let i = 0; i < n; i++) {
      const yy = base - Math.abs(Math.sin(i / (n - 1) * Math.PI)) * 80;
      const kind = Math.random() < s.gemChance ? 'gem' : 'coin';
      this.collectibles.push(new Collectible(kind, this.cfg, x + i * 44, yy));
    }
  }

  spawnPowerup(x) {
    const kind = Math.random() < 0.5 ? 'magnet' : 'shoe';
    this.collectibles.push(new Collectible(kind, this.cfg, x, this.groundY - 100));
  }

  /* ---------- การชน ---------- */
  checkCollisions() {
    const p = this.player;
    const pr = p.rect();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      const r = o.rect();
      let hit = false;

      if (o.kind === 'pit') {
        // ตกหลุม: ต้องอยู่บนพื้นและทับช่วงหลุม
        hit = p.onGround && pr.x < r.x + r.w && pr.x + pr.w > r.x &&
          p.y + p.currentH >= this.groundY - 6;
      } else {
        // AABB ปกติ (คานลอยใช้ hitbox เฉพาะส่วนบน ถ้าสไลด์จะไม่ชน)
        hit = pr.x < r.x + r.w && pr.x + pr.w > r.x &&
          pr.y < r.y + r.h && pr.y + pr.h > r.y;
      }

      if (hit && p.hit(1)) {
        this.obstacles.splice(i, 1);
        this.flash = 0.3;
        this.audio.hit();
        if (p.hp <= 0) { this.gameOver(); return; }
      }
    }

    for (const c of this.collectibles) {
      if (c.taken) continue;
      const cr = c.rect();
      if (pr.x < cr.x + cr.w && pr.x + pr.w > cr.x &&
        pr.y < cr.y + cr.h && pr.y + pr.h > cr.y) {
        c.taken = true;
        if (c.kind === 'coin' || c.kind === 'gem') {
          const val = this.cfg.collectibles[c.kind].score;
          this.addScore(val, c.kind === 'gem' ? 'อัญมณี +50' : 'เหรียญ +10');
          if (c.kind === 'coin') this.audio.coin(); else this.audio.gem();
        } else if (c.kind === 'magnet') {
          this.magnetTimer = this.cfg.collectibles.magnet.duration;
          this.addEffectText('🧲 แม่เหล็ก! ดูดเหรียญ ' + this.magnetTimer + ' วิ', '#7ee8fa');
          this.audio.power();
        } else if (c.kind === 'shoe') {
          this.shoeTimer = this.cfg.collectibles.shoe.duration;
          this.addEffectText('👟 รองเท้าเร็ว! +' + this.shoeTimer + ' วิ', '#ff9f43');
          this.audio.power();
        }
      }
    }
  }

  /* ---------- คะแนน / เอฟเฟกต์ ---------- */
  addScore(amount, label) {
    this.score += amount;
    if (label) this.addEffectText(label, '#ffd34d');
  }

  addEffectText(text, color) {
    // เรียงตำแหน่งเริ่มต้นของข้อความแนวตั้งสลับกันไป กันไม่ให้ข้อความที่เกิดพร้อมกัน
    // (เช่น เก็บแม่เหล็กพร้อมกับได้คะแนนระยะทาง) มาซ้อนทับกันพอดี
    this.effectSlot = ((this.effectSlot || 0) + 1) % 3;
    const startY = this.H / 2 - 60 - this.effectSlot * 34;
    this.effects.push({ text, color, x: this.W / 2, y: startY, life: 1.2, vy: -60 });
  }

  updateEffects(dt) {
    for (const e of this.effects) {
      e.life -= dt;
      e.y += e.vy * dt;
    }
    this.effects = this.effects.filter(e => e.life > 0);
  }

  /* ---------- พื้นหลัง (parallax) ---------- */
  buildBackground() {
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: Math.random() * this.W,
        y: 40 + Math.random() * 140,
        r: 25 + Math.random() * 30,
        speed: 12 + Math.random() * 20
      });
    }
    this.groundOffset = 0;
    this.bgOffset = 0; // ตัวเลื่อน parallax ของรูปพื้นหลัง (แยกจาก groundOffset)
  }

  updateBackground(dt, speed) {
    this.groundOffset = (this.groundOffset + speed * dt) % 40;
    // เดิมใช้ groundOffset (ซึ่งวนซ้ำทุก 40px) มาเลื่อนพื้นหลังภาพด้วย
    // ทำให้ภาพกระตุก/สะดุดทุกครั้งที่ groundOffset วนกลับเป็น 0
    // จึงแยกตัวนับเป็นของตัวเอง ให้เลื่อนต่อเนื่องไม่มีสะดุด
    this.bgOffset = (this.bgOffset + speed * dt * 0.3) % this.W;
    for (const cl of this.clouds) {
      cl.x -= cl.speed * dt;
      if (cl.x < -80) { cl.x = this.W + 80; cl.y = 40 + Math.random() * 140; }
    }
  }

  drawBackground(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, '#87ceeb');
    grad.addColorStop(0.65, '#cdeaf7');
    grad.addColorStop(1, '#e8f7ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);

    if (isImgReady(this.bgImage)) {
      // ภาพพื้นหลังเลื่อนแบบ parallax เต็มพื้นที่ (รูปมีพื้น/ทางเดินอยู่ในตัวอยู่แล้ว
      // จึงไม่ต้องวาดแถบดินสีน้ำตาลซ้อนทับด้านล่างอีก)
      const ox = -this.bgOffset;
      ctx.drawImage(this.bgImage, ox, 0, this.W, this.H);
      ctx.drawImage(this.bgImage, ox + this.W, 0, this.W, this.H);
      return;
    }

    // fallback: เมฆ + เนินเขา + พื้นถนน (ใช้เฉพาะตอนยังไม่มีรูปพื้นหลัง)
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (const cl of this.clouds) {
      ctx.beginPath();
      ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
      ctx.arc(cl.x + cl.r * 0.8, cl.y + 6, cl.r * 0.7, 0, Math.PI * 2);
      ctx.arc(cl.x - cl.r * 0.8, cl.y + 6, cl.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#9fd98a';
    ctx.beginPath(); ctx.ellipse(this.W * 0.25, this.groundY, 260, 90, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.ellipse(this.W * 0.8, this.groundY, 300, 110, 0, Math.PI, 0); ctx.fill();

    // พื้น (fallback เท่านั้น)
    ctx.fillStyle = '#8a6a44';
    ctx.fillRect(0, this.groundY, this.W, this.H - this.groundY);
    ctx.fillStyle = '#7a5c3a';
    for (let x = -this.groundOffset; x < this.W + 40; x += 40) {
      ctx.fillRect(x, this.groundY + 12, 20, 6);
    }
    ctx.fillStyle = '#5f4526';
    ctx.fillRect(0, this.groundY, this.W, 4);
  }

  /* ---------- วาด ---------- */
  draw() {
    const ctx = this.ctx;
    ctx.save();
    this.drawBackground(ctx);

    for (const c of this.collectibles) c.draw(ctx, this.time);
    for (const o of this.obstacles) o.draw(ctx);
    this.player.draw(ctx);

    // ข้อความลอย
    ctx.textAlign = 'center';
    for (const e of this.effects) {
      ctx.globalAlpha = Math.min(1, e.life);
      ctx.font = "bold 22px 'Segoe UI', Tahoma, sans-serif";
      ctx.fillStyle = e.color;
      ctx.fillText(e.text, e.x, e.y);
    }
    ctx.globalAlpha = 1;

    // แฟลชแดงตอนโดนชน
    if (this.flash > 0) {
      ctx.fillStyle = 'rgba(255,0,0,' + (this.flash * 0.5) + ')';
      ctx.fillRect(0, 0, this.W, this.H);
    }

    if (this.state === 'playing' || this.state === 'gameover') this.drawHUD(ctx);

    if (this.paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, this.W, this.H);
      ctx.fillStyle = '#fff';
      ctx.font = "bold 40px 'Segoe UI', Tahoma, sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText('⏸ หยุดชั่วคราว', this.W / 2, this.H / 2);
      ctx.font = "18px 'Segoe UI', Tahoma, sans-serif";
      ctx.fillText('กด P เพื่อเล่นต่อ', this.W / 2, this.H / 2 + 40);
    }

    // ---- โหมดปรับ groundY แบบเรียลไทม์ (debug): กด ↑/↓ ปรับ, C เปิด/ปิด ----
    if (this.calib) {
      // เส้นแดง = groundY
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, this.groundY);
      ctx.lineTo(this.W, this.groundY);
      ctx.stroke();
      ctx.fillStyle = '#ff0000';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('groundY = ' + this.groundY, 10, this.groundY + 24);

      // เส้นเขียว = เท้าตัวละคร
      const feetY = this.player.y + this.player.currentH;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, feetY);
      ctx.lineTo(this.W, feetY);
      ctx.stroke();

      // เส้นฟ้า = ขอบล่างคาน (groundY - gap) ถ้ามีคานอยู่บนจอ
      for (const o of this.obstacles) {
        if (o.kind === 'high') {
          const barBottomY = this.groundY - o.gap;
          ctx.strokeStyle = '#00bfff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, barBottomY);
          ctx.lineTo(this.W, barBottomY);
          ctx.stroke();
          break;
        }
      }
    }

    ctx.restore();
  }

  drawHUD(ctx) {
    const u = this.cfg.ui;
    ctx.textAlign = 'left';
    ctx.font = u.font;
    ctx.fillStyle = u.colorScore;
    ctx.fillText('คะแนน: ' + this.score, 20, 40);
    ctx.fillStyle = '#fff';
    ctx.fillText('ระยะทาง: ' + this.distance + ' ม.', 20, 72);

    // HP เป็นหัวใจ
    const maxHp = this.cfg.player.maxHp;
    ctx.font = "28px 'Segoe UI', Tahoma, sans-serif";
    for (let i = 0; i < maxHp; i++) {
      ctx.fillText(i < this.player.hp ? '❤️' : '🖤', this.W - 40 - (maxHp - 1 - i) * 40, 44);
    }

    // ไอเทมที่กำลัง active
    ctx.font = "18px 'Segoe UI', Tahoma, sans-serif";
    let y = 76;
    if (this.magnetTimer > 0) {
      ctx.fillStyle = '#7ee8fa';
      ctx.fillText('🧲 แม่เหล็ก ' + Math.ceil(this.magnetTimer) + ' วิ', 20, y);
      y += 28;
    }
    if (this.shoeTimer > 0) {
      ctx.fillStyle = '#ff9f43';
      ctx.fillText('👟 เร็ว ' + Math.ceil(this.shoeTimer) + ' วิ', 20, y);
    }
  }
}