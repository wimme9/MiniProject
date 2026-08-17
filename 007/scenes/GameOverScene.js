// scenes/GameOverScene.js
// Shown when HP reaches 0 or the timer runs out.

class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.result = data;
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.cameras.main.shake(220, 0.006);
    SFX.stopMusic();
    SFX.gameOver();

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a, 1);

    const title = this.add.text(width / 2, height * 0.25 - 30, 'GAME OVER', {
      fontFamily: 'Arial Black, Arial', fontSize: '52px', color: '#e0455f',
      stroke: '#3a0d14', strokeThickness: 8
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title, y: height * 0.25, alpha: 1, duration: 450, ease: 'Bounce.easeOut'
    });

    const reasonText = this.result.reason === 'time' ? "Time's up!" : 'Out of HP!';

    const reason = this.add.text(width / 2, height * 0.38, reasonText, {
      fontFamily: 'Arial', fontSize: '20px', color: '#ffcccc'
    }).setOrigin(0.5).setAlpha(0);

    const lines = [
      'Score: ' + this.result.score,
      'Coins collected: ' + this.result.coinsCollected,
      'Time left: ' + this.result.timeLeft + 's'
    ];

    const info = this.add.text(width / 2, height * 0.55, lines.join('\n'), {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff',
      align: 'center', lineSpacing: 10
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [reason, info], alpha: 1, duration: 400, delay: 350 });

    this.makeButton(width / 2, height * 0.75, 'REPLAY', 'green', () => {
      this.scene.start('GameplayScene');
    });
    this.makeButton(width / 2, height * 0.87, 'MENU', 'blue', () => {
      this.scene.start('MenuScene');
    });
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

  makeButton(x, y, label, scheme, onClick, w = 220, h = 48) {
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