export default class SkillScene extends Phaser.Scene {
    constructor() {
        super('SkillScene');
    }

    init(data) {
        // รับข้อมูลมาจากหน้า Gameplay
        this.gameplay = data.gameplay;
        this.availableSkills = data.availableSkills;
    }

    create() {
        this.input.setDefaultCursor('default'); // เอาเมาส์ลูกศรปกติกลับมา

        let darkScreen = this.add.graphics();
        darkScreen.fillStyle(0x000000, 0.85);
        darkScreen.fillRect(0, 0, 800, 600);

        // 🌟 สร้าง Container ไว้กึ่งกลางจอ (เพื่อควบคุมแอนิเมชันเด้งทั้งหมดพร้อมกัน)
        this.uiContainer = this.add.container(400, 300);

        // ปรับตำแหน่ง Y เป็น -200 (เพราะจุดศูนย์กลางของ Container อยู่ที่ 300) = พิกัดจริงคือ Y: 100 เหมือนเดิม
        let titleText = this.add.text(0, -200, 'เลเวลอัปโปรดเลือกสกิล', { 
            fontSize: '40px', fill: '#ffff00', fontStyle: 'bold' 
        }).setOrigin(0.5);
        this.uiContainer.add(titleText);

        // 🌟 สร้างรูปภาพประกายแสง (Particle) เตรียมไว้ในระบบ
        if (!this.textures.exists('spark')) {
            let g = this.add.graphics();
            g.fillStyle(0xffffff, 1);
            g.fillCircle(4, 4, 4);
            g.generateTexture('spark', 8, 8);
            g.destroy();
        }

        // 🎲 สุ่มสกิล 3 อย่าง จากสกิลที่ยังไม่เคยถูกเลือก
        let shuffled = Phaser.Utils.Array.Shuffle([...this.availableSkills]); 
        let selectedSkills = shuffled.slice(0, 3); // ดึงมา 3 ใบ

        // 🎯 จัดตำแหน่งแกน X ให้อยู่ใน Container: -200, 0, 200 (พิกัดจริงบนจอคือ 200, 400, 600 เหมือนเดิม)
        let startX = -200; 
        let spacing = 200; 

        selectedSkills.forEach((skillId, index) => {
            let cardImage = 'skill_' + skillId;
            
            // 🎯 ปรับตำแหน่ง Y เป็น 20 (เพราะศูนย์กลางคือ 300 ดังนั้นจะได้ Y: 320 เหมือนเดิม)
            let card = this.add.image(startX + (index * spacing), 20, cardImage).setScale(0.35).setInteractive();
            this.uiContainer.add(card);
            
            // 🎯 เอฟเฟกต์เด้งตอนเอาเมาส์ชี้ ให้ใหญ่ขึ้นไปอีกเป็น 0.4
            card.on('pointerover', () => { card.setScale(0.4); card.setTint(0x00ff00); });
            card.on('pointerout', () => { card.setScale(0.35); card.clearTint(); });
            
            card.on('pointerdown', () => {
                // เรียกใช้ฟังก์ชันกดเลือกสกิล
                this.selectSkill(skillId, card);
            });
        });

        // ==========================================
        // 🌟 แอนิเมชันตอนเปิดหน้าจอ (เด้งขยายขึ้นมา)
        // ==========================================
        this.uiContainer.setScale(0); // เริ่มจากมองไม่เห็น
        this.tweens.add({
            targets: this.uiContainer,
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut' // เด้งดึ๋งตอนจบ
        });
    }

    // ฟังก์ชันจัดการตอนกดเลือกสกิล
    selectSkill(skillId, card) {
        // ปิดการรับคำสั่งชั่วคราว ป้องกันผู้เล่นกดรัวๆ
        this.input.enabled = false;

        // เปลี่ยนสีปุ่มที่โดนกดให้สว่างขึ้นและขยายขึ้นนิดนึง
        card.setTint(0xffaa00);
        card.setScale(0.45);

        // ==========================================
        // 🌟 สร้างเอฟเฟกต์ประกายแสงกระเด็นออกมารอบๆ การ์ด
        // ==========================================
        let emitter = this.add.particles(this.uiContainer.x + card.x, this.uiContainer.y + card.y, 'spark', {
            speed: { min: 200, max: 500 }, // ความเร็วกระเด็น
            angle: { min: 0, max: 360 }, // กระเด็นรอบทิศ
            scale: { start: 1.5, end: 0 }, // เล็กลงเรื่อยๆจนหายไป
            alpha: { start: 1, end: 0 }, // ค่อยๆ จาง
            lifespan: 800, // ระยะเวลา
            gravityY: 500, // ให้แสงมีน้ำหนักตกลงพื้นนิดๆ
            tint: [ 0xffff00, 0xffaa00, 0xffffff ], // สุ่ม 3 สี ทอง ส้ม ขาว
            emitting: false // ปิดไว้ก่อน เพื่อสั่งระเบิดตูมเดียว
        });
        
        // ยิงแสงออกไป 50 เม็ด!
        emitter.explode(50); 

        // ==========================================
        // 🌟 แอนิเมชันตอนปิดหน้าจอ (หดเล็กลง)
        // ==========================================
        this.tweens.add({
            targets: this.uiContainer,
            scale: 0,
            duration: 400,
            ease: 'Back.easeIn',
            delay: 400, // ดีเลย์ก่อนปิด 0.4 วินาที เพื่อให้เห็นเอฟเฟกต์แสงชัดๆ
            onComplete: () => {
                // ส่งสกิลที่เลือกกลับไปให้หน้า Gameplay
                this.gameplay.applySkill(skillId); 
                
                // ปิดหน้าต่างนี้ และให้เกมกลับมาเล่นต่อ
                this.scene.stop();
                this.gameplay.scene.resume();
                
                // คืนค่าลูกศรและปืนให้หน้าเกมเพลย์
                this.gameplay.input.setDefaultCursor('none'); 
                if (this.gameplay.crosshair) this.gameplay.crosshair.setVisible(true);
            }
        });
    }
}