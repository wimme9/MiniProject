/* =========================================================
   entities.js — สิ่งกีดขวาง + ของเก็บ (เหรียญ/อัญมณี/ไอเทม)
   kind ของสิ่งกีดขวาง:
   - ground : วางบนพื้น ต้องกระโดดข้าม (crate, spike)
   - high   : คานลอย มีช่องว่างข้างล่าง ต้องสไลด์ลอด (bar)
   - pit    : หลุมบนพื้น ต้องกระโดดข้าม
   ✅ สิ่งกีดขวางวางพื้น "ยึดติดเส้นพื้น" อัตโนมัติ:
   สแกนหาพื้นที่โปร่งใสด้านล่างของรูป แล้วเลื่อนวาด + ลด hitbox
   ให้ตรงเนื้อรูปจริง ไม่ต้องวัดค่าเอง
========================================================= */

/* สแกนหาระยะโปร่งใสด้านล่างของรูป (ตัดพื้นที่โปร่งใสด้านล่างของรูปอัตโนมัติ) คืนค่า px ของรูปจริง */
function detectBottomPad(img) {
  try {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const cx = c.getContext('2d');
    cx.drawImage(img, 0, 0);
    const data = cx.getImageData(0, 0, c.width, c.height).data;
    const w = c.width, h = c.height;
    for (let y = h - 1; y >= 0; y--) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 10) return h - 1 - y;
      }
    }
  } catch (e) {}
  return 0;
}

class Obstacle {
  constructor(key, cfg, x) {
    this.key = key;
    this.o = cfg.obstacles[key];
    this.cfg = cfg;
    this.x = x;
    this.w = this.o.w;
    this.h = this.o.h;
    this.gap = this.o.gap || 0;
    this.kind = this.o.kind;
    this.groundY = cfg.game.groundY;
    this.canvasH = cfg.game.height;
    this.img = loadImage(this.o.image);
    this.manualPad = this.o.padBottom || 0; // ตั้งเองได้ แต่ปกติไม่ต้อง
    this.autoPad = 0;
    this._padChecked = false;
    this.keepAspect = !!this.o.keepAspect;  // คงสัดส่วนรูปจริง (กันรูปเบี้ยว)
    this._sizeReady = false;
  }

  /* ค่า pad ที่ใช้จริง: ตั้งเอง > อัตโนมัติ (ตัดพื้นที่โปร่งใสด้านล่างของรูป) */
  get pad() {
    if (this.manualPad) return this.manualPad;
    if (!this._padChecked && isImgReady(this.img)) {
      this.autoPad = detectBottomPad(this.img) * (this.h / this.img.naturalHeight);
      this._padChecked = true;
    }
    return this.autoPad;
  }

  /* ปรับความกว้างให้ตรงสัดส่วนรูปจริง (คงความสูง h ไว้) กันรูปเบี้ยว */
  ensureSize() {
    if (this.keepAspect && !this._sizeReady && isImgReady(this.img)) {
      const ratio = this.img.naturalWidth / this.img.naturalHeight;
      this.w = Math.max(10, Math.round(this.h * ratio));
      this._sizeReady = true;
    }
  }

  update(dt, speed) { this.ensureSize(); this.x -= speed * dt; }

  rect() {
    if (this.kind === 'pit') {
      return { x: this.x + 6, y: this.groundY, w: this.w - 12, h: this.h };
    }
    if (this.kind === 'high') {
      // คานลอย: hitbox สูง = h - gap (ขอบล่างคานลอยสูงจากพื้น = gap) → ยืนชน / สไลด์ลอดผ่าน
      return { x: this.x + 8, y: this.groundY - this.h, w: this.w - 16, h: this.h - this.gap };
    }
    // วางพื้น: hitbox ยึดติดเส้นพื้นอัตโนมัติ (ตัดพื้นที่โปร่งใสด้านล่างของรูป)
    const pad = this.pad;
    return { x: this.x + 6, y: this.groundY - this.h + pad, w: this.w - 12, h: this.h - pad };
  }

  offscreen() { return this.x + this.w < -40; }

