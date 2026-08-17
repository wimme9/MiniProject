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
        super.shutdown?.();
    }

    preload() {
        this.load.image('cat_menu_cover', 'Character_image/Cat-1/Cat-1-Itch.png');

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
        // พื้นหลังฉากเมนู
        this.add.rectangle(240, 320, 480, 640, 0x87CEEB);

        // หัวข้อเกม
        this.add.text(240, 150, 'CAT CATCH FISH', { 
            fontSize: '36px', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6 
        }).setOrigin(0.5);

        this.add.text(240, 200, 'แมวเหมียวตะครุบปลา', { 
            fontSize: '22px', fill: '#333333', fontStyle: 'bold' 
        }).setOrigin(0.5);

        let catKey = this.textures.exists('cat_menu_cover') ? 'cat_menu_cover' : 'cat_placeholder';
        let catSprite = this.add.sprite(240, 285, catKey).setScale(2.8);

        this.tweens.add({
            targets: catSprite,
            scaleX: 2.75,
            scaleY: 2.85,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: catSprite,
            y: 275,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // คำแนะนำการเล่น
        this.add.text(240, 390, 'ใช้ปุ่มลูกศร ซ้าย-ขวา เพื่อรับปลา\nหลบก้างปลา และเก็บปลาทองพิเศษ!\nภายในเวลา 45 วินาที', { 
            fontSize: '15px', fill: '#000000', align: 'center' 
        }).setOrigin(0.5);

        // ปุ่ม Start Game
        let startButton = this.add.rectangle(240, 510, 220, 60, 0x4CAF50, 1)
            .setInteractive()
            .setStrokeStyle(3, 0xffffff);

        this.add.text(240, 510, 'START GAME', { 
            fontSize: '20px', fill: '#ffffff', fontStyle: 'bold' 
        }).setOrigin(0.5);

        this.initAudio();
        this.input.on('pointerdown', () => this.ensureAudio(), this);

        startButton.on('pointerdown', () => {
            this.ensureAudio();
            this.scene.start('GameplayScene');
        });
    }
}