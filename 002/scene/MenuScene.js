export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    initAudio() {
        if (this.audioContext) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        this.audioContext = new AudioContext();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.04;
        this.masterGain.connect(this.audioContext.destination);
        this.musicEnabled = false;
        this.musicTimer = null;
    }

    ensureAudio() {
        this.initAudio();
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
        }

        if (!this.musicEnabled) {
            this.musicEnabled = true;
            this.startBackgroundMusic();
        }
    }

    startBackgroundMusic() {
        if (!this.audioContext || this.musicTimer) return;

        const melody = [261.63, 329.63, 392.0, 329.63, 349.23, 392.0, 440.0, 392.0];
        let step = 0;

        const playStep = () => {
            if (!this.musicEnabled || !this.audioContext) return;

            const note = melody[step % melody.length];
            const duration = step % 2 === 0 ? 0.35 : 0.25;
            this.playTone(note, duration, 0.025, 'triangle');
            step += 1;
            this.musicTimer = window.setTimeout(playStep, duration * 1000 * 0.9);
        };

        playStep();
    }

    playTone(frequency, duration, volume, type = 'sine') {
        if (!this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    stopMusic() {
        if (this.musicTimer) {
            window.clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
        this.musicEnabled = false;
    }

    shutdown() {
        this.stopMusic();
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
        }
        super.shutdown?.();
    }

    preload() {
        this.load.image('cat_menu_cover', 'Character_image/Cat-1/Cat-1-Itch.png');
        this.load.audio('bgMusic', 'Song/alex-morgan-rpg-fantasy-tavern-quest-573938.mp3');

        let graphics = this.add.graphics();
        graphics.fillStyle(0xFF8C00, 1);
        graphics.fillRoundedRect(0, 0, 80, 60, 12);
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillRect(18, 18, 18, 12);
        graphics.fillRect(44, 18, 18, 12);
        graphics.fillRect(30, 35, 20, 10);
        graphics.generateTexture('cat_placeholder', 80, 60);
        graphics.destroy();
    }

    create() {
        this.backgroundMusic = this.sound.get('bgMusic') || this.sound.add('bgMusic', { loop: true, volume: 0.35 });

        const isMuted = this.game.registry.get('musicMuted') ?? false;
        this.backgroundMusic.setMute(isMuted);
        if (!this.backgroundMusic.isPlaying) {
            this.backgroundMusic.play();
        }

        const musicButton = this.add.rectangle(410, 70, 80, 34, 0x111122, 0.9)
            .setDepth(10)
            .setStrokeStyle(2, 0x00ffff)
            .setInteractive({ useHandCursor: true });

        this.musicButtonText = this.add.text(410, 70, isMuted ? '🔇' : '🔊', {
            fontSize: '20px'
        }).setOrigin(0.5).setDepth(11);

        musicButton.on('pointerdown', () => {
            const muted = !(this.game.registry.get('musicMuted') ?? false);
            this.game.registry.set('musicMuted', muted);
            this.backgroundMusic.setMute(muted);
            this.musicButtonText.setText(muted ? '🔇' : '🔊');
        });

        // 1. สร้างพื้นหลังไล่ระดับสีนีออนเข้ม (Deep Cyber Gradient)
        let bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x05051a, 0x05051a, 0x1a0033, 0x0d001a, 1);
        bgGraphics.fillRect(0, 0, 480, 640);

        // 2. วาดเส้นตารางไซเบอร์ (Cyber Grid) ด้านหลังสุดให้ดูมีมิติ
        bgGraphics.lineStyle(1, 0xff00ff, 0.15);
        for (let x = 0; x <= 480; x += 40) {
            bgGraphics.lineBetween(x, 0, x, 640);
        }
        for (let y = 0; y <= 640; y += 40) {
            bgGraphics.lineBetween(0, y, 480, y);
        }

        // 3. เพิ่มแสงเรืองแสง (Glow Orb) ตรงกลางฉากหลัง
        let glowOrb = this.add.circle(240, 320, 180, 0x00ffff, 0.08);
        this.tweens.add({
            targets: glowOrb,
            scale: { from: 1, to: 1.2 },
            alpha: { from: 0.08, to: 0.15 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 4. วงแหวนนีออนรอบตัวแมว
        let aura = this.add.circle(240, 240, 105, 0x00ffff, 0.2);
        this.tweens.add({
            targets: aura,
            scale: { from: 0.9, to: 1.25 },
            alpha: { from: 0.25, to: 0.05 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 5. Container ตัวละครแมว
        let catContainer = this.add.container(240, 240);
        
        let catShadow = this.add.ellipse(0, 45, 90, 22, 0x000000, 0.6);
        catContainer.add(catShadow);

        let catKey = this.textures.exists('cat_menu_cover') ? 'cat_menu_cover' : 'cat_placeholder';
        let catSprite = this.add.sprite(0, 0, catKey).setScale(2.5);
        catContainer.add(catSprite);

        this.tweens.add({
            targets: catContainer,
            y: 232,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: catSprite,
            angle: { from: -5, to: 5 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Quad.easeInOut'
        });

        // 6. หัวข้อเกมสไตล์นีออน
        let titleText = this.add.text(240, 375, 'CAT CATCH FISH', { 
            fontSize: '36px', fill: '#00ffff', fontStyle: 'bold', stroke: '#ff00ff', strokeThickness: 4 
        }).setOrigin(0.5);

        this.tweens.add({
            targets: titleText,
            scaleX: 1.04,
            scaleY: 1.04,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(240, 415, 'ULTIMATE NEON EDITION', { 
            fontSize: '15px', fill: '#ff00ff', fontStyle: 'bold', letterSpacing: 2
        }).setOrigin(0.5);

        // 7. ปุ่ม PLAY GAME
        let playButton = this.add.rectangle(240, 475, 260, 50, 0x003344, 1)
            .setInteractive()
            .setStrokeStyle(3, 0x00ffff);

        let playText = this.add.text(240, 475, 'PLAY GAME', { 
            fontSize: '22px', fill: '#00ffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        playButton.on('pointerover', () => {
            playButton.setFillStyle(0x00ffff);
            playText.setFill('#000000');
        });
        playButton.on('pointerout', () => {
            playButton.setFillStyle(0x003344);
            playText.setFill('#00ffff');
        });

        // 8. ปุ่ม HOW TO PLAY
        let howButton = this.add.rectangle(240, 540, 260, 50, 0x330033, 1)
            .setInteractive()
            .setStrokeStyle(3, 0xff00ff);

        let howText = this.add.text(240, 540, 'HOW TO PLAY', { 
            fontSize: '22px', fill: '#ff00ff', fontStyle: 'bold'
        }).setOrigin(0.5);

        howButton.on('pointerover', () => {
            howButton.setFillStyle(0xff00ff);
            howText.setFill('#000000');
        });
        howButton.on('pointerout', () => {
            howButton.setFillStyle(0x330033);
            howText.setFill('#ff00ff');
        });

        // 9. หน้าต่าง Modal Popup แสดงวิธีเล่น (ปรับระยะห่างข้อความคะแนนให้กระชับสวยงาม)
        let modalContainer = this.add.container(240, 320).setDepth(10).setVisible(false);

        let modalBg = this.add.rectangle(0, 0, 480, 640, 0x000000, 0.85).setInteractive();
        
        let dialogBox = this.add.rectangle(0, 0, 410, 480, 0x111122, 1)
            .setStrokeStyle(3, 0x00ffff);

        let dialogTitle = this.add.text(0, -195, '📖  HOW TO PLAY', {
            fontSize: '24px', fill: '#00ffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // ข้อความด้านบน (คำสั่งควบคุม)
        let dialogDesc = this.add.text(-165, -125, '← / → หรือ  A / D\nเคลื่อนที่ตะกร้าไปทางซ้ายและขวา', {
            fontSize: '15px', fill: '#ffffff', align: 'left', lineSpacing: 6
        }).setOrigin(0, 0.5);

        // รายการไอเทม จัดระยะห่างระหว่างชื่อกับคะแนนให้พอดี ไม่ห่างกันเกินไป
        let itemTexts = this.add.text(-165, -15, 
            '🐟  ปลาปกติ       +10 คะแนน\n' +
            '⭐  ปลาทองพิเศษ  +30 คะแนน\n' +
            '⏱️  ปลาพิเศษ     +เวลาเพิ่ม\n' +
            '🦴  ก้างปลา        -8 คะแนน • -1 HP', {
            fontSize: '15px', fill: '#ffffff', align: 'left', lineSpacing: 10
        }).setOrigin(0, 0.5);

        // ข้อมูล HP และเวลาเล่นด้านล่าง
        let bottomInfo = this.add.text(-165, 85, '❤️  HP เริ่มต้น: 5\n⏱️  เวลาเล่น: 45 วินาที', {
            fontSize: '15px', fill: '#ffffff', align: 'left', lineSpacing: 6
        }).setOrigin(0, 0.5);

        let closeButton = this.add.rectangle(0, 180, 220, 45, 0xef4444, 1)
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);

        let closeText = this.add.text(0, 180, '✕ CLOSE', {
            fontSize: '18px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        modalContainer.add([modalBg, dialogBox, dialogTitle, dialogDesc, itemTexts, bottomInfo, closeButton, closeText]);

        // ควบคุมการแสดง Pop-up
        howButton.on('pointerdown', () => {
            this.ensureAudio();
            modalContainer.setVisible(true);
        });

        closeButton.on('pointerdown', () => {
            modalContainer.setVisible(false);
        });

        // ระบบเสียงและเริ่มเกม
        this.initAudio();
        this.input.on('pointerdown', () => this.ensureAudio(), this);

        playButton.on('pointerdown', () => {
            this.ensureAudio();
            this.scene.start('GameplayScene');
        });
    }
}