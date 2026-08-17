/* =========================================================
   player.js — คลาสผู้เล่น: วิ่งอัตโนมัติ, กระโดด, สไลด์
   ใช้ player_sheet.png เป็น sprite sheet ตาราง (grid) เดียว
   ตัดเฟรมตาม frameWidth/frameHeight/columns ที่กำหนดใน data.json
   (ปรับตัวเลขในนั้นให้ตรงกับรูปจริงของคุณได้เลย ไม่ต้องแก้ไฟล์นี้)
========================================================= */

class Player {
  constructor(cfg) {
    this.g = cfg.game;
    this.p = cfg.player;
    this.x = this.p.x;
    this.w = this.p.w;
    this.h = this.p.h;
    this.groundY = this.g.groundY;
    this.y = this.groundY - this.h;
    this.vy = 0;
    this.state = 'run';          // run | jump | slide
    this.onGround = true;
    this.slideTimer = 0;
    this.hp = this.p.maxHp;
    this.invincible = 0;         // ช่วงปลอดภัยหลังโดนชน
    this.animIndex = 0;
    this.animTimer = 0;

    // ---- sprite sheet ----
    const s = this.p.sprites;
    this.sheet = loadImage(s.image);
    this.frameW = s.frameWidth;
    this.frameH = s.frameHeight;
    this.columns = s.columns;
    this.runFrames = s.runFrames && s.runFrames.length ? s.runFrames : [0];
    this.slideFrames = s.slideFrames && s.slideFrames.length ? s.slideFrames : this.runFrames;
    this.jumpFrame = s.jumpFrame ?? 0;

    // ---- ตัดพื้นที่โปร่งใสด้านล่างของสไปรต์ (ให้เท้าแตะพื้นจริง) ----
    this.playerPad = 0;
    this._padChecked = false;
  }

  /* ความสูงปัจจุบัน (สไลด์จะเตี้ยลง) */
  get currentH() {
    return this.state === 'slide' ? this.p.slideH : this.h;
  }

  jump() {
    if (this.state === 'slide') this.slideTimer = 0; // ยกเลิกสไลด์แล้วกระโดด
    if (this.onGround) {
      this.vy = this.p.jumpVelocity;
      this.onGround = false;
      this.state = 'jump';
    }
  }

  slide() {
    if (this.onGround && this.state !== 'slide') {
      this.state = 'slide';
      this.slideTimer = this.p.slideDuration;
    }
  }

  update(dt) {
    // ฟิสิกส์การกระโดด
    if (!this.onGround) {
      this.vy += this.g.gravity * dt;
      this.y += this.vy * dt;
    }
    // ลงพื้น
    if (this.y >= this.groundY - this.h) {
      this.y = this.groundY - this.h;
      this.vy = 0;
      this.onGround = true;
      if (this.state === 'jump') this.state = 'run';
    }
    // สไลด์หมดเวลา
    if (this.state === 'slide') {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.state = 'run';
        this.slideTimer = 0;
      }
    }
    // ช่วงปลอดภัย
    if (this.invincible > 0) this.invincible -= dt;

    // อนิเมชัน (สลับเฟรมตอนวิ่งหรือสไลด์ ทั้งสองท่าใช้ชุดเฟรมเดียวกัน)
    const frameCount = this.state === 'slide' ? this.slideFrames.length : this.runFrames.length;
    if ((this.state === 'run' || this.state === 'slide') && frameCount > 1) {
      this.animTimer += dt;
      if (this.animTimer >= 1 / this.p.runFps) {
        this.animTimer = 0;
        this.animIndex = (this.animIndex + 1) % frameCount;
      }
    }
  }

  /* โดนชน: คืนค่า true ถ้าโดนจริง (ไม่ใช่ช่วงปลอดภัย) */
  hit(damage) {
    if (this.invincible > 0) return false;
    this.hp -= damage;
    this.invincible = this.g.invincibleTime;
    this.vy = Math.min(this.vy, -450); // เด้งขึ้นเล็กน้อย
    return true;
  }

  /* hitbox (เล็กกว่ารูป เผื่อรูปมีพื้นที่โปร่ง) */
  rect() {
    const hh = this.currentH;
    const yy = this.y + (this.h - hh) + this.playerPad; // ฐานล่างติดพื้น (หัก pad โปร่งใสของสไปรต์)
    // ระยะขอบ hitbox ปรับตามสัดส่วนขนาดตัวละครจริง (เดิมคิดจากตัวละคร 64x80)
    const marginX = this.w * 0.15625;   // 10/64
    const marginYTop = hh * 0.05;       // ~4/80
    const marginYBottom = hh * 0.1;     // ~8/80
    return { x: this.x + marginX, y: yy + marginYTop, w: this.w - marginX * 2, h: hh - marginYTop - marginYBottom };
  }

  /* เลขเฟรมปัจจุบันตาม state */
  currentFrame() {
    if (this.state === 'jump') return this.jumpFrame;
    if (this.state === 'slide') return this.slideFrames[this.animIndex] ?? this.slideFrames[0];
    return this.runFrames[this.animIndex] ?? this.runFrames[0];
  }

  draw(ctx) {
    if (this.invincible > 0 && Math.floor(this.invincible * 12) % 2 === 0) return; // กระพริบ

    const h = this.currentH;
    const y = this.y + (this.h - h);
    const x = this.x;
    const w = this.w;

    if (isImgReady(this.sheet)) {
      // ตัดพื้นที่โปร่งใสด้านล่างของสไปรต์ (ใช้ detectBottomPad จาก entities.js)
      if (!this._padChecked && isImgReady(this.sheet)) {
        this.playerPad = detectBottomPad(this.sheet) * (this.h / this.sheet.naturalHeight);
        this._padChecked = true;
      }
      const yDraw = y + this.playerPad;

      const frame = this.currentFrame();
      const sx = (frame % this.columns) * this.frameW;
      const sy = Math.floor(frame / this.columns) * this.frameH;

      ctx.drawImage(this.sheet, sx, sy, this.frameW, this.frameH, x, yDraw, w, h);
      return;
    }

    /* ---- fallback: วาดตัวละครเป็นรูปทรง (เมื่อยังโหลดรูปไม่สำเร็จ) ---- */

  }
}