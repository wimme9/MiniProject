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
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
        }
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
        this.load.json('gameData', 'data/gameData.json');
        this.load.audio('bgMusic', 'Song/alex-morgan-rpg-fantasy-tavern-quest-573938.mp3');
        
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
        this.load.image('bone', 'Character_image/Screenshot_2026-08-18_131109-removebg-preview.png');
    }

    createBoneTexture() {
        return;
    }

    create() {
        // รีเซ็ตสถานะเกมและเวลาให้พร้อมเริ่มใหม่เสมอ
        this.isGameOver = false;
        this.isPaused = false;
        this.physics.world.resume();
        this.time.paused = false;

        this.backgroundMusic = this.sound.get('bgMusic') || this.sound.add('bgMusic', { loop: true, volume: 0.35 });

        const isMuted = this.game.registry.get('musicMuted') ?? false;
        this.backgroundMusic.setMute(isMuted);
        if (!this.backgroundMusic.isPlaying) {
            this.backgroundMusic.play();
        }

        this.dataConfig = this.cache.json.get('gameData') || this.getDefaultConfig();

        this.score = 0;
        this.hp = this.dataConfig.gameSettings.initialHp;
        this.timeLeft = this.dataConfig.gameSettings.duration;

        let bgBase = this.add.graphics().setDepth(0);
        bgBase.fillGradientStyle(0xffffff, 0xffffff, 0xf0f4f8, 0xe2e8f0, 1);
        bgBase.fillRect(0, 0, 480, 640);

        let gridGraphics = this.add.graphics().setDepth(1);
        gridGraphics.lineStyle(1, 0xcbdeeb, 0.6);
        for (let x = 0; x <= 480; x += 40) {
            gridGraphics.lineBetween(x, 0, x, 640);
        }

        this.cyberGridLines = [];
        for (let y = 0; y <= 640; y += 40) {
            let line = this.add.graphics().setDepth(1);
            line.lineStyle(1, 0xa0c4df, 0.7);
            line.lineBetween(0, y, 480, y);
            this.cyberGridLines.push(line);
        }

        let glowOrb = this.add.circle(240, 320, 160, 0x3b82f6, 0.05).setDepth(2);
        this.tweens.add({
            targets: glowOrb,
            scale: { from: 1, to: 1.3 },
            alpha: { from: 0.05, to: 0.1 },
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

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

        this.player = this.physics.add.sprite(240, 580, 'cat_run').setScale(1.7).setDepth(5);
        this.player.play('catIdle');
        this.player.setCollideWorldBounds(true);

        this.fishGroup = this.physics.add.group();
        this.goldFishGroup = this.physics.add.group();
        this.specialFishGroup = this.physics.add.group();
        this.boneGroup = this.physics.add.group();

        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '20px', fill: '#0f172a', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 3 }).setDepth(10);
        this.hpText = this.add.text(20, 50, `HP: ${this.hp} ❤️`, { fontSize: '20px', fill: '#e11d48', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 3 }).setDepth(10);
        this.timerText = this.add.text(20, 80, `Time: ${this.timeLeft}`, { fontSize: '20px', fill: '#2563eb', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 3 }).setDepth(10);

        this.isMusicMuted = false;

        const musicBtnX = 360;
        const musicBtnY = 30;
        const musicBg = this.add.circle(musicBtnX, musicBtnY, 20, 0xffffff, 0.9)
            .setDepth(10)
            .setStrokeStyle(2, 0x2563eb)
            .setInteractive({ useHandCursor: true });

        this.musicButtonText = this.add.text(musicBtnX, musicBtnY, '🔊', {
            fontSize: '18px'
        }).setOrigin(0.5).setDepth(11);

        musicBg.on('pointerover', () => {
            musicBg.setFillStyle(0x2563eb);
            musicBg.setScale(1.08);
            this.musicButtonText.setScale(1.08);
        });
        musicBg.on('pointerout', () => {
            musicBg.setFillStyle(0xffffff);
            musicBg.setScale(1.0);
            this.musicButtonText.setScale(1.0);
        });
        musicBg.on('pointerdown', () => this.toggleMusic());

        const pauseBtnX = 440;
        const pauseBtnY = 30;
        
        const pauseBg = this.add.circle(pauseBtnX, pauseBtnY, 20, 0xffffff, 0.9)
            .setDepth(10)
            .setStrokeStyle(2, 0x2563eb)
            .setInteractive({ useHandCursor: true });

        this.pauseButtonText = this.add.text(pauseBtnX, pauseBtnY, '⏸', {
            fontSize: '18px',
            fill: '#2563eb'
        }).setOrigin(0.5).setDepth(11);

        pauseBg.on('pointerover', () => {
            pauseBg.setFillStyle(0x2563eb);
            pauseBg.setScale(1.1);
            this.pauseButtonText.setFill('#ffffff');
            this.pauseButtonText.setScale(1.1);
        });
        pauseBg.on('pointerout', () => {
            pauseBg.setFillStyle(0xffffff);
            pauseBg.setScale(1.0);
            this.pauseButtonText.setFill('#2563eb');
            this.pauseButtonText.setScale(1.0);
        });
        pauseBg.on('pointerdown', () => this.togglePause());

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D'
        });

        // เก็บ Timer เป็นตัวแปรของคลาสเพื่อให้ลบออกได้ตอนจบเกม
        this.spawnTimerEvent = this.time.addEvent({
            delay: this.dataConfig.gameSettings.spawnDelay,
            callback: this.spawnItems,
            callbackScope: this,
            loop: true
        });

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

    toggleMusic() {
        const muted = !(this.game.registry.get('musicMuted') ?? false);
        this.game.registry.set('musicMuted', muted);

        if (this.backgroundMusic) {
            this.backgroundMusic.setMute(muted);
        }

        if (this.musicButtonText) {
            this.musicButtonText.setText(muted ? '🔇' : '🔊');
        }
    }

    togglePause() {
        if (this.isGameOver) return;

        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    pauseGame() {
        if (this.isPaused || this.isGameOver) return;

        this.isPaused = true;
        this.physics.world.pause();
        this.time.paused = true;
        this.player.setVelocityX(0);
        this.pauseButtonText.setText('▶');

        const overlay = this.add.rectangle(240, 320, 480, 640, 0x000000, 0.5).setDepth(20);
        const panel = this.add.rectangle(240, 320, 300, 220, 0xffffff, 0.95)
            .setDepth(21)
            .setStrokeStyle(3, 0x2563eb);
            
        const title = this.add.text(240, 245, 'GAME PAUSED', {
            fontSize: '26px',
            fill: '#0f172a',
            fontStyle: 'bold'
        }).setDepth(22).setOrigin(0.5);

        const resumeButton = this.add.text(240, 310, 'Resume Game', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#2563eb',
            padding: { x: 20, y: 10 },
            fontStyle: 'bold'
        }).setDepth(22).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const menuButton = this.add.text(240, 370, 'Main Menu', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#475569',
            padding: { x: 28, y: 10 },
            fontStyle: 'bold'
        }).setDepth(22).setOrigin(0.5).setInteractive({ useHandCursor: true });

        resumeButton.on('pointerover', () => resumeButton.setAlpha(0.8));
        resumeButton.on('pointerout', () => resumeButton.setAlpha(1.0));
        menuButton.on('pointerover', () => menuButton.setAlpha(0.8));
        menuButton.on('pointerout', () => menuButton.setAlpha(1.0));

        resumeButton.on('pointerdown', () => this.togglePause());
        menuButton.on('pointerdown', () => this.scene.start('MenuScene'));

        this.pauseMenu = [overlay, panel, title, resumeButton, menuButton];
    }

    resumeGame() {
        if (!this.isPaused || this.isGameOver) return;

        this.isPaused = false;
        this.physics.world.resume();
        this.time.paused = false;
        this.pauseButtonText.setText('⏸');

        if (this.pauseMenu) {
            this.pauseMenu.forEach((item) => item.destroy());
            this.pauseMenu = null;
        }
    }

    update(time, delta) {
        if (!this.isPaused && !this.isGameOver) {
            let scrollSpeed = 1.5;
            this.cyberGridLines.forEach(line => {
                line.y += scrollSpeed;
                if (line.y >= 640) {
                    line.y = 0;
                }
            });
        }

        if (this.isGameOver || this.isPaused) return;

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
            let goldFish = this.goldFishGroup.create(randomX, 0, 'goldFish').setScale(0.14).setDepth(4);
            goldFish.setVelocityY(Phaser.Math.Between(220, 350));
        } else if (chance <= cfg.boneMax) {
            let bone = this.boneGroup.create(randomX, 0, 'bone').setScale(0.08).setDepth(4);
            bone.setVelocityY(Phaser.Math.Between(200, 320));
            bone.body.setSize(bone.width * 0.3, bone.height * 0.3);
            bone.body.setOffset(bone.width * 0.35, bone.height * 0.35);
        } else if (chance <= cfg.specialFishMax) {
            let specialFish = this.specialFishGroup.create(randomX, 0, 'specialFish').setScale(0.14).setDepth(4);
            specialFish.setVelocityY(Phaser.Math.Between(180, 300));
        } else {
            let fish = this.fishGroup.create(randomX, 0, 'fish').setScale(0.14).setDepth(4);
            fish.setVelocityY(Phaser.Math.Between(150, 280));
        }
    }

    collectFish(player, fish) {
        fish.destroy();
        const points = (this.dataConfig.scores && this.dataConfig.scores.normalFish) || 10;
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
        this.playSfx('collect');
        this.showFloatingText(`+${points}`, player.x, player.y - 40, '#2563eb');
    }

    collectGoldFish(player, goldFish) {
        goldFish.destroy();
        const points = (this.dataConfig.scores && this.dataConfig.scores.goldFish) || 30;
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
        this.playSfx('collect');
        this.showFloatingText(`+${points}`, player.x, player.y - 40, '#d97706');
    }

    collectSpecialFish(player, specialFish) {
        specialFish.destroy();
        this.playSfx('collect');
        const bonusTime = Phaser.Math.Between(2, 5);
        this.timeLeft = Math.min(this.timeLeft + bonusTime, 99);
        this.timerText.setText('Time: ' + this.timeLeft);

        this.add.text(player.x, player.y - 40, `+${bonusTime}s`, {
            fontSize: '16px',
            fill: '#16a34a',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(15);

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
        this.showFloatingText(`-${penalty}`, player.x, player.y - 40, '#dc2626');
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
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.playSfx('win');

        // ทำลาย Timer Events ทั้งหมดทิ้งเพื่อไม่ให้ค้างตอนเล่นใหม่
        if (this.gameTimer) {
            this.gameTimer.remove();
            this.gameTimer = null;
        }
        if (this.spawnTimerEvent) {
            this.spawnTimerEvent.remove();
            this.spawnTimerEvent = null;
        }
        
        if (this.player) {
            this.player.setVelocityX(0);
        }
        
        this.fishGroup.clear(true, true);
        this.goldFishGroup.clear(true, true);
        this.specialFishGroup.clear(true, true);
        this.boneGroup.clear(true, true);

        let highScore = Number(localStorage.getItem('catGameHighScore') || 0);
        if (this.score > highScore) {
            highScore = this.score;
            localStorage.setItem('catGameHighScore', highScore);
        }

        let rect = this.add.rectangle(240, 320, 420, 280, 0xffffff, 0.95).setDepth(20);
        rect.setStrokeStyle(3, 0x2563eb);

        this.add.text(240, 210, statusText, { fontSize: '32px', fill: '#0f172a', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
        this.add.text(240, 260, 'Final Score: ' + this.score, { fontSize: '24px', fill: '#d97706', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
        this.add.text(240, 300, 'High Score: ' + highScore, { fontSize: '20px', fill: '#16a34a', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);

        let restartText = this.add.text(240, 370, 'Play Again', { fontSize: '18px', fill: '#ffffff', backgroundColor: '#2563eb', padding: 10, fontStyle: 'bold' })
            .setOrigin(0.5)
            .setDepth(21)
            .setInteractive();

        let menuText = this.add.text(240, 425, 'Main Menu', { fontSize: '18px', fill: '#ffffff', backgroundColor: '#475569', padding: 10, fontStyle: 'bold' })
            .setOrigin(0.5)
            .setDepth(21)
            .setInteractive();

        restartText.on('pointerdown', () => {
            this.scene.restart();
        });

        menuText.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    showFloatingText(text, x, y, color = '#0f172a') {
        const txt = this.add.text(x, y, text, {
            fontSize: '16px',
            fill: color,
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(15);

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