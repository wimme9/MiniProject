export default class GameplayScene extends Phaser.Scene {
    constructor() {
        super('GameplayScene');
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

        const melody = [392.0, 440.0, 493.88, 440.0, 392.0, 349.23, 329.63, 293.66];
        let step = 0;

        const playStep = () => {
            if (!this.musicEnabled || !this.audioContext) return;

            const note = melody[step % melody.length];
            const duration = step % 2 === 0 ? 0.3 : 0.25;
            this.playTone(note, duration, 0.022, 'sine');
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

    playSfx(type) {
        if (!this.audioContext) return;

        if (type === 'collect') {
            this.playTone(880, 0.1, 0.03, 'square');
            window.setTimeout(() => this.playTone(1046.5, 0.12, 0.025, 'square'), 80);
        } else if (type === 'hit') {
            this.playTone(220, 0.18, 0.04, 'sawtooth');
        } else if (type === 'win') {
            this.playTone(523.25, 0.18, 0.03, 'triangle');
            window.setTimeout(() => this.playTone(659.25, 0.18, 0.03, 'triangle'), 120);
            window.setTimeout(() => this.playTone(783.99, 0.25, 0.03, 'triangle'), 240);
        }
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

    getDefaultConfig() {
        return {
            gameSettings: {
                duration: 45,
                initialHp: 3,
                playerSpeed: 450,
                spawnDelay: 700
            },
            scores: {
                normalFish: 10,
                goldFish: 30,
                bonePenalty: 10
            },
            itemChances: {
                goldFishMax: 2,
                boneMax: 5,
                specialFishMax: 8
            }
        };
    }

    preload() {
        // โหลดไฟล์ JSON เกมดาต้า[cite: 1]
        this.load.json('gameData', 'data/gameData.json');

        // โหลดรูปภาพจริงแทนการใช้วาดกราฟิก
        this.load.image('background', 'Character_image/b.png');
        this.load.spritesheet('cat_run', 'Character_image/Cat-1/Cat-1-Run.png', {
            frameWidth: 50,
            frameHeight: 50
        });
        this.load.spritesheet('cat_idle', 'Character_image/Cat-1/Cat-1-Idle.png', {
            frameWidth: 50,
            frameHeight: 50
        });
        this.load.spritesheet('cat_sit', 'Character_image/Cat-1/Cat-1-Sitting.png', {
            frameWidth: 50,
            frameHeight: 50
        });
        this.load.image('fish', 'Character_image/843a716d861c01799e38acb1fb1c4367-removebg-preview.png');         
        this.load.image('goldFish', 'Character_image/Screenshot_2026-08-11_122915-removebg-preview.png'); 
        this.load.image('specialFish', 'Character_image/c0b379655c1a9609795361d4fdfe8ef2-removebg-preview.png'); 
        this.load.image('bone', 'Character_image/fa3c9916c8a323bb760d65a937a20c58-removebg-preview.png');         
    }

    create() {
        // ดึงข้อมูลค่าคอนฟิกจาก JSON ที่โหลดมา[cite: 1]
        this.dataConfig = this.cache.json.get('gameData') || this.getDefaultConfig();

        this.isGameOver = false;
        this.score = 0;
        this.hp = this.dataConfig.gameSettings.initialHp;
        this.timeLeft = this.dataConfig.gameSettings.duration;

        this.add.image(240, 320, 'background').setDisplaySize(480, 640).setDepth(0);

        this.initAudio();
        this.input.on('pointerdown', () => this.ensureAudio(), this);

        this.anims.create({
            key: 'catRun',
            frames: this.anims.generateFrameNumbers('cat_run', { start: 0, end: 3 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'catIdle',
            frames: this.anims.generateFrameNumbers('cat_idle', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'catSit',
            frames: this.anims.generateFrameNumbers('cat_sit', { start: 0, end: 1 }),
            frameRate: 3,
            repeat: -1
        });

        // สร้างตัวละครแมวจากรูปจริงที่โหลดเข้ามา
        this.player = this.physics.add.sprite(240, 580, 'cat_run').setScale(1.7);
        this.player.play('catIdle');
        this.player.setCollideWorldBounds(true);

        this.fishGroup = this.physics.add.group();
        this.goldFishGroup = this.physics.add.group();
        this.specialFishGroup = this.physics.add.group();
        this.boneGroup = this.physics.add.group();

        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '20px', fill: '#000', fontStyle: 'bold' });
        this.hpText = this.add.text(20, 50, `HP: ${this.hp} ❤️`, { fontSize: '20px', fill: '#d9534f', fontStyle: 'bold' });
        this.timerText = this.add.text(360, 20, `Time: ${this.timeLeft}`, { fontSize: '20px', fill: '#000', fontStyle: 'bold' });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D'
        });

        // ตัวสุ่มไอเทมโดยอ้างอิงค่า delay จาก JSON[cite: 1]
        this.time.addEvent({
            delay: this.dataConfig.gameSettings.spawnDelay,
            callback: this.spawnItems,
            callbackScope: this,
            loop: true
        });

        // ตัวนับเวลาถอยหลัง
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.physics.add.overlap(this.player, this.fishGroup, this.collectFish, null, this);
        this.physics.add.overlap(this.player, this.goldFishGroup, this.collectGoldFish, null, this);
        this.physics.add.overlap(this.player, this.specialFishGroup, this.collectSpecialFish, null, this);
        this.physics.add.overlap(this.player, this.boneGroup, this.hitBone, null, this);

        this.ensureAudio();
    }

    update() {
        if (this.isGameOver) return;

        let speed = this.dataConfig.gameSettings.playerSpeed || 450;

        const moving = this.cursors.left.isDown || this.wasd.left.isDown || this.cursors.right.isDown || this.wasd.right.isDown;

        const movingLeft = this.cursors.left.isDown || this.wasd.left.isDown;
        const movingRight = this.cursors.right.isDown || this.wasd.right.isDown;

        if (moving) {
            this.player.setVelocityX(movingLeft ? -speed : speed);
            if (movingLeft) {
                this.player.setFlipX(true);
            } else if (movingRight) {
                this.player.setFlipX(false);
            }
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'catRun') {
                this.player.play('catRun');
            }
        } else {
            this.player.setVelocityX(0);
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'catSit') {
                this.player.play('catSit');
            }
        }
    }

    spawnItems() {
        if (this.isGameOver) return;

        let randomX = Phaser.Math.Between(30, 450);
        let chance = Phaser.Math.Between(1, 10);
        let cfg = this.dataConfig.itemChances || { goldFishMax: 2, boneMax: 5, specialFishMax: 8 };

        if (chance <= cfg.goldFishMax) {
            let goldFish = this.goldFishGroup.create(randomX, 0, 'goldFish').setScale(0.14);
            goldFish.setVelocityY(Phaser.Math.Between(220, 350));
        } else if (chance <= cfg.boneMax) {
            let bone = this.boneGroup.create(randomX, 0, 'bone').setScale(0.14);
            bone.setVelocityY(Phaser.Math.Between(200, 320));
        } else if (chance <= cfg.specialFishMax) {
            let specialFish = this.specialFishGroup.create(randomX, 0, 'specialFish').setScale(0.14);
            specialFish.setVelocityY(Phaser.Math.Between(180, 300));
        } else {
            let fish = this.fishGroup.create(randomX, 0, 'fish').setScale(0.14);
            fish.setVelocityY(Phaser.Math.Between(150, 280));
        }
    }

    collectFish(player, fish) {
        fish.destroy();
        const points = (this.dataConfig.scores && this.dataConfig.scores.normalFish) || 10;
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
        this.playSfx('collect');
        this.showFloatingText(`+${points}`, player.x, player.y - 40, '#00BFFF');
    }

    collectGoldFish(player, goldFish) {
        goldFish.destroy();
        const points = (this.dataConfig.scores && this.dataConfig.scores.goldFish) || 30;
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
        this.playSfx('collect');
        this.showFloatingText(`+${points}`, player.x, player.y - 40, '#FFD700');
    }

    collectSpecialFish(player, specialFish) {
        specialFish.destroy();
        this.playSfx('collect');
        const bonusTime = Phaser.Math.Between(2, 5);
        this.timeLeft = Math.min(this.timeLeft + bonusTime, 99);
        this.timerText.setText('Time: ' + this.timeLeft);

        this.add.text(player.x, player.y - 40, `+${bonusTime}s`, {
            fontSize: '16px',
            fill: '#00FF7F',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: this.children.getAt(this.children.length - 1),
            alpha: 0,
            y: this.children.getAt(this.children.length - 1).y - 20,
            duration: 800,
            onComplete: (tween, targets) => targets[0].destroy()
        });
    }

    hitBone(player, bone) {
        bone.destroy();
        this.playSfx('hit');
        this.hp -= 1;
        const penalty = (this.dataConfig.scores && this.dataConfig.scores.bonePenalty) || 10;
        this.score = Math.max(0, this.score - penalty);
        this.scoreText.setText('Score: ' + this.score);
        this.showFloatingText(`-${penalty}`, player.x, player.y - 40, '#FF4444');
        this.hpText.setText(`HP: ${this.hp} ❤️`);

        if (this.hp <= 0) {
            this.endGame('Game Over');
        }
    }

    updateTimer() {
        if (this.isGameOver) return;
        
        this.timeLeft -= 1;
        this.timerText.setText('Time: ' + this.timeLeft);

        if (this.timeLeft <= 0) {
            this.endGame('Victory!');
        }
    }

    endGame(statusText) {
        this.isGameOver = true;
        this.playSfx('win');
        if (this.gameTimer) {
            this.gameTimer.remove();
        }
        
        if (this.player) {
            this.player.setVelocityX(0);
        }
        this.fishGroup.clear(true, true);
        this.goldFishGroup.clear(true, true);
        this.boneGroup.clear(true, true);

        let highScore = Number(localStorage.getItem('catGameHighScore') || 0);
        if (this.score > highScore) {
            highScore = this.score;
            localStorage.setItem('catGameHighScore', highScore);
        }

        let rect = this.add.rectangle(240, 320, 420, 280, 0x000000, 0.85);
        rect.setStrokeStyle(4, 0xffffff);

        this.add.text(240, 210, statusText, { fontSize: '32px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(240, 260, 'Final Score: ' + this.score, { fontSize: '24px', fill: '#FFD700' }).setOrigin(0.5);
        this.add.text(240, 300, 'High Score: ' + highScore, { fontSize: '20px', fill: '#00FF7F' }).setOrigin(0.5);

        let restartText = this.add.text(240, 370, 'Play Again', { fontSize: '18px', fill: '#00FF7F', backgroundColor: '#333', padding: 10 })
            .setOrigin(0.5)
            .setInteractive();

        let menuText = this.add.text(240, 425, 'Main Menu', { fontSize: '18px', fill: '#FFFFFF', backgroundColor: '#555', padding: 10 })
            .setOrigin(0.5)
            .setInteractive();

        restartText.on('pointerdown', () => {
            this.scene.restart();
        });

        menuText.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    showFloatingText(text, x, y, color = '#FFFFFF') {
        const txt = this.add.text(x, y, text, {
            fontSize: '16px',
            fill: color,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: txt,
            alpha: 0,
            y: y - 20,
            duration: 800,
            onComplete: (tween, targets) => {
                if (targets && targets[0]) targets[0].destroy();
            }
        });
        return txt;
    }
}