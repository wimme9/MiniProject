// scenes/MenuScene.js
// Title / Menu Scene. Also loads gameData.json and generates all
// placeholder textures once (they stay cached for every other scene).

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.json('gameData', 'data/gameData.json');
    this.load.spritesheet('cat_idle', 'assets/cat_idle.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('cat_run', 'assets/cat_run.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('cat_jump', 'assets/cat_jump.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('cat_fall', 'assets/cat_fallt.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    createPlaceholderTextures(this); // safe to call from any scene, runs once
    createCatAnimations(this); // safe to call from any scene, runs once

    const { width, height } = this.scale;

    this.cameras.main.fadeIn(350, 0, 0, 0);
    SFX.startMusic('menu');

    this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height);
    this.buildDriftingClouds(width, height);
    this.buildButterflies(width, height);

    const title = this.add.text(width / 2, height * 0.26, 'ONE MINUTE PLATFORMER', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '42px',
      color: '#ffffff',
      stroke: '#2b2b52',
      strokeThickness: 8
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });
    this.tweens.add({
      targets: title,
      y: title.y - 6,
      duration: 1600,
      delay: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const subtitle = this.add.text(width / 2, height * 0.26 + 46, 'Reach the goal in 60 seconds!', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#2b2b52',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: subtitle, alpha: 1, duration: 500, delay: 400 });

    this.makeButton(width / 2, height * 0.58, 'START', 'green', () => {
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameplayScene'));
    });

    this.makeButton(width / 2, height * 0.7, 'HOW TO PLAY', 'blue', () => {
      this.toggleHowToPlay(true);
    });

    // How To Play overlay (built into the Menu scene, hidden by default)
    this.howToGroup = this.buildHowToPlay();
    this.toggleHowToPlay(false);

    this.makeMuteButton(width - 30, 26);

    // A few floating coins purely for menu decoration
    [[width * 0.16, height * 0.42], [width * 0.85, height * 0.5], [width * 0.12, height * 0.72]].forEach(([cx, cy], i) => {
      const c = this.add.image(cx, cy, 'coin').setScale(1.4).setAlpha(0.9);
      this.tweens.add({ targets: c, y: cy - 10, duration: 900 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: c, angle: 360, duration: 3000 + i * 300, repeat: -1 });
    });
  }

  buildDriftingClouds(width, height) {
    this.menuClouds = [];
    for (let i = 0; i < 4; i++) {
      const c = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(20, height * 0.35), 'cloud')
        .setAlpha(0.8)
        .setScale(Phaser.Math.FloatBetween(0.6, 1.1));
      this.menuClouds.push(c);
    }
  }

  update(time, delta) {
    if (this.menuClouds) {
      const { width } = this.scale;
      this.menuClouds.forEach(c => {
        c.x += delta * 0.01;
        if (c.x > width + 80) c.x = -80;
      });
    }
  }

  buildButterflies(width, height) {
    const colors = [0xff6fa5, 0xffd54a, 0x6fe0e0, 0xb98cff, 0x8affa0];
    for (let i = 0; i < 5; i++) {
      const b = this.add.image(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(height * 0.3, height * 0.85),
        'butterfly'
      ).setTint(colors[i % colors.length]).setScale(Phaser.Math.FloatBetween(0.9, 1.3));

      this.tweens.add({
        targets: b, scaleX: b.scaleX * 0.4, duration: 130 + i * 10, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });

      // Gentle wandering flight path
      const path = () => {
        this.tweens.add({
          targets: b,
          x: Phaser.Math.Clamp(b.x + Phaser.Math.Between(-160, 160), 20, width - 20),
          y: Phaser.Math.Clamp(b.y + Phaser.Math.Between(-90, 90), height * 0.22, height * 0.9),
          duration: Phaser.Math.Between(2200, 3600),
          ease: 'Sine.easeInOut',
          onComplete: path
        });
      };
      path();
    }
  }

  // Cute glossy rounded button: drop shadow, two-tone body, glossy top
  // highlight sheen, and a little squash/bounce + sparkle on click.
  buttonPalette(scheme) {
    const palettes = {
      green: { base: 0x6bd674, dark: 0x2f7d3d, edge: 0x3f9a4f },
      blue: { base: 0x6fc3ff, dark: 0x2d6fa3, edge: 0x4a9fdb },
      pink: { base: 0xff8fb0, dark: 0xb0466c, edge: 0xd66189 },
      red: { base: 0xff8a8a, dark: 0xb43b3b, edge: 0xd65a5a },
      yellow: { base: 0xffd54a, dark: 0xc98a1f, edge: 0xe0a92e }
    };
    return palettes[scheme] || palettes.green;
  }

  hexStr(c) {
    return '#' + c.toString(16).padStart(6, '0');
  }

  makeButton(x, y, label, scheme = 'green', onClick, w = 250, h = 58) {
    const p = this.buttonPalette(scheme);
    const container = this.add.container(x, y);
    const radius = h / 2.4;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x1a3d22, 0.22);
    shadow.fillRoundedRect(-w / 2 + 2, -h / 2 + 7, w, h, radius);

    const body = this.add.graphics();
    body.fillStyle(p.dark, 1);
    body.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, radius);
    body.fillStyle(p.base, 1);
    body.fillRoundedRect(-w / 2, -h / 2, w, h - 6, radius);
    body.lineStyle(3, p.edge, 1);
    body.strokeRoundedRect(-w / 2, -h / 2, w, h - 6, radius);
    body.fillStyle(0xffffff, 0.4);
    body.fillRoundedRect(-w / 2 + w * 0.08, -h / 2 + h * 0.1, w * 0.84, h * 0.32, radius * 0.8);

    const txt = this.add.text(0, -2, label, {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', color: '#ffffff',
      stroke: this.hexStr(p.dark), strokeThickness: 5
    }).setOrigin(0.5);

    container.add([shadow, body, txt]);
    container.setSize(w, h + 8);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.07, duration: 130, ease: 'Back.easeOut' });
      SFX.hover();
    });
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 130 });
    });
    container.on('pointerdown', () => {
      SFX.click();
      this.sparkleAt(x, y);
      this.tweens.add({
        targets: container, scale: 0.9, duration: 70, yoyo: true, ease: 'Sine.easeOut',
        onComplete: () => onClick()
      });
    });

    return container;
  }

  sparkleAt(x, y) {
    const emitter = this.add.particles(x, y, 'particleSpark', {
      speed: { min: 60, max: 160 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 380,
      quantity: 10,
      frequency: -1,
      tint: [0xffe14a, 0xffffff, 0x8fe895]
    }).setDepth(80);
    emitter.explode(10, x, y);
    this.time.delayedCall(500, () => emitter.destroy());
  }

  makeMuteButton(x, y) {
    const icon = () => (SFX.isMuted() ? '\uD83D\uDD07' : '\uD83D\uDD0A');
    const badge = this.add.circle(x, y, 22, 0xffffff, 0.85).setStrokeStyle(3, 0x6fc3ff);
    const txt = this.add.text(x, y, icon(), { fontSize: '20px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    txt.on('pointerover', () => this.tweens.add({ targets: [txt, badge], scale: 1.15, duration: 100 }));
    txt.on('pointerout', () => this.tweens.add({ targets: [txt, badge], scale: 1, duration: 100 }));
    txt.on('pointerdown', () => {
      SFX.toggle();
      txt.setText(icon());
      if (!SFX.isMuted()) SFX.click();
    });
    return txt;
  }

  buildHowToPlay() {
    const { width, height } = this.scale;

    const panelW = width * 0.8;
    const panelH = height * 0.75;
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.25);
    shadow.fillRoundedRect(width / 2 - panelW / 2 + 4, height / 2 - panelH / 2 + 8, panelW, panelH, 28);

    const panel = this.add.graphics();
    panel.fillStyle(0xfff6e0, 1);
    panel.fillRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 28);
    panel.lineStyle(5, 0xffb347, 1);
    panel.strokeRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 28);

    const lines = [
      'HOW TO PLAY',
      '',
      'A / \u2190      Move Left',
      'D / \u2192      Move Right',
      'SPACE / W / \u2191   Jump',
      'ESC        Pause',
      '',
      'Reach the GOAL before the 60s timer runs out.',
      'Collect coins for points, avoid spikes and pits.',
      'You have 3 HP \u2014 lose it all and it is Game Over!',
      'Pass the checkpoint flag to save your progress.',
      ''
    ];

    const text = this.add.text(width / 2, height / 2 - 40, lines.join('\n'), {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#3a5a2f',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5, 0.4);

    const closeBtn = this.makeButton(width / 2, height / 2 + height * 0.3, 'CLOSE', 'pink', () => {
      this.toggleHowToPlay(false);
    }, 170, 48);

    return this.add.container(0, 0, [shadow, panel, text, closeBtn]);
  }

  toggleHowToPlay(show) {
    this.howToGroup.setVisible(show);
    if (show) {
      this.howToGroup.setScale(0.85).setAlpha(0);
      this.tweens.add({ targets: this.howToGroup, scale: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' });
    }
  }
}

/**
 * Fills a rectangle with a smooth multi-stop vertical color gradient using
 * plain fillRect bands. Graphics.fillGradientStyle only actually renders
 * under Phaser's WebGL renderer - on Canvas it silently draws nothing -
 * so this manual approach is used instead to guarantee the sky always
 * shows correctly regardless of which renderer the browser picked.
 */
function drawVerticalGradient(g, x, y, w, h, stops) {
  const steps = 80;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    let a = stops[0], b = stops[stops.length - 1];
    for (let j = 0; j < stops.length - 1; j++) {
      if (t >= stops[j].stop && t <= stops[j + 1].stop) { a = stops[j]; b = stops[j + 1]; break; }
    }
    const span = (b.stop - a.stop) || 1;
    const localT = Phaser.Math.Clamp((t - a.stop) / span, 0, 1);
    const colorA = Phaser.Display.Color.IntegerToColor(a.color);
    const colorB = Phaser.Display.Color.IntegerToColor(b.color);
    const mixed = Phaser.Display.Color.Interpolate.ColorWithColor(colorA, colorB, 100, localT * 100);
    const colInt = Phaser.Display.Color.GetColor(Math.round(mixed.r), Math.round(mixed.g), Math.round(mixed.b));
    g.fillStyle(colInt, 1);
    g.fillRect(x, y + h * (i / steps), w, h / steps + 1);
  }
}

/**
 * Generates every placeholder texture the game needs, using Phaser's
 * Graphics API. Runs once per game instance (guarded by texture.exists).
 * Replace any of these later with real images: just load a real image
 * under the same key in preload() and delete the matching block here.
 */
function createPlaceholderTextures(scene) {
  if (scene.textures.exists('ground')) return;

  const g = scene.add.graphics();

  // ---- Background: bright, cheerful morning sky ----
  g.clear();
  // Soft gradient: warm sunrise glow low on the horizon fading up into
  // clear morning blue. Drawn as manual color bands (not fillGradientStyle,
  // which only actually renders under WebGL and leaves a black sky when
  // the browser falls back to the Canvas renderer).
  drawVerticalGradient(g, 0, 0, 960, 540, [
    { stop: 0, color: 0x7fd4ff },
    { stop: 0.6, color: 0xbfe9ff },
    { stop: 1, color: 0xffe3a8 }
  ]);

  // Sun with soft layered glow + simple rays, sitting low-ish like early morning
  const sunX = 170, sunY = 120;
  g.fillStyle(0xfff6c4, 0.35);
  g.fillCircle(sunX, sunY, 100);
  g.fillStyle(0xffe98a, 0.5);
  g.fillCircle(sunX, sunY, 72);
  g.fillStyle(0xfff4b0, 1);
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    const rx = sunX + Math.cos(a) * 78;
    const ry = sunY + Math.sin(a) * 78;
    const rx2 = sunX + Math.cos(a) * 52;
    const ry2 = sunY + Math.sin(a) * 52;
    const perpA = a + Math.PI / 2;
    const w = 6;
    g.fillTriangle(
      rx, ry,
      rx2 + Math.cos(perpA) * w, ry2 + Math.sin(perpA) * w,
      rx2 - Math.cos(perpA) * w, ry2 - Math.sin(perpA) * w
    );
  }
  g.fillStyle(0xfff9d9, 1);
  g.fillCircle(sunX, sunY, 44);
  g.fillStyle(0xffffff, 0.6);
  g.fillCircle(sunX - 12, sunY - 12, 14);

  // A soft haze band along the horizon for extra warmth
  g.fillStyle(0xfff6d6, 0.5);
  g.fillRect(0, 360, 960, 60);

  // Distant hills - light, dreamy pastel green (back layer)
  g.fillStyle(0x9fe6a0, 1);
  g.fillEllipse(150, 470, 420, 160);
  g.fillEllipse(520, 500, 500, 180);
  g.fillEllipse(850, 480, 380, 150);
  g.fillStyle(0xbdf2be, 1);
  g.fillEllipse(150, 415, 300, 40);
  g.fillEllipse(520, 440, 340, 40);
  g.fillEllipse(850, 425, 260, 36);

  // Near hills - bright fresh spring green (front layer)
  g.fillStyle(0x6bd674, 1);
  g.fillEllipse(300, 500, 380, 140);
  g.fillEllipse(700, 510, 460, 150);
  g.fillStyle(0x8fe895, 1);
  g.fillEllipse(300, 452, 260, 34);
  g.fillEllipse(700, 458, 300, 34);

  // A scattering of tiny wildflower dots on the near hills for extra cuteness
  g.fillStyle(0xffe14a, 1);
  for (let i = 0; i < 14; i++) {
    g.fillCircle(160 + (i * 53) % 700, 470 + ((i * 37) % 40), 2.4);
  }
  g.fillStyle(0xff8fb0, 1);
  for (let i = 0; i < 10; i++) {
    g.fillCircle(220 + (i * 71) % 650, 480 + ((i * 29) % 35), 2.2);
  }
  g.generateTexture('bg', 960, 540);

  // ---- Drifting cloud (soft overlapping puffs, warm morning tint) ----
  g.clear();
  g.fillStyle(0xffffff, 0.95);
  g.fillEllipse(30, 24, 46, 30);
  g.fillEllipse(60, 16, 40, 26);
  g.fillEllipse(90, 24, 46, 30);
  g.fillEllipse(58, 30, 70, 26);
  g.fillStyle(0xfff2d0, 0.55);
  g.fillEllipse(60, 34, 62, 14);
  g.generateTexture('cloud', 120, 48);

  // ---- Soft shadow blob (used under player / floating platforms) ----
  g.clear();
  g.fillStyle(0x0a0a0a, 0.28);
  g.fillEllipse(18, 6, 34, 10);
  g.generateTexture('shadowBlob', 36, 12);

  // ---- Ground tile (grass top w/ blades + dirt speckle) ----
  g.clear();
  g.fillStyle(0x8a5a34, 1);
  g.fillRect(0, 0, 64, 40);
  g.fillStyle(0x7a4d2c, 1);
  for (let i = 0; i < 10; i++) {
    g.fillCircle(4 + (i * 6) % 60, 14 + ((i * 13) % 22), 1.6);
  }
  g.fillStyle(0x5cb85c, 1);
  g.fillRect(0, 0, 64, 12);
  g.fillStyle(0x4a9a4a, 1);
  g.fillRect(0, 9, 64, 3);
  g.fillStyle(0x6fca6f, 1);
  for (let i = 0; i < 7; i++) {
    const bx = 3 + i * 9;
    g.fillTriangle(bx, 6, bx + 2, -3, bx + 4, 6);
  }
  g.generateTexture('ground', 64, 40);

  // ---- Floating platform (wood plank w/ grain + moss top) ----
  g.clear();
  g.fillStyle(0x8a5a34, 1);
  g.fillRoundedRect(0, 0, 64, 24, 6);
  g.fillStyle(0x74492a, 1);
  g.fillRect(0, 10, 64, 2);
  g.fillRect(0, 17, 64, 2);
  g.fillStyle(0x5cb85c, 1);
  g.fillRoundedRect(0, 0, 64, 8, { tl: 6, tr: 6, bl: 0, br: 0 });
  g.fillStyle(0x4a9a4a, 1);
  g.fillEllipse(10, 6, 12, 6);
  g.fillEllipse(48, 5, 14, 6);
  g.generateTexture('platform', 64, 24);

  // ---- Coin ----
  g.clear();
  g.fillStyle(0xd8a400, 1);
  g.fillCircle(12, 12, 12);
  g.fillStyle(0xffd54a, 1);
  g.fillCircle(12, 12, 8);
  g.fillStyle(0xfff0b3, 1);
  g.fillCircle(9, 9, 2.5);
  g.generateTexture('coin', 24, 24);

  // ---- Bonus coin (bigger, sparkly, ringed) ----
  g.clear();
  g.fillStyle(0xd96b00, 1);
  g.fillCircle(14, 14, 14);
  g.fillStyle(0xffb347, 1);
  g.fillCircle(14, 14, 10);
  g.fillStyle(0xfff0b3, 1);
  g.fillCircle(10, 10, 3);
  g.lineStyle(2, 0xfff0b3, 1);
  g.strokeCircle(14, 14, 13);
  g.generateTexture('bonusCoin', 28, 28);

  // ---- Spike (row of triangles w/ highlight) ----
  g.clear();
  g.fillStyle(0x555555, 1);
  g.fillRect(0, 26, 32, 6);
  g.fillStyle(0x333333, 1);
  g.fillRect(0, 30, 32, 2);
  g.fillStyle(0xd64545, 1);
  g.fillTriangle(0, 32, 8, 6, 16, 32);
  g.fillTriangle(16, 32, 24, 6, 32, 32);
  g.fillStyle(0xf17d7d, 1);
  g.fillTriangle(4, 30, 8, 10, 10, 30);
  g.fillTriangle(20, 30, 24, 10, 26, 30);
  g.generateTexture('spike', 32, 32);

  // ---- Checkpoint flag: down (not reached) ----
  g.clear();
  g.fillStyle(0x9a9a9a, 1);
  g.fillRect(6, 0, 4, 64);
  g.fillStyle(0xc4c4c4, 1);
  g.fillRect(6, 0, 2, 64);
  g.fillStyle(0xb0b0b0, 1);
  g.fillTriangle(10, 6, 40, 16, 10, 26);
  g.generateTexture('flagDown', 44, 64);

  // ---- Checkpoint flag: up (reached, w/ shading) ----
  g.clear();
  g.fillStyle(0x555555, 1);
  g.fillRect(6, 0, 4, 64);
  g.fillStyle(0x777777, 1);
  g.fillRect(6, 0, 2, 64);
  g.fillStyle(0x3fbf5f, 1);
  g.fillTriangle(10, 6, 40, 16, 10, 26);
  g.fillStyle(0x6fe089, 1);
  g.fillTriangle(10, 6, 24, 11, 10, 16);
  g.generateTexture('flagUp', 44, 64);

  // ---- Goal (checkered finish flag on a pole) ----
  g.clear();
  g.fillStyle(0x555555, 1);
  g.fillRect(6, 0, 5, 100);
  g.fillStyle(0x888888, 1);
  g.fillRect(6, 0, 2, 100);
  const cell = 8;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const isDark = (row + col) % 2 === 0;
      g.fillStyle(isDark ? 0x222222 : 0xffffff, 1);
      g.fillRect(11 + col * cell, row * cell, cell, cell);
    }
  }
  g.generateTexture('goal', 52, 100);

  // ---- HP heart (filled + empty, w/ shine) ----
  g.clear();
  g.fillStyle(0xe0455f, 1);
  g.fillCircle(7, 8, 7);
  g.fillCircle(17, 8, 7);
  g.fillTriangle(1, 11, 12, 24, 23, 11);
  g.fillStyle(0xff98a8, 1);
  g.fillCircle(5, 6, 2);
  g.generateTexture('heartFull', 24, 24);

  g.clear();
  g.fillStyle(0x444444, 1);
  g.fillCircle(7, 8, 7);
  g.fillCircle(17, 8, 7);
  g.fillTriangle(1, 11, 12, 24, 23, 11);
  g.generateTexture('heartEmpty', 24, 24);

  // ---- Butterfly (simple two-wing shape, tinted per-instance) ----
  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillEllipse(6, 7, 10, 7);
  g.fillEllipse(18, 7, 10, 7);
  g.fillEllipse(7, 14, 7, 5);
  g.fillEllipse(17, 14, 7, 5);
  g.fillStyle(0x333333, 1);
  g.fillRect(11, 4, 2, 14);
  g.generateTexture('butterfly', 24, 20);

  // ---- Bird silhouette (simple "M" wing shape) ----
  g.clear();
  g.fillStyle(0x33363f, 1);
  g.fillTriangle(0, 10, 12, 0, 12, 10);
  g.fillTriangle(12, 10, 12, 0, 24, 10);
  g.generateTexture('bird', 24, 12);

  // ---- Flower cluster (bright petals for ground decoration) ----
  g.clear();
  g.fillStyle(0x4a9350, 1);
  g.fillRect(9, 10, 3, 10);
  g.fillStyle(0xff6f9c, 1);
  g.fillCircle(6, 6, 5);
  g.fillCircle(16, 6, 5);
  g.fillCircle(11, 2, 5);
  g.fillCircle(11, 10, 5);
  g.fillStyle(0xffe14a, 1);
  g.fillCircle(11, 6, 4);
  g.generateTexture('flower', 22, 20);

  // ---- Bush (rounded leafy clump for ground decoration) ----
  g.clear();
  g.fillStyle(0x3f7d43, 1);
  g.fillCircle(14, 20, 16);
  g.fillCircle(30, 16, 18);
  g.fillCircle(46, 20, 16);
  g.fillStyle(0x5cab5f, 1);
  g.fillCircle(14, 16, 11);
  g.fillCircle(30, 12, 13);
  g.fillCircle(46, 16, 11);
  g.generateTexture('bush', 60, 36);

  // ---- Particle: spark (coin / checkpoint bursts) ----
  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillTriangle(5, 0, 10, 5, 5, 10);
  g.fillTriangle(5, 0, 0, 5, 5, 10);
  g.generateTexture('particleSpark', 10, 10);

  // ---- Particle: dust (run/land/pit puffs) ----
  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(5, 5, 5);
  g.generateTexture('particleDust', 10, 10);

  // ---- Particle: confetti (victory) ----
  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 7, 12);
  g.generateTexture('particleConfetti', 7, 12);

  g.destroy();
}

/**
 * Builds the cat's idle/run/jump/fall animations from the uploaded sprite
 * sheets. Runs once per game instance (guarded by anims.exists).
 * All four sheets are 32x32 per-frame, and the source art faces LEFT by
 * default, so GameplayScene flips the sprite (setFlipX) when facing right.
 */
function createCatAnimations(scene) {
  if (scene.anims.exists('cat-idle')) return;

  scene.anims.create({
    key: 'cat-idle',
    frames: scene.anims.generateFrameNumbers('cat_idle', { start: 0, end: 7 }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'cat-run',
    frames: scene.anims.generateFrameNumbers('cat_run', { start: 0, end: 9 }),
    frameRate: 14,
    repeat: -1
  });

  scene.anims.create({
    key: 'cat-jump',
    frames: scene.anims.generateFrameNumbers('cat_jump', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0
  });

  scene.anims.create({
    key: 'cat-fall',
    frames: scene.anims.generateFrameNumbers('cat_fall', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
}