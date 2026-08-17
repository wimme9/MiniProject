// scenes/VictoryScene.js
// Shown when the player reaches the Goal before time runs out.

class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  init(data) {
    this.result = data;
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(300, 0, 0, 0);

    this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height);
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35);

    this.launchConfetti(width, height);
    SFX.stopMusic();
    SFX.victory();

    const title = this.add.text(width / 2, height * 0.25, 'YOU WIN!', {
      fontFamily: 'Arial Black, Arial', fontSize: '52px', color: '#ffe14a',
      stroke: '#5a3d00', strokeThickness: 8
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 500, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: title, angle: { from: -3, to: 3 }, duration: 900, delay: 500,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    const scoreLine = this.add.text(width / 2, height * 0.44, 'Score: 0', {
      fontFamily: 'Arial', fontSize: '24px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    const detailLines = [
      'Coins collected: ' + this.result.coinsCollected,
      'Time left: ' + this.result.timeLeft + 's'
    ];
    const details = this.add.text(width / 2, height * 0.53, detailLines.join('\n'), {
      fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
      align: 'center', lineSpacing: 8,
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0);

    // Animated score count-up
    const counter = { val: 0 };
    this.tweens.add({
      targets: counter, val: this.result.score, duration: 900, delay: 200, ease: 'Cubic.easeOut',
      onUpdate: () => scoreLine.setText('Score: ' + Math.floor(counter.val)),
      onComplete: () => this.tweens.add({ targets: scoreLine, scale: 1.15, duration: 120, yoyo: true })
    });

    this.tweens.add({ targets: details, alpha: 1, duration: 400, delay: 800 });

    this.makeButton(width / 2, height * 0.72, 'REPLAY', 'green', () => {
      this.scene.start('GameplayScene');
    });
    this.makeButton(width / 2, height * 0.84, 'MENU', 'blue', () => {
      this.scene.start('MenuScene');
    });
  }

  launchConfetti(width, height) {
    const emitter = this.add.particles(width / 2, -20, 'particleConfetti', {
      x: { min: -120, max: 120 },
      y: -20,
      speedY: { min: 300, max: 300 },
      speedX: { min: -40, max: 40 },
      rotate: { min: 0, max: 360 },
      scale: { min: 0.7, max: 1.2 },
      lifespan: 2600,
      quantity: 3,
      frequency: 60,
      tint: [0xffe14a, 0xff5252, 0x4d8fe0, 0x5cb85c, 0xffffff, 0xffb347]
    });
    this.time.delayedCall(2200, () => emitter.stop());
    this.time.delayedCall(5000, () => emitter.destroy());
  }

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

  makeButton(x, y, label, scheme, onClick, w = 220, h = 50) {
    const p = this.buttonPalette(scheme);
    const container = this.add.container(x, y);
    const radius = h / 2.4;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x1a3d22, 0.22);
    shadow.fillRoundedRect(-w / 2 + 2, -h / 2 + 6, w, h, radius);

    const body = this.add.graphics();
    body.fillStyle(p.dark, 1);
    body.fillRoundedRect(-w / 2, -h / 2 + 3, w, h, radius);
    body.fillStyle(p.base, 1);
    body.fillRoundedRect(-w / 2, -h / 2, w, h - 5, radius);
    body.lineStyle(3, p.edge, 1);
    body.strokeRoundedRect(-w / 2, -h / 2, w, h - 5, radius);
    body.fillStyle(0xffffff, 0.4);
    body.fillRoundedRect(-w / 2 + w * 0.08, -h / 2 + h * 0.1, w * 0.84, h * 0.3, radius * 0.8);

    const txt = this.add.text(0, -2, label, {
      fontFamily: 'Arial Black, Arial', fontSize: '18px', color: '#ffffff',
      stroke: this.hexStr(p.dark), strokeThickness: 4
    }).setOrigin(0.5);

    container.add([shadow, body, txt]);
    container.setSize(w, h + 6);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.06, duration: 100 });
      SFX.hover();
    });
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });
    container.on('pointerdown', () => {
      SFX.click();
      this.tweens.add({
        targets: container, scale: 0.9, duration: 60, yoyo: true,
        onComplete: () => onClick()
      });
    });
  }
}