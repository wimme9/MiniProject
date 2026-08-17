export class VitoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VitoryScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.isWin = data.isWin ?? true;
    }

    create(data) {
        const { width, height } = this.scale;

        // พื้นหลังฉากจบเกม
        this.add.rectangle(width / 2, height / 2, width, height, 0x111827);

        // หัวข้อ (ชนะ หรือ แพ้)
        const titleText = data.isWin ? '🎉 YOU WIN! 🎉' : '💥 GAME OVER 💥';
        this.add.text(width / 2, height * 0.25, titleText, {
            fontSize: '48px',
            fill: data.isWin ? '#10b981' : '#ef4444',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // คะแนนรอบนี้
        this.add.text(width / 2, height * 0.40, `คะแนนที่ทำได้: ${data.score}`, {
            fontSize: '28px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // ดึงสถิติคะแนนรอบก่อนหน้ามาแสดงเปรียบเทียบ
        const lastScore = localStorage.getItem('dropping_last_score') || 0;
        this.add.text(width / 2, height * 0.48, `🏆 สถิติรอบก่อน: ${lastScore} คะแนน`, {
            fontSize: '20px',
            fill: '#fbbf24'
        }).setOrigin(0.5);

        // ปุ่มเล่นอีกครั้ง (Play Again)
        const restartBtn = this.add.rectangle(width / 2, height * 0.62, 260, 50, 0x10b981)
            .setInteractive();
        this.add.text(width / 2, height * 0.62, 'PLAY AGAIN', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        restartBtn.on('pointerover', () => restartBtn.setFillStyle(0x059669));
        restartBtn.on('pointerout', () => restartBtn.setFillStyle(0x10b981));
        restartBtn.on('pointerdown', () => this.scene.start('GameplayScene'));

        // ปุ่มกลับหน้าหลัก (Main Menu)
        const homeBtn = this.add.rectangle(width / 2, height * 0.72, 260, 50, 0x374151)
            .setInteractive();
        this.add.text(width / 2, height * 0.72, 'MAIN MENU', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        homeBtn.on('pointerover', () => homeBtn.setFillStyle(0x4b5563));
        homeBtn.on('pointerout', () => homeBtn.setFillStyle(0x374151));
        homeBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}