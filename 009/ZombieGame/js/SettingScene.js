export default class SettingScene extends Phaser.Scene {
    constructor() {
        super('SettingScene');
    }

    init(data) {
        // รับค่าหน้า Gameplay มา เพื่อจะได้สั่งให้มันกลับมาเดินต่อได้
        this.gameplay = data.gameplay;
    }

    create() {
        this.input.setDefaultCursor('default'); // โชว์เมาส์ปกติ

        // ฉากหลังดำโปร่งแสง
        this.darkScreen = this.add.graphics();
        this.darkScreen.fillStyle(0x000000, 0.7);
        this.darkScreen.fillRect(0, 0, 800, 600);

        // 🌟 เพิ่มเอฟเฟกต์ให้พื้นหลังค่อยๆ มืดลง (Fade in)
        this.darkScreen.setAlpha(0);
        this.tweens.add({ targets: this.darkScreen, alpha: 1, duration: 300 });

        // สร้าง Container จับมัด UI รวมกัน
        this.uiContainer = this.add.container(400, 300);

        // โหลดรูปแผงควบคุม
        let settingBg = this.add.image(0, 0, 'setting_bg').setScale(0.5);
        this.uiContainer.add(settingBg);

        // 🔘 ปุ่ม: เล่นต่อ
        let btnResume = this.add.text(0, -80, 'เล่นต่อ', {
            fontSize: '40px', fill: '#000000', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        // 🔘 ปุ่ม: กลับเมนู
        let btnMenu = this.add.text(0, 60, 'กลับไปหน้าเมนู', {
            fontSize: '40px', fill: '#000000', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        [btnResume, btnMenu].forEach(btn => {
            btn.on('pointerover', () => { btn.setScale(1.2); btn.setTint(0xffffff); });
            btn.on('pointerout', () => { btn.setScale(1.0); btn.clearTint(); });
        });

        btnResume.on('pointerdown', () => { this.resumeGame(); });

        btnMenu.on('pointerdown', () => {
            this.scene.stop('SettingScene'); // ปิดหน้านี้
            this.gameplay.scene.stop(); // ปิดหน้าเล่นเกม
            this.scene.start('MenuScene'); // กลับเมนูหลัก
        });

        this.uiContainer.add([btnResume, btnMenu]);

        // ==========================================
        // 🌟 พระเอกของเรา: แอนิเมชันเด้งดึ๋งตอนเปิด!
        // ==========================================
        this.uiContainer.setScale(0); // ตั้งค่าเริ่มต้นให้มองไม่เห็น (ย่อเหลือ 0)
        this.tweens.add({
            targets: this.uiContainer,
            scale: 1,                 // ขยายขึ้นมาเป็นขนาด 100%
            duration: 500,            // ความเร็ว 0.5 วินาที
            ease: 'Back.easeOut'      // คำสั่งนี้คือเคล็ดลับที่ทำให้มัน "เด้งดึ๋ง" เลยขนาดจริงแล้วหดกลับมาพอดีเป๊ะ!
        });

        // ถ้ายกเลิกด้วยการกด TAB อีกรอบ ก็ให้เล่นต่อได้เหมือนกัน
        this.input.keyboard.on('keydown-TAB', () => {
            this.resumeGame();
        });
    }

    resumeGame() {
        // ==========================================
        // 🌟 ตอนปิด ก็ให้หดตัวกลับแบบสมูทๆ ก่อนเล่นเกมต่อ
        // ==========================================
        this.tweens.add({
            targets: this.uiContainer,
            scale: 0,                 // หดกลับไปเหลือ 0
            duration: 300,
            ease: 'Back.easeIn',      // หดกลับแบบมีแรงสปริง
            onComplete: () => {       // พอหดเสร็จปุ๊บ ค่อยสั่งปิดฉากและให้เกมเดินต่อ
                this.scene.stop(); 
                this.gameplay.scene.resume(); 
                this.gameplay.input.setDefaultCursor('none'); 
                if (this.gameplay.crosshair) this.gameplay.crosshair.setVisible(true); 
            }
        });
        
        // ให้ฉากหลังสีดำค่อยๆ สว่างขึ้นพร้อมๆ กับที่กรอบเด้งลง
        this.tweens.add({ targets: this.darkScreen, alpha: 0, duration: 300 });
    }
}