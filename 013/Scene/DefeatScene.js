export default class DefeatScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DefeatScene' });
    }

    init(data) {
        this.finalScore = data.finalScore || 0;
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x050714, 0.9);

        const starGfx = this.add.graphics();
        starGfx.fillStyle(0xa5f3fc, 1);
        starGfx.fillCircle(2, 2, 2);
        starGfx.generateTexture('moondust_defeat', 4, 4);
        starGfx.destroy();

        this.add.particles(640, 0, 'moondust_defeat', {
            x: { min: 0, max: 1280 },
            speedY: { min: 30, max: 150 },
            speedX: { min: -20, max: 20 },
            scale: { start: 0.4, end: 1.2 },
            alpha: { start: 0.1, end: 0.6 },
            tint: [0xff758f, 0xef4444, 0x7209b7, 0x38bdf8],
            lifespan: 6000,
            quantity: 2
        });

        const panelContainer = this.add.container(640, 360);

        const panel = this.add.graphics();
        panel.fillStyle(0x0a0f25, 0.95);
        panel.fillRoundedRect(-250, -200, 500, 400, 20);
        panel.lineStyle(3, 0x7209b7, 0.9);
        panel.strokeRoundedRect(-250, -200, 500, 400, 20);

        const panelGlow = this.add.graphics();
        panelGlow.lineStyle(1, 0xef4444, 0.7);
        panelGlow.strokeRoundedRect(-246, -196, 492, 392, 16);

        panelContainer.add([panel, panelGlow]);

        panelContainer.setScale(0.8);
        panelContainer.setAlpha(0);
        this.tweens.add({
            targets: panelContainer,
            scale: 1,
            alpha: 1,
            duration: 500,
            ease: 'Back.out'
        });

        const titleText = this.add.text(640, 215, '💀 GAME OVER 💀', {
            fontSize: '44px',
            fill: '#ef4444',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: titleText,
            scale: { from: 1, to: 1.05 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(640, 290, `SCORE: ${this.finalScore}`, {
            fontSize: '32px',
            fill: '#f8fafc',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.createButton(640, 390, 'TRY AGAIN', 0x7f1d1d, 0xef4444, () => {
            this.scene.start('GameplayScene');
        });

        this.createButton(640, 465, 'MAIN MENU', 0x0f172a, 0x38bdf8, () => {
            this.scene.start('MenuScene');
        });
    }

    createButton(x, y, label, baseColor, strokeColor, callback) {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(baseColor, 1);
        bg.fillRoundedRect(-140, -25, 280, 50, 12);
        bg.lineStyle(2, strokeColor, 0.8);
        bg.strokeRoundedRect(-140, -25, 280, 50, 12);

        const txt = this.add.text(0, 0, label, {
            fontSize: '18px', fill: '#ffffff', fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        container.add([bg, txt]);
        container.setSize(280, 50);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scale: 1.06,
                duration: 150,
                ease: 'Power1'
            });
            bg.clear();
            bg.fillStyle(strokeColor, 1);
            bg.fillRoundedRect(-140, -25, 280, 50, 12);
            bg.lineStyle(2, 0xffffff, 1);
            bg.strokeRoundedRect(-140, -25, 280, 50, 12);
            txt.setFill('#050714');
        });

        container.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scale: 1.0,
                duration: 150,
                ease: 'Power1'
            });
            bg.clear();
            bg.fillStyle(baseColor, 1);
            bg.fillRoundedRect(-140, -25, 280, 50, 12);
            bg.lineStyle(2, strokeColor, 0.8);
            bg.strokeRoundedRect(-140, -25, 280, 50, 12);
            txt.setFill('#ffffff');
        });

        container.on('pointerdown', callback);
    }
}