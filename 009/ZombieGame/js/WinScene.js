export default class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
    }

    preload() {
        // โหลดรูปแผ่นป้ายชนะของคุณ
        this.load.image('win_bg', 'img/win_bg.png'); 
    }

    create() {
        // 🌟 แก้บัคเมาส์หาย: สั่งให้เมาส์ปกติกลับมาแสดงบนหน้าจอ
        this.input.setDefaultCursor('default');

        // ฉากหลังดำมืดโปร่งแสง (เพื่อให้เห็นเกมเพลย์ลางๆ)
        let darkScreen = this.add.graphics();
        darkScreen.fillStyle(0x000000, 0.7);
        darkScreen.fillRect(0, 0, 800, 600);

        let uiContainer = this.add.container(400, 300);

        // โหลดรูปแผ่นป้าย และย่อ Scale เป็น 0.4 ให้เท่ากับหน้า GameOver
        let uiBg = this.add.image(0, 0, 'win_bg').setScale(0.4);
        uiContainer.add(uiBg);

        // ==========================================
        // 🏆 ข้อความชนะ + แอนิเมชันเต้นตุบๆ
        // ==========================================
        let winText = this.add.text(0, -70, 'ชัยชนะ!', {
            fontSize: '40px', fill: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5);
        uiContainer.add(winText);

        // แอนิเมชันตัวหนังสือขยับ (ขยาย 15%)
        this.tweens.add({
            targets: winText,
            scale: 1.15,          
            duration: 800,        
            yoyo: true,           
            repeat: -1,           
            ease: 'Sine.easeInOut'
        });

        // ==========================================
        // 🔘 ปุ่มกด 2 อัน (จัดตำแหน่งให้อยู่ในกรอบดำพอดี)
        // ==========================================
        let btnRestart = this.add.text( -110, 45, 'เริ่มใหม่', {
            fontSize: '24px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        let btnMenu = this.add.text(100, 45, 'กลับไปเมนู', {
            fontSize: '24px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        // เอฟเฟกต์เวลาเอาเมาส์ชี้ปุ่ม (เปลี่ยนเป็นสีเขียวเพื่อให้เข้ากับธีมชนะ)
        [btnRestart, btnMenu].forEach(btn => {
            btn.on('pointerover', () => { btn.setScale(1.2); btn.setTint(0x00ff00); });
            btn.on('pointerout', () => { btn.setScale(1.0); btn.clearTint(); });
        });

        // กดปุ่ม เริ่มใหม่
        btnRestart.on('pointerdown', () => {
            this.scene.stop('WinScene');
            this.scene.start('GameplayScene');
        });

        // กดปุ่ม กลับไปเมนู
        btnMenu.on('pointerdown', () => {
            this.scene.stop('WinScene');
            this.scene.stop('GameplayScene');
            this.scene.start('MenuScene');
        });

        uiContainer.add([btnRestart, btnMenu]);

        // แอนิเมชันหน้าต่างเด้งดึ๋งตอนเปิด
        uiContainer.setScale(0);
        this.tweens.add({
            targets: uiContainer, scale: 1, duration: 600, ease: 'Back.easeOut'
        });
    }
}