export default class GameplayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameplayScene' });
    }

    preload() {
        // โหลดไฟล์ข้อมูล JSON ของเกม
        this.load.json('gameData', 'Data/GameData.json');

        // โหลดไฟล์รูปภาพ Sprite Sheet และไอเทมต่างๆ
        this.load.spritesheet('player_spritesheet', 'Image/SPRITE_SHEET.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.image('card_common', 'Image/แกว๊ก.png');
        this.load.image('card_rare', 'Image/ตนที่1.png');
        this.load.image('card_epic', 'Image/ตนที่2.png');
        this.load.image('card_legendary', 'Image/ตนที่3.png');
        this.load.image('card_mythic', 'Image/ตนที่4.png');
        this.load.image('card_divine', 'Image/เวสลุกซ์.png');
    }

    create() {
        // ดึงค่าคอนฟิกทั้งหมดที่แยกไว้ใน JSON ออกมาใช้งาน
        this.gData = this.cache.json.get('gameData');

        this.physics.world.setBounds(0, 0, this.gData.gameConfig.worldWidth, this.gData.gameConfig.worldHeight);

        // ==================== [ Moon Gate Menu Theme (Full Screen Starfield) ] ====================
        this.add.rectangle(640, 360, 1280, 720, 0x050714);

        const deepGlow = this.add.graphics();
        deepGlow.fillStyle(0x3a0ca3, 0.15);
        deepGlow.fillCircle(640, 360, 520);
        deepGlow.fillStyle(0x4cc9f0, 0.08);
        deepGlow.fillCircle(640, 360, 320);

        const moonGateRing = this.add.graphics();
        moonGateRing.lineStyle(6, 0x7209b7, 0.35);
        moonGateRing.strokeCircle(640, 360, 280);
        moonGateRing.lineStyle(3, 0x4cc9f0, 0.5);
        moonGateRing.strokeCircle(640, 360, 255);
        moonGateRing.lineStyle(1, 0xff758f, 0.4);
        moonGateRing.strokeCircle(640, 360, 230);

        const starGfx = this.add.graphics();
        starGfx.fillStyle(0xa5f3fc, 1);
        starGfx.fillCircle(2, 2, 2);
        starGfx.generateTexture('moondust', 4, 4);
        starGfx.destroy();

        this.add.particles(0, 0, 'moondust', {
            x: { min: 0, max: 1280 },
            y: { min: 0, max: 720 },
            lifespan: { min: 4000, max: 8000 },
            scale: { start: 0.2, end: 1.5 },
            alpha: { start: 0.1, end: 0.8 },
            quantity: 2,
            frequency: 30
        });

        this.add.particles(0, 0, 'moondust', {
            x: { min: 0, max: 1280 },
            y: { min: 0, max: 720 },
            lifespan: { min: 2000, max: 5000 },
            scale: { start: 0.4, end: 1.8 },
            tint: [0xff758f, 0x4cc9f0, 0xf72585, 0x7209b7],
            alpha: { start: 0.2, end: 0.9 },
            quantity: 1,
            frequency: 60
        });
        // =========================================================================================

        this.timeLeft = this.gData.gameConfig.initialTime;
        this.score = 0;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.comboTimer = null;
        this.COMBO_TIME_LIMIT = this.gData.gameConfig.comboTimeLimit;

        this.createTextures();

        // --- สร้างอนิเมชั่นท่าไอเดิล (ยืนนิ่ง) ---
        if (!this.anims.exists('player_idle')) {
            this.anims.create({
                key: 'player_idle',
                frames: this.anims.generateFrameNumbers('player_spritesheet', { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1
            });
        }

        // --- สร้างอนิเมชั่นการเดิน ---
        if (!this.anims.exists('player_walk')) {
            this.anims.create({
                key: 'player_walk',
                frames: this.anims.generateFrameNumbers('player_spritesheet', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // --- สร้างตัวผู้เล่นโดยอ้างอิงค่าขนาดจาก JSON ---
        const pCfg = this.gData.playerConfig;
        this.player = this.physics.add.sprite(640, 360, 'player_spritesheet', 0);
        this.player.setCollideWorldBounds(true);
        this.player.setDisplaySize(pCfg.displaySize[0], pCfg.displaySize[1]);
        this.player.body.setSize(pCfg.bodySize[0], pCfg.bodySize[1]);
        this.player.body.setOffset(pCfg.bodyOffset[0], pCfg.bodyOffset[1]);

        this.player.play('player_idle');

        this.obstaclesGroup = this.physics.add.staticGroup();
        this.cardsGroup = this.physics.add.group();

        this.spawnRandomObstacles(this.gData.gameConfig.obstacleCount);
        this.spawnRandomCards(this.gData.gameConfig.cardCount);

        this.physics.add.collider(this.player, this.obstaclesGroup);
        this.physics.add.overlap(this.player, this.cardsGroup, this.collectCard, null, this);

        this.createHUD();

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.input.keyboard.on('keydown-P', this.pauseGame, this);
        this.input.keyboard.on('keydown-ESC', this.pauseGame, this);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    pauseGame() {
        this.scene.pause();
        this.scene.launch('PauseScene');
    }

    createTextures() {
        const hGraphics = this.add.graphics();
        hGraphics.fillStyle(0x0f172a, 0.95);
        hGraphics.fillRect(0, 0, 120, 40);
        hGraphics.lineStyle(2, 0x38bdf8, 0.8);
        hGraphics.strokeRect(0, 0, 120, 40);
        hGraphics.fillStyle(0x7209b7, 0.8);
        hGraphics.fillRect(10, 16, 100, 8);
        hGraphics.fillStyle(0x4cc9f0, 1);
        hGraphics.fillRect(50, 18, 20, 4);
        hGraphics.generateTexture('obs_horizontal', 120, 40);
        hGraphics.destroy();

        const vGraphics = this.add.graphics();
        vGraphics.fillStyle(0x0f172a, 0.95);
        vGraphics.fillRect(0, 0, 40, 120);
        vGraphics.lineStyle(2, 0x38bdf8, 0.8);
        vGraphics.strokeRect(0, 0, 40, 120);
        vGraphics.fillStyle(0x7209b7, 0.8);
        vGraphics.fillRect(16, 10, 8, 100);
        vGraphics.fillStyle(0x4cc9f0, 1);
        vGraphics.fillRect(18, 50, 4, 20);
        vGraphics.generateTexture('obs_vertical', 40, 120);
        vGraphics.destroy();

        const bGraphics = this.add.graphics();
        bGraphics.fillStyle(0x0f172a, 0.95);
        bGraphics.fillRect(0, 0, 80, 80);
        bGraphics.lineStyle(2, 0x7209b7, 0.9);
        bGraphics.strokeRect(0, 0, 80, 80);
        bGraphics.lineStyle(1, 0x38bdf8, 0.6);
        bGraphics.strokeRect(10, 10, 60, 60);
        bGraphics.fillStyle(0x4cc9f0, 0.8);
        bGraphics.fillCircle(40, 40, 12);
        bGraphics.fillStyle(0x050714, 1);
        bGraphics.fillCircle(40, 40, 6);
        bGraphics.generateTexture('obs_block', 80, 80);
        bGraphics.destroy();
    }

    createHUD() {
        const hudBg = this.add.graphics();
        hudBg.fillStyle(0x050714, 0.75);
        hudBg.lineStyle(2, 0x7209b7, 0.8);

        hudBg.strokeRect(20, 15, 240, 50);
        hudBg.fillRect(20, 15, 240, 50);

        hudBg.strokeRect(540, 15, 200, 50);
        hudBg.fillRect(540, 15, 200, 50);

        hudBg.strokeRect(1020, 15, 240, 50);
        hudBg.fillRect(1020, 15, 240, 50);

        const hudGlow = this.add.graphics();
        hudGlow.lineStyle(1, 0x4cc9f0, 0.6);
        hudGlow.strokeRect(22, 17, 236, 46);
        hudGlow.strokeRect(542, 17, 196, 46);
        hudGlow.strokeRect(1022, 17, 236, 46);

        this.scoreText = this.add.text(140, 40, `SCORE: 0`, {
            fontSize: '24px', 
            fill: '#fbc531', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.timerText = this.add.text(640, 40, `TIME: ${this.timeLeft}`, {
            fontSize: '26px', 
            fill: '#4cc9f0', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.comboText = this.add.text(1140, 40, ``, {
            fontSize: '24px', 
            fill: '#ff758f', 
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
    }

    calculateMultiplier(comboCount) {
        // ประมวลผลหาตัวคูณจากเกณฑ์ที่กำหนดใน JSON
        const thresholds = this.gData.comboThresholds;
        for (let t of thresholds) {
            if (comboCount >= t.minCombo) {
                return t.multiplier;
            }
        }
        return 1;
    }

    collectCard(player, card) {
        const basePoints = card.getData('points') || 10;
        
        this.combo++;
        this.comboMultiplier = this.calculateMultiplier(this.combo);

        const totalGained = basePoints * this.comboMultiplier;
        this.score += totalGained;

        this.scoreText.setText(`SCORE: ${this.score}`);
        
        let customLabel = null;
        for (let t of this.gData.comboThresholds) {
            if (this.combo >= t.minCombo && t.label) {
                customLabel = t.label;
                break;
            }
        }
        const comboLabel = customLabel ? customLabel : `COMBO (${this.combo})`;
        this.comboText.setText(`${comboLabel} x${this.comboMultiplier}`);

        this.tweens.add({
            targets: this.comboText,
            scale: { from: 1.3, to: 1 },
            duration: 200,
            ease: 'Back.out'
        });

        this.showFloatingText(card.x, card.y, `+${totalGained}`, this.comboMultiplier);

        if (this.comboTimer) this.comboTimer.remove();
        this.comboTimer = this.time.addEvent({
            delay: this.COMBO_TIME_LIMIT,
            callback: this.resetCombo,
            callbackScope: this
        });

        card.destroy();
        this.spawnSingleCard();
    }

    showFloatingText(x, y, text, multiplier) {
        let textColor = '#ffffff';
        let fontSize = '20px';

        if (multiplier >= 10) {
            textColor = '#ff0055';
            fontSize = '32px';
        } else if (multiplier >= 5) {
            textColor = '#ffa500';
            fontSize = '28px';
        } else if (multiplier >= 3) {
            textColor = '#fbc531';
            fontSize = '24px';
        }

        const floatText = this.add.text(x, y, text, {
            fontSize: fontSize,
            fill: textColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: floatText,
            y: y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => floatText.destroy()
        });
    }

    resetCombo() {
        this.combo = 0;
        this.comboMultiplier = 1;
        this.comboText.setText(``);
    }

    getRandomCardType() {
        const rand = Phaser.Math.Between(1, 100);
        const cardTypes = this.gData.cardTypes;

        for (let type of cardTypes) {
            if (rand <= type.maxChance) {
                return { key: type.key, points: type.points };
            }
        }
        return { key: 'card_common', points: 10 };
    }

    isAreaClear(x, y, minGap = 80) {
        for (let obs of this.obstaclesGroup.getChildren()) {
            const dist = Phaser.Math.Distance.Between(x, y, obs.x, obs.y);
            if (dist < minGap + 40) return false;
        }

        for (let card of this.cardsGroup.getChildren()) {
            if (card.active) {
                const dist = Phaser.Math.Distance.Between(x, y, card.x, card.y);
                if (dist < minGap) return false;
            }
        }

        if (this.player) {
            const distToPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
            if (distToPlayer < 90) return false;
        }

        return true;
    }

    spawnSingleCard() {
        let attempts = 0;
        const minCardDistance = 80;

        while (attempts < 200) {
            attempts++;
            const x = Phaser.Math.Between(70, 1280 - 70);
            const y = Phaser.Math.Between(120, 720 - 70);

            if (this.isAreaClear(x, y, minCardDistance)) {
                const cardType = this.getRandomCardType();
                const card = this.cardsGroup.create(x, y, cardType.key);
                card.setOrigin(0.5, 0.5);
                card.setData('points', cardType.points);
                
                card.setDisplaySize(48, 72);
                break;
            }
        }
    }

    spawnRandomCards(count) {
        for (let i = 0; i < count; i++) {
            this.spawnSingleCard();
        }
    }

    spawnRandomObstacles(count) {
        const types = this.gData.obstacleTypes;
        let spawned = 0;
        let attempts = 0;

        while (spawned < count && attempts < 500) {
            attempts++;
            const type = Phaser.Utils.Array.GetRandom(types);
            const x = Phaser.Math.Between(80, 1280 - 80);
            const y = Phaser.Math.Between(120, 720 - 80);

            if (this.isAreaClear(x, y, 80)) {
                const obs = this.obstaclesGroup.create(x, y, type.key);
                obs.refreshBody();
                spawned++;
            }
        }
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText(`TIME: ${this.timeLeft}`);

        if (this.timeLeft <= 10) {
            this.timerText.setFill('#ff0055');
            this.tweens.add({
                targets: this.timerText,
                scale: { from: 1.2, to: 1 },
                duration: 300
            });
        }

        if (this.timeLeft <= 0) {
            this.triggerTimeUp();
        }
    }

    triggerTimeUp() {
        this.timerEvent.remove();
        this.scene.start('VictoryScene', { finalScore: this.score });
    }

    update() {
        const speed = this.gData.gameConfig.playerSpeed;
        this.player.setVelocity(0);

        let isMoving = false;

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            isMoving = true;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            isMoving = true;
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.setVelocityY(-speed);
            isMoving = true;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.setVelocityY(speed);
            isMoving = true;
        }

        this.player.body.velocity.normalize().scale(speed);

        if (isMoving) {
            if (this.player.anims.currentAnim?.key !== 'player_walk') {
                this.player.play('player_walk', true);
            }
        } else {
            if (this.player.anims.currentAnim?.key !== 'player_idle') {
                this.player.play('player_idle', true);
            }
        }
    }
}