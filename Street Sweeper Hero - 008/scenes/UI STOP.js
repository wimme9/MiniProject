class UISTOP extends Phaser.Scene {
    constructor() {
        super('UISTOP'); // ตั้งชื่อ Key ให้ตรงกัน
    }

    create() {
        // 1. สร้างพื้นหลังสีดำกึ่งโปร่งใส (เพื่อให้ยังพอมองเห็นเกมข้างหลัง)
        let graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.7); 
        graphics.fillRect(0, 0, 400, 600);

        // 2. ข้อความ PAUSED
        this.add.text(200, 200, 'PAUSED', {
            fontSize: '50px',
            fill: '#ffffff',
            fontFamily: 'Impact, Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // 3. สร้างปุ่ม RESUME (เล่นต่อ)
        let resumeBtn = this.add.text(200, 350, 'RESUME', {
            fontSize: '30px',
            fill: '#00ffcc',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#222222',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // 4. ทำให้ปุ่มกดได้
        resumeBtn.setInteractive({ useHandCursor: true });

        resumeBtn.on('pointerover', () => {
            resumeBtn.setTint(0xffffff);
        });

        resumeBtn.on('pointerout', () => {
            resumeBtn.clearTint();
        });

        // 🌟 ไฮไลท์: พอกดปุ่มปุ๊บ ให้กลับไปรันเกมต่อ และปิดฉากนี้ทิ้ง
        resumeBtn.on('pointerdown', () => {
            this.scene.resume('GamesScenes'); // สั่งให้ฉากเกมเดินต่อ
            this.scene.stop(); // สั่งหยุด (ปิด) ฉากเมนู Pause นี้ทิ้งไป
        });
    }
}