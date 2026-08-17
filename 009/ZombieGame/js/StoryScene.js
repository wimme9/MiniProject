export default class StoryScene extends Phaser.Scene {
    constructor() {
        super('StoryScene');
    }

    preload() {
        this.load.image('story_bg', 'img/story_bg.png');
    }

    create() {
        // พื้นหลังสีดำกันขอบลอย
        this.add.rectangle(0, 0, 800, 600, 0x111111).setOrigin(0);

        // 🌟 สร้าง Container ไว้ตรงกลางจอ
        let uiContainer = this.add.container(400, 300);

        // ใส่รูปกรอบ UI
        let bgImage = this.add.image(0, 0, 'story_bg').setScale(0.5);

        // 📜 เนื้อเรื่องสุดระทึก!
        const storyText = 
            "ปี 2026... ไวรัสปริศนา 'Z-Virus' ได้แพร่ระบาด\n" +
            "เปลี่ยนผู้คนและสิ่งมีชีวิตบนเกาะศูนย์วิจัยให้กลายเป็น\n" +
            "อมนุษย์กระหายเลือดและบอสกลายพันธุ์ที่แข็งแกร่ง\n" +
            "คุณคือ 'เรเวน' (Raven) ทหารหน่วยรบพิเศษคนสุดท้าย\n" +
            "ที่รอดชีวิตจากการตกหล่นระหว่างภารกิจ\n" +
            "เป้าหมายเดียวของคุณคือ: เอาชีวิตรอดจากฝูงผีดิบ\n" +
            "รวบรวมทรัพยากร อัปเกรดอาวุธให้แข็งแกร่งที่สุด\n" +
            "และวิทยุเรียก 'เฮลิคอปเตอร์' มารับเพื่อหลบหนี!\n" +
            "จงจำไว้... ความตายไม่ใช่ทางเลือก!";

        let textObj = this.add.text(0, 0, storyText, {
            fontSize: '20px', fill: '#ffffff', fontStyle: 'bold', 
            align: 'center', stroke: '#000000', strokeThickness: 4,
            lineSpacing: 10
        }).setOrigin(0.5);

        // 🔘 ปุ่มกลับหน้าเมนู
        let btnBack = this.add.text(-10, 180, 'กลับไปหน้าหลัก', {
            fontSize: '18px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        btnBack.on('pointerover', () => { btnBack.setScale(1.2); btnBack.setTint(0x00ff00); });
        btnBack.on('pointerout', () => { btnBack.setScale(1.0); btnBack.clearTint(); });
        
        // 🌟 แอนิเมชันตอนปิด
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

        // 🌟 แอนิเมชันตอนเปิดหน้าจอ
        uiContainer.setScale(0);
        this.tweens.add({
            targets: uiContainer,
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut' // เด้งดึ๋งตอนจบ
        });
    }
}