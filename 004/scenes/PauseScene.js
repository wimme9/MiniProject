export class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        const { width, height } = this.scale;

        // พื้นหลังโปร่งแสงมืดลง
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

        // กล่องเมนูตรงกลาง
        const menuBox = this.add.rectangle(width / 2, height / 2, 450, 350, 0x1f2937, 0.95)
            .setStrokeStyle(3, 0x374151);

        this.add.text(width / 2, height * 0.38, '⏸ GAME PAUSED', {
            fontSize: '36px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // ปุ่มเล่นต่อ (Resume)
        const resumeBtn = this.add.rectangle(width / 2, height * 0.48, 300, 50, 0x10b981)
            .setInteractive();
        const resumeText = this.add.text(width / 2, height * 0.48, 'RESUME GAME', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        resumeBtn.on('pointerover', () => resumeBtn.setFillStyle(0x059669));
        resumeBtn.on('pointerout', () => resumeBtn.setFillStyle(0x10b981));
        resumeBtn.on('pointerdown', () => {
            this.scene.resume('GameplayScene');
            this.scene.stop();
        });

        // ปุ่มกลับหน้าหลัก (Main Menu)
        const homeBtn = this.add.rectangle(width / 2, height * 0.59, 300, 50, 0xef4444)
            .setInteractive();
        const homeText = this.add.text(width / 2, height * 0.59, 'MAIN MENU', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        homeBtn.on('pointerover', () => homeBtn.setFillStyle(0xdc2626));
        homeBtn.on('pointerout', () => homeBtn.setFillStyle(0xef4444));
        homeBtn.on('pointerdown', () => {
            this.scene.stop('GameplayScene');
            this.scene.start('MenuScene');
        });
    }
}