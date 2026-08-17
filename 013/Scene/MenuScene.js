export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('card_common', 'Image/แกว๊ก.png');
        this.load.image('card_rare', 'Image/ตนที่1.png');
        this.load.image('card_epic', 'Image/ตนที่2.png');
        this.load.image('card_legendary', 'Image/ตนที่3.png');
        this.load.image('card_mythic', 'Image/ตนที่4.png');
        this.load.image('card_divine', 'Image/เวสลุกซ์.png');
    }

    create() {
        // --- 1. ฉากหลังอวกาศ Deep Cosmic Background ---
        this.add.rectangle(640, 360, 1280, 720, 0x050814);

        // เนบิวลาเรืองแสงสีม่วง-ฟ้า (Nebula Glows)
        const nebula1 = this.add.graphics();
        nebula1.fillStyle(0x7b2cbf, 0.15);
        nebula1.fillCircle(300, 200, 350);
        
        const nebula2 = this.add.graphics();
        nebula2.fillStyle(0x00f2ff, 0.12);
        nebula2.fillCircle(980, 500, 380);

        // --- 2. ละอองดาว Sci-Fi Space Dust ---
        const starGraphics = this.add.graphics();
        starGraphics.fillStyle(0xa5f3fc, 1);
        starGraphics.fillCircle(2, 2, 2);
        starGraphics.generateTexture('cyanStar', 4, 4);
        starGraphics.destroy();

        this.add.particles(640, 360, 'cyanStar', {
            x: { min: 0, max: 1280 },
            y: { min: 0, max: 720 },
            lifespan: { min: 2500, max: 5000 },
            scale: { start: 0.2, end: 1.2 },
            alpha: { start: 0.1, end: 0.9 },
            quantity: 3,
            frequency: 80
        });

        // --- 3. ขอบโค้งพื้นผิวดาวด้านล่าง (Planet Horizon) ---
        const planetHorizon = this.add.graphics();
        planetHorizon.fillStyle(0x0284c7, 0.25);
        planetHorizon.fillCircle(640, 1150, 850);
        planetHorizon.fillStyle(0x38bdf8, 0.4);
        planetHorizon.fillCircle(640, 1150, 820);
        planetHorizon.fillStyle(0x0f172a, 1);
        planetHorizon.fillCircle(640, 1150, 810);

        // --- 4. จำลอง MOON GATE (Gyroscopic Space Station Core) ---
        const gateContainer = this.add.container(640, 210);

        // ลำแสงแกนกลาง (Central Energy Core)
        const coreBeam = this.add.graphics();
        coreBeam.fillStyle(0x00f2ff, 0.8);
        coreBeam.fillCircle(0, 0, 35);
        coreBeam.fillStyle(0xffffff, 0.95);
        coreBeam.fillCircle(0, 0, 18);

        // วงแหวนชั้นในสุด (Inner Ring)
        const innerRing = this.add.graphics();
        innerRing.lineStyle(4, 0x00f2ff, 0.9);
        innerRing.strokeCircle(0, 0, 75);
        innerRing.lineStyle(2, 0xffffff, 0.8);
        innerRing.strokeCircle(0, 0, 65);

        // วงแหวนกลไกชั้นกลาง (Mechanical Ring)
        const midRing = this.add.graphics();
        midRing.lineStyle(6, 0x38bdf8, 0.7);
        midRing.strokeCircle(0, 0, 120);
        midRing.lineStyle(2, 0xc084fc, 0.8);
        midRing.strokeCircle(0, 0, 132);

        // ฟันเฟืองกลไก 4 จุดบนวงแหวนกลาง
        for (let i = 0; i < 4; i++) {
            const rad = (i * 90) * (Math.PI / 180);
            midRing.fillStyle(0xe2e8f0, 1);
            midRing.fillRect(Math.cos(rad) * 120 - 6, Math.sin(rad) * 120 - 6, 12, 12);
        }

        // วงแหวนใหญ่ชั้นนอกสุด (Outer Station Ring)
        const outerRing = this.add.graphics();
        outerRing.lineStyle(8, 0x0284c7, 0.5);
        outerRing.strokeCircle(0, 0, 170);
        outerRing.lineStyle(2, 0x00f2ff, 0.9);
        outerRing.strokeCircle(0, 0, 182);

        // ปีกหนามโครงสร้างโลหะแบบ Sci-Fi (Metallic Wings/Spikes)
        const spikes = this.add.graphics();
        spikes.lineStyle(4, 0x94a3b8, 0.9);
        spikes.beginPath();
        spikes.moveTo(-182, 0); spikes.lineTo(-240, -30); spikes.lineTo(-210, 0); spikes.lineTo(-240, 30); spikes.closePath();
        spikes.moveTo(182, 0); spikes.lineTo(240, -30); spikes.lineTo(210, 0); spikes.lineTo(240, 30); spikes.closePath();
        spikes.strokePath();

        gateContainer.add([spikes, outerRing, midRing, innerRing, coreBeam]);

        // อนิเมชันการปรากฏตัวของ Moon Gate (Zoom In & Fade In)
        gateContainer.setScale(0);
        gateContainer.setAlpha(0);
        this.tweens.add({
            targets: gateContainer,
            scale: 1,
            alpha: 1,
            duration: 800,
            ease: 'Back.out'
        });

        // อนิเมชันวงแหวนหมุนสลับทิศทาง
        this.tweens.add({ targets: innerRing, angle: 360, duration: 6000, loop: -1 });
        this.tweens.add({ targets: midRing, angle: -360, duration: 12000, loop: -1 });
        this.tweens.add({ targets: outerRing, angle: 360, duration: 20000, loop: -1 });
        
        // เอฟเฟกต์กระพริบพลังงานแกนกลาง
        this.tweens.add({
            targets: coreBeam,
            scale: { from: 0.85, to: 1.15 },
            alpha: { from: 0.7, to: 1 },
            duration: 1200,
            yoyo: true,
            loop: -1,
            ease: 'Sine.easeInOut'
        });

        // จังหวะ Gate ลอยขึ้นลงเบาๆ
        this.tweens.add({
            targets: gateContainer,
            y: 218,
            duration: 3500,
            yoyo: true,
            loop: -1,
            ease: 'Sine.easeInOut',
            delay: 800
        });

        // --- 5. การ์ดพิทักษ์ลอยด้านข้างแบบไร้กรอบ ---
        const cardW = 150;
        const cardH = 225;

        const leftCard = this.add.image(200, 400, 'card_divine')
            .setDisplaySize(cardW, cardH)
            .setAlpha(0)
            .setAngle(-18);

        const rightCard = this.add.image(1080, 400, 'card_mythic')
            .setDisplaySize(cardW, cardH)
            .setAlpha(0)
            .setAngle(18);

        // อนิเมชันการ์ดสไลด์เข้าจากด้านข้าง
        this.tweens.add({
            targets: leftCard,
            x: 200,
            alpha: 0.5,
            duration: 1000,
            ease: 'Power2',
            delay: 300
        });

        this.tweens.add({
            targets: rightCard,
            x: 1080,
            alpha: 0.5,
            duration: 1000,
            ease: 'Power2',
            delay: 300
        });

        this.tweens.add({
            targets: [leftCard, rightCard],
            y: '+=12',
            duration: 3000,
            yoyo: true,
            loop: -1,
            ease: 'Sine.easeInOut',
            delay: 1300
        });

        // --- 6. Title Text สไตล์ BRANDT GATE ---
        const titleText = this.add.text(640, -100, 'CARD RUSH', {
            fontSize: '84px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#0284c7',
            strokeThickness: 10,
            shadow: { color: '#00f2ff', blur: 25, fill: true }
        }).setOrigin(0.5);

        const subTitleText = this.add.text(640, -50, '❖ MOON GATE GUARDIANS ❖', {
            fontSize: '20px',
            fill: '#00f2ff',
            fontStyle: 'bold',
            fontFamily: 'sans-serif',
            letterSpacing: 4,
            shadow: { color: '#38bdf8', blur: 12, fill: true }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: titleText,
            y: 165,
            duration: 700,
            ease: 'Bounce.out',
            delay: 200
        });

        this.tweens.add({
            targets: subTitleText,
            y: 235,
            duration: 700,
            ease: 'Back.out',
            delay: 400
        });

        // --- 7. Main Action Buttons ---
        this.btnStart = this.createSciFiButton(640, 820, '🚀 START MISSION', 0x0284c7, 0x00f2ff, () => this.startGame());
        this.btnHowTo = this.createSciFiButton(640, 905, '📖 DATABASE / HOW TO', 0x0f172a, 0x38bdf8, () => this.showHowToPlayModal());

        this.tweens.add({
            targets: this.btnStart,
            y: 420,
            duration: 800,
            ease: 'Back.out',
            delay: 500
        });

        this.tweens.add({
            targets: this.btnHowTo,
            y: 505,
            duration: 800,
            ease: 'Back.out',
            delay: 650
        });

        this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    }

    createSciFiButton(x, y, label, bgColor, strokeColor, callback) {
        const btnContainer = this.add.container(x, y);
        
        const btnBg = this.add.graphics();
        btnBg.fillStyle(bgColor, 0.9);
        btnBg.fillRoundedRect(-170, -28, 340, 56, 6);
        btnBg.lineStyle(2, strokeColor, 1);
        btnBg.strokeRoundedRect(-170, -28, 340, 56, 6);

        btnBg.lineStyle(3, 0xffffff, 0.8);
        btnBg.lineBetween(-170, -18, -170, -28);
        btnBg.lineBetween(-170, -28, -150, -28);
        btnBg.lineBetween(170, 18, 170, 28);
        btnBg.lineBetween(170, 28, 150, 28);

        const btnText = this.add.text(0, 0, label, {
            fontSize: '19px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        btnContainer.add([btnBg, btnText]);
        btnContainer.setSize(340, 56);
        btnContainer.setInteractive({ useHandCursor: true });

        btnContainer.on('pointerover', () => {
            btnContainer.setScale(1.04);
            btnBg.fillStyle(strokeColor, 0.3);
        });
        btnContainer.on('pointerout', () => {
            btnContainer.setScale(1.0);
            btnBg.fillStyle(bgColor, 0.9);
        });
        btnContainer.on('pointerdown', callback);

        return btnContainer;
    }

    // --- Modal สอนการเล่น (แก้ไขพิกัดให้แสดงผลตรงกลางจอพอดี) ---
    showHowToPlayModal() {
        this.btnStart.setVisible(false);
        this.btnHowTo.setVisible(false);

        const modalContainer = this.add.container(640, 360); // เซ็ตตำแหน่งกึ่งกลางจอที่ (640, 360)
        modalContainer.setDepth(50);
        
        const overlay = this.add.rectangle(0, 0, 1280, 720, 0x030712, 0);
        
        const modalBg = this.add.graphics();
        modalBg.fillStyle(0x0a0f1d, 0.98);
        modalBg.fillRoundedRect(-480, -285, 960, 570, 12); // ปรับพิกัดกราฟิกให้สมมาตรจากจุดศูนย์กลาง
        modalBg.lineStyle(3, 0x00f2ff, 1);
        modalBg.strokeRoundedRect(-480, -285, 960, 570, 12);

        const title = this.add.text(0, -242, '❖ MOON GATE SYSTEM DATABASE ❖', {
            fontSize: '24px', fill: '#00f2ff', fontStyle: 'bold', fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        const controlHeader = this.add.text(-420, -200, '🎮 การควบคุมผู้พิทักษ์', {
            fontSize: '18px', fill: '#fbc531', fontStyle: 'bold', fontFamily: 'sans-serif'
        });
        const controlBody = this.add.text(-420, -165, 
            "• เคลื่อนที่: ปุ่ม [Arrow] หรือ [W][A][S][D]\n" +
            "• หยุดเกม: กด [P] หรือ [ESC]\n" +
            "• เวลาการทำงานของประตู: 60 วินาที", {
            fontSize: '14px', fill: '#e2e8f0', lineSpacing: 8, fontFamily: 'sans-serif'
        });

        const vLine = this.add.graphics();
        vLine.lineStyle(1, 0x1e293b, 1);
        vLine.lineBetween(-10, -200, -10, -60);

        const scoreHeader = this.add.text(20, -200, '⚡ พลังการ์ดใน Order Zone', {
            fontSize: '18px', fill: '#fbc531', fontStyle: 'bold', fontFamily: 'sans-serif'
        });
        const scoreBody = this.add.text(20, -165, 
            "• แกว๊ก: +10 | ตนที่ 1: +25 | ตนที่ 2: +50\n" +
            "• ตนที่ 3: +100 | ตนที่ 4: +200 | เวสลุกซ์: +300!\n" +
            "✨ MOON BLAST: เก็บต่อเนื่องรับโบนัสคะแนนคูณพิเศษ!", {
            fontSize: '14px', fill: '#e2e8f0', lineSpacing: 8, fontFamily: 'sans-serif'
        });

        const hLine = this.add.graphics();
        hLine.lineStyle(1, 0x1e293b, 1);
        hLine.lineBetween(-450, -35, 450, -35);

        const cardHeader = this.add.text(0, -15, '— รายชื่อหน่วยรบผู้พิทักษ์ Moon Gate (คลิกเพื่อสแกนการ์ด) —', {
            fontSize: '15px', fill: '#38bdf8', fontStyle: 'bold', fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        const cardData = [
            { name: 'แกว๊ก', score: '+10', key: 'card_common', x: -400 },
            { name: 'ตนที่ 1', score: '+25', key: 'card_rare', x: -240 },
            { name: 'ตนที่ 2', score: '+50', key: 'card_epic', x: -80 },
            { name: 'ตนที่ 3', score: '+100', key: 'card_legendary', x: 80 },
            { name: 'ตนที่ 4', score: '+200', key: 'card_mythic', x: 240 },
            { name: 'เวสลุกซ์', score: '+300', key: 'card_divine', x: 400 }
        ];

        const cardGraphicsGroup = [];
        cardData.forEach(card => {
            const cardImg = this.add.image(card.x, 60, card.key);
            cardImg.setDisplaySize(58, 87);
            cardImg.setInteractive({ useHandCursor: true });

            const cardTxt = this.add.text(card.x, 125, `${card.name}\n${card.score}`, {
                fontSize: '12px', fill: '#ffffff', align: 'center', fontStyle: 'bold', fontFamily: 'sans-serif'
            }).setOrigin(0.5);

            cardImg.on('pointerover', () => cardImg.setDisplaySize(66, 99));
            cardImg.on('pointerout', () => cardImg.setDisplaySize(58, 87));
            cardImg.on('pointerdown', () => this.zoomCardPreview(card.key, card.name, card.score));

            cardGraphicsGroup.push(cardImg, cardTxt);
        });

        const closeBtn = this.add.text(0, 240, '[ คลิกเพื่อปิดฐานข้อมูล ]', {
            fontSize: '16px', fill: '#94a3b8', fontStyle: 'bold', fontFamily: 'sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        modalContainer.add([
            overlay, modalBg, title, 
            controlHeader, controlBody, 
            vLine, scoreHeader, scoreBody, 
            hLine, cardHeader, 
            ...cardGraphicsGroup, 
            closeBtn
        ]);

        // เอฟเฟกต์เปิดหน้าต่าง Modal (Scale เด้งขยายออกตรงกลาง)
        modalContainer.setScale(0.5);
        modalContainer.setAlpha(0);

        this.tweens.add({
            targets: modalContainer,
            scale: 1,
            alpha: 1,
            duration: 350,
            ease: 'Back.out'
        });

        this.tweens.add({
            targets: overlay,
            alpha: 0.9,
            duration: 300
        });

        overlay.setInteractive();

        const closeModal = () => {
            this.tweens.add({
                targets: modalContainer,
                scale: 0.6,
                alpha: 0,
                duration: 250,
                ease: 'Power2',
                onComplete: () => {
                    modalContainer.destroy();
                    this.btnStart.setVisible(true);
                    this.btnHowTo.setVisible(true);
                }
            });
        };

        closeBtn.on('pointerdown', closeModal);
        overlay.on('pointerdown', closeModal);
    }

    zoomCardPreview(key, name, score) {
        const zoomContainer = this.add.container(640, 360);
        zoomContainer.setDepth(100);

        const zoomOverlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.92);
        zoomOverlay.setInteractive();

        const zoomBg = this.add.graphics();
        zoomBg.fillStyle(0x0a0f1d, 0.95);
        zoomBg.fillRoundedRect(-200, -250, 400, 500, 16);
        zoomBg.lineStyle(3, 0x00f2ff, 1);
        zoomBg.strokeRoundedRect(-200, -250, 400, 500, 16);

        const bigCardImg = this.add.image(0, -30, key);
        bigCardImg.setDisplaySize(240, 360);

        const cardTitle = this.add.text(0, 165, `${name} (${score} คะแนน)`, {
            fontSize: '24px', fill: '#fbc531', fontStyle: 'bold', fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        const tipText = this.add.text(0, 210, '[ คลิกเพื่อปิดหน้าต่างสแกน ]', {
            fontSize: '14px', fill: '#94a3b8', fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        zoomContainer.add([zoomOverlay, zoomBg, bigCardImg, cardTitle, tipText]);

        zoomContainer.setScale(0.7);
        zoomContainer.setAlpha(0);
        this.tweens.add({
            targets: zoomContainer,
            scale: 1,
            alpha: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        zoomOverlay.on('pointerdown', () => {
            this.tweens.add({
                targets: zoomContainer,
                scale: 0.8,
                alpha: 0,
                duration: 150,
                onComplete: () => zoomContainer.destroy()
            });
        });
    }

    startGame() {
        const flash = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0);
        flash.setDepth(200);

        this.tweens.add({
            targets: flash,
            alpha: 1,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('GameplayScene');
                });
            }
        });
    }
}