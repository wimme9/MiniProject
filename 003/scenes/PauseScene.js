class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.65);

        this.add.text(400, 210, 'PAUSED', {
            fontSize: '52px',
            fontFamily: 'Sarabun, Tahoma, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(400, 260, 'เกมหยุดชั่วคราว', {
            fontSize: '20px',
            fontFamily: 'Sarabun, Tahoma, sans-serif',
            fill: '#0ff'
        }).setOrigin(0.5);

        this.createButton(400, 330, 'เล่นต่อ (Resume)', () => {
            this.resumeGame();
        });

        this.createButton(400, 400, 'กลับหน้าแรก (Main Menu)', () => {
            this.scene.stop('GameScene');
            this.scene.stop();
            this.scene.start('TitleScene');
        });

        this.add.text(400, 460, 'กด P หรือ ESC เพื่อเล่นต่อ', {
            fontSize: '16px',
            fontFamily: 'Sarabun, Tahoma, sans-serif',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-P', () => this.resumeGame());
        this.input.keyboard.once('keydown-ESC', () => this.resumeGame());
    }

    resumeGame() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.bgm) {
            gameScene.bgm.resume();
        }

        this.scene.stop();
        this.scene.resume('GameScene');
    }

    createButton(x, y, label, callback) {
        const btn = this.add.text(x, y, label, {
            fontSize: '22px',
            fontFamily: 'Sarabun, Tahoma, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            backgroundColor: '#1e88e5',
            padding: { x: 22, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setStyle({ fill: '#ffe600' }));
        btn.on('pointerout', () => btn.setStyle({ fill: '#ffffff' }));
        btn.on('pointerdown', callback);

        return btn;
    }
}