export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        // --- 1. Dim Overlay Background (ธีม Moon Gate) ---
        this.add.rectangle(640, 360, 1280, 720, 0x050714, 0.82);

        // --- 2. Panel Window (กล่องเมนูหยุดเกมสไตล์ไซไฟ) ---
        const panel = this.add.graphics();
        panel.fillStyle(0x0a0f25, 0.95);
        panel.fillRoundedRect(440, 140, 400, 440, 20);
        panel.lineStyle(3, 0x7209b7, 0.9);
        panel.strokeRoundedRect(440, 140, 400, 440, 20);

        // เส้นเรืองแสงชั้นในเพิ่มมิติ
        const panelGlow = this.add.graphics();
        panelGlow.lineStyle(1, 0x4cc9f0, 0.6);
        panelGlow.strokeRoundedRect(444, 144, 392, 432, 16);

        // --- 3. หัวข้อ PAUSED ---
        this.add.text(640, 205, 'GAME PAUSED', {
            fontSize: '36px',
            fill: '#4cc9f0',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // --- 4. ปุ่มเมนูต่างๆ (ปรับโทนสีเข้ากับ Moon Gate) ---
        // 1. Resume Button (โทนฟ้า-ม่วงนีออน)
        this.createButton(640, 290, 'RESUME', 0x3a0ca3, 0x4cc9f0, () => this.resumeGame());

        // 2. Restart Button (โทนชมพู-แดงนีออน)
        this.createButton(640, 370, 'RESTART', 0x7209b7, 0xff758f, () => {
            this.scene.stop('GameplayScene');
            this.scene.start('GameplayScene');
        });

        // 3. Main Menu Button (โทนน้ำเงินเข้ม-เทาไซไฟ)
        this.createButton(640, 450, 'MAIN MENU', 0x0f172a, 0x38bdf8, () => {
            this.scene.stop('GameplayScene');
            this.scene.start('MenuScene');
        });

        this.input.keyboard.on('keydown-P', this.resumeGame, this);
        this.input.keyboard.on('keydown-ESC', this.resumeGame, this);
    }

    createButton(x, y, label, baseColor, strokeColor, callback) {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(baseColor, 1);
        bg.fillRoundedRect(-120, -22, 240, 44, 10);
        bg.lineStyle(2, strokeColor, 0.8);
        bg.strokeRoundedRect(-120, -22, 240, 44, 10);

        const txt = this.add.text(0, 0, label, {
            fontSize: '18px', 
            fill: '#ffffff', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        container.add([bg, txt]);
        container.setSize(240, 44);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            container.setScale(1.05);
            bg.clear();
            bg.fillStyle(strokeColor, 1);
            bg.fillRoundedRect(-120, -22, 240, 44, 10);
            bg.lineStyle(2, 0xffffff, 1);
            bg.strokeRoundedRect(-120, -22, 240, 44, 10);
            txt.setFill('#050714');
        });

        container.on('pointerout', () => {
            container.setScale(1.0);
            bg.clear();
            bg.fillStyle(baseColor, 1);
            bg.fillRoundedRect(-120, -22, 240, 44, 10);
            bg.lineStyle(2, strokeColor, 0.8);
            bg.strokeRoundedRect(-120, -22, 240, 44, 10);
            txt.setFill('#ffffff');
        });

        container.on('pointerdown', callback);
    }

    resumeGame() {
        this.scene.stop();
        this.scene.resume('GameplayScene');
    }
}