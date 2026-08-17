class UI_Screen extends Phaser.Scene {
    constructor() {
        super('UI_Screen'); 
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // --- สร้างพื้นหลังไล่สี ---
        let bg = this.add.graphics();
        bg.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x000000, 0x000000, 1);
        bg.fillRect(0, 0, 400, 600);

        // --- 2. ชื่อเกม (Title) ---
        let titleText = this.add.text(200, 150, 'STREET SWEEPER\nHERO', {
            fontSize: '38px',
            fill: '#ffd700', 
            fontFamily: 'Impact, Arial', 
            fontStyle: 'bold',
            align: 'center',
            stroke: '#ffffff',
            strokeThickness: 5,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: titleText,
            y: titleText.y - 15,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // --- 3. ปุ่มเริ่มเกม ---
        let startBtn = this.add.text(200, 350, '▶ เริ่มเกม', {
            fontSize: '28px', 
            fill: '#00ffcc', 
            fontFamily: 'Tahoma, Arial', 
            fontStyle: 'bold',
            backgroundColor: '#222222', 
            padding: { x: 20, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: startBtn,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // --- 4. ปุ่มวิธีการเล่น ---
        let helpBtn = this.add.text(200, 430, '❔ วิธีการเล่น', {
            fontSize: '22px', 
            fill: '#ffffff', 
            fontFamily: 'Tahoma, Arial', 
            fontStyle: 'bold',
            backgroundColor: '#333333', 
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // --- 5. สร้างหน้าต่างป๊อปอัป ---
        this.helpPanel = this.add.container(200, 300).setDepth(100);
        this.helpPanel.setAlpha(0); 
        this.helpPanel.setScale(0.5); 

        let panelBg = this.add.graphics();
        panelBg.fillStyle(0x1a1a1d, 1); 
        panelBg.lineStyle(4, 0xffd700, 1); 
        
        // 🌟 แก้ไข: ขยายกรอบให้กว้างและสูงขึ้น (เปลี่ยนจาก 320x360 เป็น 360x420)
        panelBg.fillRoundedRect(-180, -210, 360, 420, 16);
        panelBg.strokeRoundedRect(-180, -210, 360, 420, 16);

        // 🌟 แก้ไข: ขยับหัวข้อขึ้นไปที่ Y: -160
        let helpTitle = this.add.text(0, -160, 'วิธีการเล่น', { 
            fontSize: '28px', fill: '#ffd700', fontStyle: 'bold', fontFamily: 'Tahoma, Arial'
        }).setOrigin(0.5);

        // 🌟 แก้ไข: ตำแหน่งข้อความอธิบายปรับให้อยู่ตรงกลาง (Y: -10)
        let helpDesc = this.add.text(0, -10, '⌨️ ปุ่ม W A S D / ลูกศร\nเพื่อบังคับตัวละคร\n\n🗑️ เก็บขยะ (+10 คะแนน)\n🪙 เก็บเหรียญ (+20 คะแนน)\n\n🚗 ระวังโดนรถชน!\n(เลือดลด 20 หน่วย)', {
            fontSize: '20px', fill: '#ffffff', align: 'center', lineSpacing: 10, fontFamily: 'Tahoma, Arial'
        }).setOrigin(0.5);

        // 🌟 แก้ไข: ขยับปุ่มปิดลงมาที่ Y: 150
        let closeBtn = this.add.text(0, 150, 'ปิดหน้าต่าง', {
            fontSize: '20px', fill: '#ff3333', backgroundColor: '#222222', padding: { x: 20, y: 8 }, fontStyle: 'bold', fontFamily: 'Tahoma, Arial'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.helpPanel.add([panelBg, helpTitle, helpDesc, closeBtn]);

        // --- 6. ใส่ระบบคลิก ---
        startBtn.on('pointerover', () => startBtn.setTint(0xffffff));
        startBtn.on('pointerout', () => startBtn.clearTint());
        startBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('GamesScenes');
            });
        });

        helpBtn.on('pointerover', () => helpBtn.setTint(0xffd700));
        helpBtn.on('pointerout', () => helpBtn.clearTint());
        helpBtn.on('pointerdown', () => {
            this.tweens.add({ 
                targets: this.helpPanel, alpha: 1, scale: 1, duration: 400, ease: 'Back.easeOut' 
            });
        });

        closeBtn.on('pointerover', () => closeBtn.setTint(0xffffff));
        closeBtn.on('pointerout', () => closeBtn.clearTint());
        closeBtn.on('pointerdown', () => {
            this.tweens.add({ 
                targets: this.helpPanel, alpha: 0, scale: 0.5, duration: 300, ease: 'Back.easeIn' 
            });
        });
    }
}