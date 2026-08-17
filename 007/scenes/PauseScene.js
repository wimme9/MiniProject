// scenes/PauseScene.js
// Pause menu, launched on top of a paused GameplayScene.

class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  init(data) {
    this.gameplayKey = data.gameplayKey || 'GameplayScene';
  }

  create() {
    const { width, height } = this.scale;

    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x1a2e3d, 0).setDepth(0);
    this.tweens.add({ targets: dim, fillAlpha: 0.45, duration: 200 });

    const panelGroup = this.add.container(width / 2, height / 2).setScale(0.8).setAlpha(0);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillRoundedRect(-160 + 4, -130 + 8, 320, 280, 26);

    const panel = this.add.graphics();
    panel.fillStyle(0xfff6e0, 1);
    panel.fillRoundedRect(-160, -130, 320, 280, 26);
    panel.lineStyle(5, 0xffb347, 1);
    panel.strokeRoundedRect(-160, -130, 320, 280, 26);

    const title = this.add.text(0, -90, 'PAUSED', {
      fontFamily: 'Arial Black, Arial', fontSize: '28px', color: '#5a7d4a',
      stroke: '#ffffff', strokeThickness: 4
    }).setOrigin(0.5);
    panelGroup.add([shadow, panel, title]);

    this.tweens.add({ targets: panelGroup, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' });

    this.makeButton(width / 2, height / 2 - 20, 'RESUME', 'green', () => this.resume());
    this.makeButton(width / 2, height / 2 + 40, 'RESTART', 'yellow', () => this.restart());
    this.makeButton(width / 2, height / 2 + 100, 'MENU', 'pink', () => this.toMenu());

    this.input.keyboard.once('keydown-ESC', () => this.resume());
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

  resume() {
    this.scene.stop();
    this.scene.resume(this.gameplayKey);
  }

  restart() {
    this.scene.stop(this.gameplayKey);
    this.scene.stop();
    this.scene.start('GameplayScene');
  }

  toMenu() {
    this.scene.stop(this.gameplayKey);
    this.scene.stop();
    this.scene.start('MenuScene');
  }
}