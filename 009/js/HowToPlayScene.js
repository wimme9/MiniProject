export default class HowToPlayScene extends Phaser.Scene {
    constructor() {
        super('HowToPlayScene');
    }

    preload() {
        this.load.image('how_to_play', 'img/HowToPlay.png');
    }

    create() {
        // พื้นหลังสีดำ อยู่นอก Container เพื่อให้คลุมจอตลอดเวลา
        this.add.rectangle(0, 0, 800, 600, 0x111111).setOrigin(0);

        // 🌟 สร้าง Container ไว้ตรงกลางจอ (400, 300)
        let uiContainer = this.add.container(400, 300);

        // ใส่รูปและข้อความลงใน Container (พิกัด X, Y ต้องอิงจากจุดกึ่งกลาง Container)
        let bgImage = this.add.image(0, 20, 'how_to_play').setScale(0.5);

        const howToText = 
            "[ W, A, S, D ] : บังคับทิศทางตัวละคร\n" +
            "[ คลิกเมาส์ซ้าย ] : โจมตี / ยิงปืน\n" +
            "[ เลื่อนลูกกลิ้งเมาส์ ] : สลับอาวุธที่ปลดล็อกแล้ว\n" +
            "[ R ] : รีโหลดกระสุน\n" +
            "[ TAB ] : เปิดหน้าตั้งค่าเกม\n" +
            "--- ระบบเอาชีวิตรอด ---\n" +
            "💸 ฆ่าซอมบี้เพื่อดรอปเงินและไอเทม\n" +
            "⬆️ เมื่อหลอด EXP (เงิน) เต็ม จะสามารถเลือกสกิลได้\n" +
            "🚁 กดปุ่ม [ H ] เพื่อเรียกเฮลิคอปเตอร์มารับ (จบเกม)\n" +
            "ยืนในวงกลมเพื่อ Extraction ระวังอย่าเดินออก!";

        let textObj = this.add.text(0, 10, howToText, {
            fontSize: '18px', fill: '#ffffff', fontStyle: 'bold', 
            align: 'center', stroke: '#000000', strokeThickness: 4,
            lineSpacing: 10
        }).setOrigin(0.5);

        // 🔘 ปุ่มกลับหน้าเมนู
        let btnBack = this.add.text(-10, 200, 'กลับไปหน้าหลัก', {
            fontSize: '18px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        btnBack.on('pointerover', () => { btnBack.setScale(1.2); btnBack.setTint(0x00ff00); });
        btnBack.on('pointerout', () => { btnBack.setScale(1.0); btnBack.clearTint(); });
        
        // 🌟 แอนิเมชันตอนปิด (กดปุ่มแล้วหดลงก่อน ค่อยเปลี่ยน Scene)
        btnBack.on('pointerdown', () => {
            this.tweens.add({
                targets: uiContainer,
                scale: 0,
                duration: 400,
                ease: 'Back.easeIn', // ค่อยๆ หดลงแล้วหายไป
                onComplete: () => {
                    this.scene.start('MenuScene');
                }
            });
        });

        // นำทุกอย่างยัดใส่ Container
        uiContainer.add([bgImage, textObj, btnBack]);

        // 🌟 แอนิเมชันตอนเปิดหน้าจอ (เริ่มที่สเกล 0 แล้วเด้งขยายเป็น 1)
        uiContainer.setScale(0);
        this.tweens.add({
            targets: uiContainer,
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut' // เด้งดึ๋งตอนจบ
        });
    }
}