  draw(ctx) {
    this.ensureSize();
    const r = this.rect();
    const isPit = this.kind === 'pit';
    const isHigh = this.kind === 'high';
    const pad = isHigh ? 0 : this.pad;
    // สำคัญ: คานต้องวาดสูง = h - gap (ขอบล่างคานลอยสูงจากพื้น = gap) ห้ามใช้ this.h เต็ม
    const drawH = isPit ? (this.canvasH - this.groundY) : (isHigh ? this.h - this.gap : this.h);
    const drawY = isPit ? this.groundY : this.groundY - this.h + pad;
    drawImageOr(ctx, this.img, this.x, drawY, this.w, drawH, (c) => {
      // ---- fallback รูปทรง (ตอนยังไม่มีรูป) ----
      if (isPit) {
        c.fillStyle = '#1a1a1a';
        c.fillRect(this.x + 6, this.groundY, this.w - 12, drawH);
        c.fillStyle = '#0c0c0c';
        c.fillRect(this.x + 12, this.groundY, this.w - 24, drawH - 8);
      } else if (isHigh) {
        c.fillStyle = '#ff6b35';
        c.fillRect(r.x, r.y, r.w, r.h);
        c.fillStyle = '#e04e1a';
        for (let i = 0; i < 3; i++) c.fillRect(r.x + i * r.w / 3, r.y, 6, r.h);
        c.strokeStyle = '#8a2f0a'; c.lineWidth = 3; c.strokeRect(r.x, r.y, r.w, r.h);
      } else if (this.key === 'spike') {
        c.fillStyle = '#9aa5b1';
        c.beginPath();
        c.moveTo(r.x, r.y + r.h);
        c.lineTo(r.x + r.w / 2, r.y);
        c.lineTo(r.x + r.w, r.y + r.h);
        c.closePath(); c.fill();
        c.strokeStyle = '#5b6672'; c.lineWidth = 2; c.stroke();
      } else {
        c.fillStyle = '#b07d3f';
        c.fillRect(r.x, r.y, r.w, r.h);
        c.fillStyle = '#8a5f2b';
        c.fillRect(r.x, r.y, r.w, r.h / 2);
        c.strokeStyle = '#5f3f17'; c.lineWidth = 3; c.strokeRect(r.x, r.y, r.w, r.h);
      }
    });
  }
}

class Collectible {
  constructor(kind, cfg, x, y) {
    this.kind = kind;            // coin | gem | magnet | shoe
    this.c = cfg.collectibles[kind];
    this.cfg = cfg;
    this.x = x;
    this.y = y;
    this.w = this.c.w;
    this.h = this.c.h;
    this.img = loadImage(this.c.image);
    this.taken = false;
  }

  update(dt, speed, player, game) {
    this.x -= speed * dt;
    // แม่เหล็กดูดเหรียญ/อัญมณีเข้าหาผู้เล่น
    if (game.magnetTimer > 0 && (this.kind === 'coin' || this.kind === 'gem')) {
      const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
      const px = player.x + player.w / 2, py = player.y + player.currentH / 2;
      const dx = px - cx, dy = py - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < game.magnetRadius && dist > 1) {
        const pull = game.magnetPullSpeed * dt;
        this.x += (dx / dist) * pull;
        this.y += (dy / dist) * pull;
      }
    }
  }

  rect() { return { x: this.x + 3, y: this.y + 3, w: this.w - 6, h: this.h - 6 }; }

  offscreen() { return this.x + this.w < -40; }

  draw(ctx, time) {
    const scale = 0.6 + 0.4 * Math.abs(Math.sin(time * 4 + this.x * 0.02));
    const w = this.w * scale;
    const x = this.x + (this.w - w) / 2;

    drawImageOr(ctx, this.img, x, this.y, w, this.h, (c) => {
      if (this.kind === 'coin') {
        c.fillStyle = '#ffd34d';
        c.beginPath(); c.ellipse(x + w / 2, this.y + this.h / 2, w / 2, this.h / 2, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#d99e00'; c.lineWidth = 3; c.stroke();
        c.fillStyle = '#d99e00';
        c.beginPath(); c.ellipse(x + w / 2, this.y + this.h / 2, w / 5, this.h / 2.4, 0, 0, Math.PI * 2); c.fill();
      } else if (this.kind === 'gem') {
        c.fillStyle = '#7ee8fa';
        c.beginPath();
        c.moveTo(x + w / 2, this.y);
        c.lineTo(x + w, this.y + this.h / 2);
        c.lineTo(x + w / 2, this.y + this.h);
        c.lineTo(x, this.y + this.h / 2);
        c.closePath(); c.fill();
        c.strokeStyle = '#2fa8c0'; c.lineWidth = 3; c.stroke();
        c.fillStyle = '#e0fbff';
        c.beginPath();
        c.moveTo(x + w / 2, this.y + 4);
        c.lineTo(x + w * 0.7, this.y + this.h / 2);
        c.lineTo(x + w / 2, this.y + this.h - 4);
        c.lineTo(x + w * 0.3, this.y + this.h / 2);
        c.closePath(); c.fill();
      } else if (this.kind === 'magnet') {
        c.fillStyle = '#ff4d4d';
        c.beginPath(); c.arc(x + w / 2 - 8, this.y + this.h / 2, 8, Math.PI, 0); c.fill();
        c.beginPath(); c.arc(x + w / 2 + 8, this.y + this.h / 2, 8, Math.PI, 0); c.fill();
        c.fillRect(x + w / 2 - 8, this.y + this.h / 2 - 4, 16, 10);
        c.fillStyle = '#fff';
        c.fillRect(x + w / 2 - 8, this.y + this.h / 2 - 4, 16, 3);
      } else { // shoe
        c.fillStyle = '#ff9f43';
        c.beginPath();
        c.moveTo(x, this.y + this.h * 0.7);
        c.lineTo(x + w * 0.4, this.y);
        c.lineTo(x + w * 0.75, this.y + this.h * 0.2);
        c.lineTo(x + w * 0.9, this.y + this.h * 0.7);
        c.closePath(); c.fill();
        c.strokeStyle = '#b25e00'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#fff';
        c.fillRect(x + w * 0.5, this.y + this.h * 0.35, 6, this.h * 0.3);
      }
    });
  }
}