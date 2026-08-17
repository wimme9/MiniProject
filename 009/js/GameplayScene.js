import BossZombie from './BossZombie.js';
import Boss2Zombie from './Boss2Zombie.js';

export default class GameplayScene extends Phaser.Scene {
    constructor() {
        super('GameplayScene');
    }

    preload() {
        this.load.json('gameData', 'data/gameData.json');
        
        this.load.spritesheet('player_knife', 'img/Walk_knife.png', { frameWidth: 544, frameHeight: 404 });
        this.load.spritesheet('player_rifle', 'img/Walk_riffle.png', { frameWidth: 356, frameHeight: 588 });
        this.load.spritesheet('player_flamethrower', 'img/Walk_firethrower.png', { frameWidth: 356, frameHeight: 528 });
        this.load.spritesheet('player_pistol', 'img/Walk_gun.png', { frameWidth: 334, frameHeight: 415 });
        this.load.spritesheet('player_attack', 'img/Knife.png', { frameWidth: 740, frameHeight: 555 });
        this.load.spritesheet('player_death', 'img/death.png', { frameWidth: 600, frameHeight: 600 });
        
        this.load.image('gameover_bg', 'img/gameover.png');
        this.load.image('crosshair_normal', 'img/crosshair_normal.png');
        this.load.image('crosshair_attack', 'img/crosshair_attack.png');
        
        this.load.image('item_money', 'img/items_0013_money.png');
        this.load.image('item_ammo', 'img/items_magazine.png');
        this.load.image('item_health', 'img/items_health.png');

        this.load.image('bullet', 'img/shadows_outside.png');
        this.load.image('fire_bullet', 'img/flamethrower.png');
        this.load.image('setting_bg', 'img/setting.png');

        for (let i = 1; i <= 10; i++) {
            let skillNames = ['Rifleman', 'Pyromaniac', 'Sidearm', 'Heavy Caliber', 'Extended Mag', 'Brutal Force', 'Scavenger', 'Swift Runner', 'Vitality', 'Tri-Burst'];
            this.load.image('skill_' + i, 'img/' + skillNames[i-1] + '.png');
        }

        this.load.image('bg_grass', 'img/gass_back.jpg');
        this.load.image('leaf_1', 'img/grass_leafs.png');
        this.load.image('leaf_2', 'img/grass_leafs1.png');
        this.load.image('leaf_3', 'img/grass_leafs2.png');

        this.load.spritesheet('zombie', 'img/Zombie1_walk.png', { frameWidth: 390, frameHeight: 400 });
        this.load.spritesheet('zombie_attack', 'img/Zombie1_Attack.png', { frameWidth: 639, frameHeight: 608 });
        this.load.spritesheet('zombie_death', 'img/Zombie1_Death.png', { frameWidth: 577, frameHeight: 804 });

        this.load.spritesheet('zombie_big_walk', 'img/Zpmbie_big1.png', { frameWidth: 630, frameHeight: 613 });
        this.load.spritesheet('zombie_big_death', 'img/Zpmbie_big1_death.png', { frameWidth: 814, frameHeight: 1087 });
        this.load.image('zombie_bullet', 'img/Zpmbie_big1_bulelet.png');

        this.load.spritesheet('zombie_cop_walk', 'img/Cop_Zombie_Walk.png', { frameWidth: 503, frameHeight: 554 });
        this.load.spritesheet('zombie_cop_attack', 'img/Cop_Zombie_Attack.png', { frameWidth: 829, frameHeight: 731 });
        this.load.spritesheet('zombie_cop_death', 'img/Cop_Zombie_Death.png', { frameWidth: 628, frameHeight: 970 });

        this.load.spritesheet('zombie_army_walk', 'img/Army_zombie_Walk.png', { frameWidth: 489, frameHeight: 554 });
        this.load.spritesheet('zombie_army_attack', 'img/Army_zombie_Attack.png', { frameWidth: 828, frameHeight: 774 });
        this.load.spritesheet('zombie_army_death', 'img/Army_zombie_Death.png', { frameWidth: 655, frameHeight: 957 });

        for (let i = 0; i <= 7; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.image('boss1_walk_' + numStr, 'Boss/Walk_' + numStr + '.png');
        }
        for (let i = 0; i <= 15; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.image('boss1_attack1_' + numStr, 'Boss/attack1_' + numStr + '.png'); 
        }
        let boss1DeathNums = [0, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16];
        boss1DeathNums.forEach(i => {
            let numStr = i.toString().padStart(3, '0');
            this.load.image('boss1_death_' + numStr, 'Boss/Death_' + numStr + '.png'); 
        });

        for (let i = 0; i <= 7; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.image('boss2_walk_' + numStr, 'Boss2/Walk_' + numStr + '.png');
            this.load.image('boss2_attack1_' + numStr, 'Boss2/Attack1_' + numStr + '.png'); 
        }
        for (let i = 0; i <= 9; i++) {
            let numStr = i.toString().padStart(3, '0');
            this.load.image('boss2_death_' + numStr, 'Boss2/Death_' + numStr + '.png'); 
        }

        for (let i = 1; i <= 7; i++) {
            this.load.image('heli_' + i, 'helicopter/helicopter' + i + '.png');
        }

        this.load.audio('snd_flame', 'sound/flame_sound.mp3');
        this.load.audio('snd_pistol', 'sound/gun_studio.mp3');
        this.load.audio('snd_rifle', 'sound/riffle_studio.mp3');
        this.load.audio('snd_walk', 'sound/walking_sound.mp3');
        this.load.audio('snd_zombie1', 'sound/Zombie1_studio.mp3');
        this.load.audio('snd_zombie2', 'sound/Zpmbie_sound.mp3'); 
    }

    create() {
        this.gameData = this.cache.json.get('gameData');

        this.sndFlame = this.sound.add('snd_flame', { volume: 0.8 });
        this.sndPistol = this.sound.add('snd_pistol', { volume: 0.8 });
        this.sndRifle = this.sound.add('snd_rifle', { volume: 0.8 });
        this.sndWalk = this.sound.add('snd_walk', { volume: 0.8 });
        this.sndZombie1 = this.sound.add('snd_zombie1', { volume: 0.1 });
        this.sndZombie2 = this.sound.add('snd_zombie2', { volume: 0.2 });

        this.lastWalkSoundTime = 0;

        this.mapWidth = 2000;
        this.mapHeight = 2000;
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.add.tileSprite(0, 0, this.mapWidth, this.mapHeight, 'bg_grass').setOrigin(0, 0).setDepth(0);

        this.isAttacking = false; 
        this.isGameOver = false; 
        this.isPlayerDead = false; 
        
        this.survivedSeconds = 0; 
        this.boss1Spawned = false; 
        this.boss2Spawned = false; 
        this.heliCalled = false;   

        this.playerMaxHp = this.gameData.settings.playerHp;
        this.playerHp = this.playerMaxHp;
        this.playerSpeed = this.gameData.settings.playerSpeed;
        
        this.baseDamage = 1;
        this.rifleDamageMult = 1; 
        this.canShoot = true; 
        this.isReloading = false; 

        this.ammoStats = {
            rifle: { current: 30, max: 30, reserve: 90 },
            flamethrower: { current: 150, max: 150, reserve: 150 },
            pistol: { current: 12, max: 12, reserve: 48 }
        };

        this.playerLevel = 1;
        this.maxLevel = 10;
        this.playerMoney = 0; 
        this.expRequired = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 99999]; 
        
        this.availableSkills = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; 
        this.unlockedSkills = [];
        this.availableWeapons = ['knife']; 
        this.currentWeapon = 'knife'; 

        this.drawUI(); 

        this.anims.create({ key: 'walk_knife', frames: this.anims.generateFrameNumbers('player_knife', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_rifle', frames: this.anims.generateFrameNumbers('player_rifle', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_flamethrower', frames: this.anims.generateFrameNumbers('player_flamethrower', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_pistol', frames: this.anims.generateFrameNumbers('player_pistol', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });

        this.anims.create({ key: 'attack_knife', frames: this.anims.generateFrameNumbers('player_attack', { start: 0, end: 7 }), frameRate: 20, repeat: 0 });
        this.anims.create({ key: 'player_death_anim', frames: this.anims.generateFrameNumbers('player_death', { start: 0, end: 5 }), frameRate: 10, repeat: 0 });
        
        this.anims.create({ key: 'zombie_walk_anim', frames: this.anims.generateFrameNumbers('zombie'), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'zombie_attack_anim', frames: this.anims.generateFrameNumbers('zombie_attack'), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'zombie_death_anim', frames: this.anims.generateFrameNumbers('zombie_death'), frameRate: 8, repeat: 0 });
        
        this.anims.create({ key: 'zombie_big_walk_anim', frames: this.anims.generateFrameNumbers('zombie_big_walk'), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'zombie_big_death_anim', frames: this.anims.generateFrameNumbers('zombie_big_death'), frameRate: 8, repeat: 0 });
        
        this.anims.create({ key: 'zombie_cop_walk_anim', frames: this.anims.generateFrameNumbers('zombie_cop_walk'), frameRate: 6, repeat: -1 }); 
        this.anims.create({ key: 'zombie_cop_attack_anim', frames: this.anims.generateFrameNumbers('zombie_cop_attack'), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'zombie_cop_death_anim', frames: this.anims.generateFrameNumbers('zombie_cop_death'), frameRate: 8, repeat: 0 });

        this.anims.create({ key: 'zombie_army_walk_anim', frames: this.anims.generateFrameNumbers('zombie_army_walk'), frameRate: 14, repeat: -1 }); 
        this.anims.create({ key: 'zombie_army_attack_anim', frames: this.anims.generateFrameNumbers('zombie_army_attack'), frameRate: 15, repeat: 0 });
        this.anims.create({ key: 'zombie_army_death_anim', frames: this.anims.generateFrameNumbers('zombie_army_death'), frameRate: 10, repeat: 0 });

        let boss1WalkFrames = [];
        for (let i = 0; i <= 7; i++) boss1WalkFrames.push({ key: 'boss1_walk_' + i.toString().padStart(3, '0') });
        this.anims.create({ key: 'boss1_walk_anim', frames: boss1WalkFrames, frameRate: 8, repeat: -1 });

        let boss1AttackFrames = [];
        for (let i = 0; i <= 15; i++) boss1AttackFrames.push({ key: 'boss1_attack1_' + i.toString().padStart(3, '0') });
        this.anims.create({ key: 'boss1_attack1_anim', frames: boss1AttackFrames, frameRate: 12, repeat: 0 });

        let boss1DeathFrames = [];
        let boss1DeathNums = [0, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16];
        boss1DeathNums.forEach(i => boss1DeathFrames.push({ key: 'boss1_death_' + i.toString().padStart(3, '0') }));
        this.anims.create({ key: 'boss1_death_anim', frames: boss1DeathFrames, frameRate: 8, repeat: 0 });

        let boss2WalkFrames = [];
        for (let i = 0; i <= 7; i++) boss2WalkFrames.push({ key: 'boss2_walk_' + i.toString().padStart(3, '0') });
        this.anims.create({ key: 'boss2_walk_anim', frames: boss2WalkFrames, frameRate: 8, repeat: -1 });

        let boss2AttackFrames = [];
        for (let i = 0; i <= 7; i++) boss2AttackFrames.push({ key: 'boss2_attack1_' + i.toString().padStart(3, '0') });
        this.anims.create({ key: 'boss2_attack1_anim', frames: boss2AttackFrames, frameRate: 10, repeat: 0 });

        let boss2DeathFrames = [];
        for (let i = 0; i <= 9; i++) boss2DeathFrames.push({ key: 'boss2_death_' + i.toString().padStart(3, '0') });
        this.anims.create({ key: 'boss2_death_anim', frames: boss2DeathFrames, frameRate: 8, repeat: 0 });

        let heliFrames = [];
        for (let i = 1; i <= 7; i++) heliFrames.push({ key: 'heli_' + i });
        this.anims.create({ key: 'heli_spin_anim', frames: heliFrames, frameRate: 20, repeat: -1 }); 

        this.heli = this.physics.add.sprite(this.mapWidth + 500, -500, 'heli_1').setScale(0.6).setDepth(20);
        this.heli.setVisible(false);

        this.heliArrow = this.add.triangle(0, 0, 0, -20, 15, 15, -15, 15, 0x00ff00).setDepth(200);
        this.heliArrow.setVisible(false);

        this.extractGraphics = this.add.graphics().setDepth(14); 
        this.extractProgress = 0;
        this.isHeliLanded = false;

        this.player = this.physics.add.sprite(this.mapWidth / 2, this.mapHeight / 2, 'player_knife', 0).setScale(0.15).setDepth(10);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(150, 200); 
        this.player.body.setOffset(200, 100);

        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight); 
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1); 

        this.input.setDefaultCursor('none'); 
        this.crosshair = this.add.image(400, 300, 'crosshair_normal').setScale(0.4).setDepth(100);
        
        this.input.on('pointermove', (pointer) => {
            if (!this.isGameOver) { this.crosshair.x = pointer.worldX; this.crosshair.y = pointer.worldY; }
        });
        
        this.input.on('pointerdown', () => {
            if (!this.isAttacking && !this.isGameOver && this.canShoot && !this.isReloading) {
                this.crosshair.setTexture('crosshair_attack'); 
                this.performAttack();
            }
        });

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.isGameOver || this.isLevelingUp) return; 
            if (this.availableWeapons.length <= 1) return;
            let currentIndex = this.availableWeapons.indexOf(this.currentWeapon);
            if (deltaY > 0) { currentIndex++; if (currentIndex >= this.availableWeapons.length) currentIndex = 0; } 
            else if (deltaY < 0) { currentIndex--; if (currentIndex < 0) currentIndex = this.availableWeapons.length - 1; }
            this.switchWeapon(this.availableWeapons[currentIndex]);
        });

        this.bullets = this.physics.add.group();
        this.items = this.physics.add.group(); 
        this.zombies = this.physics.add.group(); 
        this.bossGroup = this.physics.add.group(); 
        this.enemyBullets = this.physics.add.group();
        this.obstacles = this.physics.add.staticGroup(); 

        for (let i = 0; i < 50; i++) {
            let rx = Phaser.Math.Between(100, this.mapWidth - 100);
            let ry = Phaser.Math.Between(100, this.mapHeight - 100);
            let leafType = Phaser.Math.Between(1, 3);
            let obs = this.obstacles.create(rx, ry, 'leaf_' + leafType).setScale(1.5).setDepth(5);
            obs.body.setSize(obs.width * 0.8, obs.height * 0.8);
            obs.body.setOffset(obs.width * 0.1, obs.height * 0.1);
            obs.rotation = Phaser.Math.Between(0, 360) * (Math.PI / 180); 
        }

        this.physics.add.overlap(this.bullets, this.zombies, this.bulletHitZombie, null, this);
        this.physics.add.overlap(this.bullets, this.obstacles, (bullet, obs) => {
            if (bullet.weaponType !== 'flamethrower') bullet.disableBody(true, true);
        });

        this.physics.add.overlap(this.bullets, this.bossGroup, (bullet, boss) => {
            if (!boss.isDead && bullet.active) {
                if (bullet.weaponType !== 'flamethrower') bullet.disableBody(true, true);
                boss.takeDamage(bullet.damage); 
            }
        });

        this.physics.add.collider(this.player, this.obstacles);
        this.physics.add.collider(this.zombies, this.obstacles);
        this.physics.add.collider(this.bossGroup, this.obstacles); 
        this.physics.add.collider(this.player, this.zombies); 
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.playerHitByAcid, null, this);
        
        this.currentSpawnRate = this.gameData.settings.zombieSpawnRate; 
        this.zombieSpawnTimer = this.time.addEvent({ 
            delay: this.currentSpawnRate, 
            callback: this.spawnZombie, 
            callbackScope: this, 
            loop: true 
        });

        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,R,B,N,H'); 
        this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    }

    changeZombieSpawnRate(newRate) {
        if (this.currentSpawnRate === newRate) return; 
        this.currentSpawnRate = newRate;
        
        if (this.zombieSpawnTimer) {
            this.zombieSpawnTimer.remove(); 
        }
        
        this.zombieSpawnTimer = this.time.addEvent({ 
            delay: this.currentSpawnRate, 
            callback: this.spawnZombie, 
            callbackScope: this, 
            loop: true 
        });
    }

    updateTimer() {
        if (this.isGameOver) return; 

        this.survivedSeconds++; 

        let m = Math.floor(this.survivedSeconds / 60);
        let s = this.survivedSeconds % 60;
        let timeString = m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
        
        this.timeText.setText(timeString);

        if (this.survivedSeconds === 60 && !this.boss1Spawned) {
            this.boss1Spawned = true;
            this.spawnBoss();
        }
        else if (this.survivedSeconds === 90 && !this.boss2Spawned) {
            this.boss2Spawned = true;
            this.spawnBoss2();
        }
        else if (this.survivedSeconds === 120 && !this.heliCalled) {
            this.heliCalled = true;
            this.callHelicopter();
        }
    }

    callHelicopter() {
        if (this.heli.visible) return; 
        
        this.heli.setVisible(true);
        this.heli.play('heli_spin_anim');
        
        let warnText = this.add.text(400, 200, 'EXTRACTION CHOPPER INBOUND!', { 
            fontSize: '40px', fill: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 5 
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
        this.tweens.add({ targets: warnText, alpha: 0, duration: 4000, onComplete: () => warnText.destroy() });

        this.tweens.add({
            targets: this.heli,
            x: this.mapWidth / 2,
            y: this.mapHeight / 2,
            duration: 5000, 
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.isHeliLanded = true;
            }
        });
    }

    triggerWin() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        // 🌟 ปิดเสียงเดินเมื่อชนะเกม 🌟
        if (this.sndWalk.isPlaying) {
            this.sndWalk.stop();
        }
        
        this.player.setVelocity(0, 0);
        this.player.setTint(0x00ff00); 
        this.scene.pause(); 
        
        this.scene.launch('WinScene'); 
    }

    rearrangeBossHUDs() {
        let activeBosses = this.bossGroup.getChildren().filter(b => !b.isDead);
        activeBosses.forEach((boss, index) => {
            if (boss.hudContainer) {
                boss.hudContainer.y = index * 55; 
            }
        });
    }

    damagePlayer(amount) {
        if (this.isGameOver || this.isPlayerDead) return;
        this.playerHp -= amount; 
        this.updateHealthBarUI();
        this.showFloatingText(this.player.x, this.player.y, '-' + amount, '#ff0000');
        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => this.player.clearTint());

        if (this.playerHp <= 0) { this.triggerGameOver(); } 
    }

    drawUI() {
        this.bgHealthBar = this.add.graphics().setScrollFactor(0);
        this.bgHealthBar.fillStyle(0xff0000, 1);
        this.bgHealthBar.fillRect(20, 20, 200, 20).setDepth(100);
        
        this.frontHealthBar = this.add.graphics().setScrollFactor(0);
        this.updateHealthBarUI();

        this.bgExpBar = this.add.graphics().setScrollFactor(0);
        this.bgExpBar.fillStyle(0x333333, 1); 
        this.bgExpBar.fillRect(20, 50, 200, 20).setDepth(100);
        
        this.frontExpBar = this.add.graphics().setScrollFactor(0);
        
        this.levelText = this.add.text(120, 60, 'LEVEL ' + this.playerLevel, { 
            fontSize: '16px', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.ammoText = this.add.text(20, 85, 'AMMO: ∞', { 
            fontSize: '22px', fill: '#ffff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
        }).setScrollFactor(0).setDepth(100);

        this.timeText = this.add.text(720, 30, '00:00', { 
            fontSize: '38px', fill: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 5 
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.updateExpBarUI();
    }

    updateHealthBarUI() {
        this.frontHealthBar.clear();
        this.frontHealthBar.fillStyle(0x00ff00, 1);
        let width = (this.playerHp / this.playerMaxHp) * 200;
        if (width < 0) width = 0;
        this.frontHealthBar.fillRect(20, 20, width, 20).setDepth(101);
    }

    updateExpBarUI() {
        this.frontExpBar.clear();
        this.frontExpBar.fillStyle(0xffcc00, 1); 
        let baseExp = this.expRequired[this.playerLevel - 1]; 
        let nextExp = this.expRequired[this.playerLevel]; 
        let progress = 1; 
        if (this.playerLevel < this.maxLevel) {
            progress = (this.playerMoney - baseExp) / (nextExp - baseExp);
        }
        let width = progress * 200; 
        if (width < 0) width = 0;
        if (width > 200) width = 200;
        this.frontExpBar.fillRect(20, 50, width, 20).setDepth(101);
    }

    updateAmmoUI() {
        if (this.currentWeapon === 'knife') {
            this.ammoText.setText('AMMO: ∞');
            this.ammoText.setFill('#ffff00');
        } else {
            let ammo = this.ammoStats[this.currentWeapon];
            if (this.isReloading) {
                this.ammoText.setText('RELOADING...');
                this.ammoText.setFill('#ff0000'); 
            } else {
                this.ammoText.setText(`AMMO: ${ammo.current} / ${ammo.reserve}`);
                this.ammoText.setFill(ammo.current === 0 ? '#ff0000' : '#ffff00'); 
            }
        }
    }

    reloadWeapon() {
        if (this.currentWeapon === 'knife' || this.isReloading) return;
        let ammo = this.ammoStats[this.currentWeapon];
        if (ammo.current >= ammo.max || ammo.reserve <= 0) return;

        this.isReloading = true;
        this.updateAmmoUI();

        this.time.delayedCall(1000, () => {
            if (!this.isReloading) return; 
            let needed = ammo.max - ammo.current; 
            let reloadAmount = Math.min(needed, ammo.reserve); 
            ammo.current += reloadAmount;
            ammo.reserve -= reloadAmount;
            this.isReloading = false;
            this.updateAmmoUI();
        });
    }

    switchWeapon(weaponName) {
        this.currentWeapon = weaponName;
        this.player.setTexture('player_' + weaponName, 0); 
        this.isReloading = false; 
        this.updateAmmoUI();
    }

    performAttack() {
        if (this.currentWeapon === 'knife') {
            this.isAttacking = true;
            this.player.setVelocity(0, 0); 
            this.player.play('attack_knife', true);

            this.zombies.getChildren().forEach(zombie => {
                if (zombie.active && !zombie.isDead) {
                    let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, zombie.x, zombie.y);
                    if (distance <= 80) {
                        let dmg = this.baseDamage * 2;
                        zombie.hp -= dmg; 
                        this.showFloatingText(zombie.x, zombie.y, '-' + dmg, '#ff0000');
                        zombie.setTint(0xff0000); 
                        zombie.isStunned = true;
                        let kbAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, zombie.x, zombie.y);
                        zombie.setVelocity(Math.cos(kbAngle) * 200, Math.sin(kbAngle) * 200);

                        this.time.delayedCall(200, () => { 
                            if (zombie && zombie.active) { zombie.clearTint(); zombie.isStunned = false; } 
                        });

                        if (zombie.hp <= 0) this.killZombie(zombie); 
                    }
                }
            });

            this.player.once('animationcomplete-attack_knife', () => {
                if (!this.isGameOver) {
                    this.isAttacking = false; 
                    this.player.setTexture('player_knife', 0); 
                    if(this.crosshair) this.crosshair.setTexture('crosshair_normal');
                }
            });

        } else {
            let ammo = this.ammoStats[this.currentWeapon];
            if (ammo.current <= 0) {
                if (ammo.reserve > 0) this.reloadWeapon();
                return;
            }

            ammo.current -= 1;
            this.updateAmmoUI();

            this.canShoot = false; 
            let angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.crosshair.x, this.crosshair.y);
            let bulletX = this.player.x + Math.cos(angle) * 40; 
            let bulletY = this.player.y + Math.sin(angle) * 40;

            if (this.currentWeapon === 'rifle') {
                let rDmg = this.baseDamage * this.rifleDamageMult;
                if (this.unlockedSkills.includes(10)) { 
                    let spreadAngle = 0.35; 
                    this.fireBullet(bulletX, bulletY, angle, 'bullet', rDmg, 'rifle');
                    this.fireBullet(bulletX, bulletY, angle - spreadAngle, 'bullet', rDmg, 'rifle');
                    this.fireBullet(bulletX, bulletY, angle + spreadAngle, 'bullet', rDmg, 'rifle');
                } else {
                    this.fireBullet(bulletX, bulletY, angle, 'bullet', rDmg, 'rifle');
                }
                
                // 🌟 เล่นเสียงปืนไรเฟิลทุกครั้งที่ยิง 🌟
                this.sndRifle.play(); 
                this.time.delayedCall(150, () => { this.resetCrosshair(); }); 

            } else if (this.currentWeapon === 'flamethrower') {
                this.fireBullet(bulletX, bulletY, angle, 'fire_bullet', this.baseDamage * 0.5, 'flamethrower');
                
                // 🌟 เล่นเสียงปืนไฟทุกครั้งที่ยิง 🌟
                this.sndFlame.play(); 
                this.time.delayedCall(100, () => { this.resetCrosshair(); });

            } else if (this.currentWeapon === 'pistol') {
                this.fireBullet(bulletX, bulletY, angle, 'bullet', this.baseDamage * 3, 'pistol');
                
                // 🌟 เล่นเสียงปืนพกทุกครั้งที่ยิง 🌟
                this.sndPistol.play(); 
                this.time.delayedCall(400, () => { this.resetCrosshair(); }); 
            }
        }
    }

    fireBullet(x, y, angle, imageKey, damageVal, weaponType) {
        let bulletScale = (weaponType === 'flamethrower') ? 0.3 : 0.08; 
        let bullet = this.bullets.create(x, y, imageKey).setScale(bulletScale).setDepth(8);
        bullet.damage = damageVal;
        bullet.weaponType = weaponType; 
        bullet.rotation = angle;
        
        if (weaponType === 'flamethrower') {
            this.physics.velocityFromRotation(angle, 500, bullet.body.velocity); 
        } else {
            this.physics.velocityFromRotation(angle, 700, bullet.body.velocity); 
        }
        
        this.time.delayedCall(2000, () => { if(bullet && bullet.active) bullet.destroy(); });
    }

    bulletHitZombie(bullet, zombie) {
        if (!bullet || !bullet.active || !zombie || !zombie.active || zombie.isDead) return;

        zombie.hp -= bullet.damage;
        
        if (bullet.weaponType !== 'flamethrower') {
            bullet.disableBody(true, true); 
        }
        
        this.showFloatingText(zombie.x, zombie.y, '-' + bullet.damage, '#ff0000');
        zombie.setTint(0xff0000);
        
        if (zombie.hp <= 0) {
            this.killZombie(zombie);
        } else {
            if (zombie.zombieType !== 'cop') {
                zombie.isStunned = true;
                let kbAngle = Phaser.Math.Angle.Between(bullet.x, bullet.y, zombie.x, zombie.y);
                zombie.setVelocity(Math.cos(kbAngle) * 200, Math.sin(kbAngle) * 200);

                this.time.delayedCall(150, () => { 
                    if (zombie && zombie.active) { zombie.clearTint(); zombie.isStunned = false; } 
                });
            } else {
                this.time.delayedCall(150, () => { 
                    if (zombie && zombie.active) { zombie.clearTint(); } 
                });
            }
        }
    }

    playerHitByAcid(player, acidBullet) {
        if (this.isGameOver || this.isPlayerDead) return;

        acidBullet.disableBody(true, true); 
        this.damagePlayer(this.gameData.enemies.big_zombie.damage);
    }

    showFloatingText(x, y, text, colorCode) {
        let formattedText = typeof text === 'number' && !Number.isInteger(text) ? text.toFixed(1) : text;
        let floatText = this.add.text(x, y - 30, formattedText, { 
            fontSize: '22px', fill: colorCode, fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 
        }).setOrigin(0.5).setDepth(101);
        
        this.tweens.add({ targets: floatText, y: y - 80, alpha: 0, duration: 800, onComplete: () => floatText.destroy() });
    }

    resetCrosshair() {
        this.canShoot = true;
        if(this.crosshair) this.crosshair.setTexture('crosshair_normal');
    }

    applySkill(skillId) {
        this.availableSkills = this.availableSkills.filter(id => id !== skillId);
        this.unlockedSkills.push(skillId);

        if (skillId === 1) { this.availableWeapons.push('rifle'); this.switchWeapon('rifle'); }
        if (skillId === 2) { this.availableWeapons.push('flamethrower'); this.switchWeapon('flamethrower'); }
        if (skillId === 3) { this.availableWeapons.push('pistol'); this.switchWeapon('pistol'); }
        if (skillId === 4) this.rifleDamageMult = 1.2; 
        if (skillId === 5) { this.ammoStats.pistol.max += 8; this.ammoStats.pistol.current += 8; this.updateAmmoUI(); } 
        if (skillId === 6) this.baseDamage += 1; 
        if (skillId === 7) { this.ammoStats.rifle.reserve = 150; this.ammoStats.flamethrower.reserve = 150; this.ammoStats.pistol.reserve = 150; this.updateAmmoUI(); } 
        if (skillId === 8) this.playerSpeed = 240; 
        if (skillId === 9) { this.playerMaxHp += 200; this.playerHp += 200; this.updateHealthBarUI(); }
    }

    collectItem(player, item) {
        let type = item.itemType;
        if (type === 'money') {
            this.playerMoney += item.value;
            this.updateExpBarUI(); 
        } 
        else if (type === 'ammo') {
            if (this.unlockedSkills.includes(1)) this.ammoStats.rifle.reserve = Math.min(this.ammoStats.rifle.reserve + 30, 150);
            if (this.unlockedSkills.includes(2)) this.ammoStats.flamethrower.reserve = Math.min(this.ammoStats.flamethrower.reserve + 50, 150);
            if (this.unlockedSkills.includes(3)) this.ammoStats.pistol.reserve = Math.min(this.ammoStats.pistol.reserve + 12, 150);
            this.updateAmmoUI();
            this.showFloatingText(item.x, item.y, '+AMMO', '#ffff00'); 
        } 
        else if (type === 'health') {
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 200);
            this.updateHealthBarUI();
            this.showFloatingText(item.x, item.y, '+HEALTH', '#00ff00'); 
        }
        item.destroy(); 
    }

    checkLevelUp() {
        if (this.isGameOver) return;
        if (this.playerLevel < this.maxLevel && this.playerMoney >= this.expRequired[this.playerLevel]) {
            this.playerLevel++;
            this.levelText.setText('LEVEL ' + this.playerLevel);
            this.updateExpBarUI(); 
            
            // 🌟 ปิดเสียงเดินทันทีเมื่อเด้งหน้าเลือกสกิล 🌟
            if (this.sndWalk.isPlaying) {
                this.sndWalk.stop();
            }

            this.scene.pause(); 
            this.scene.launch('SkillScene', { gameplay: this, availableSkills: this.availableSkills });
        }
    }

    spawnBoss() {
        let stats = this.gameData.enemies.boss_zombie;
        let spawnX = this.player.x + 600;
        let spawnY = this.player.y - 600;
        
        let boss = new BossZombie(this, spawnX, spawnY, 'boss1_walk_000', stats);
        this.bossGroup.add(boss);
        
        this.rearrangeBossHUDs(); 
        this.showBossWarning('WARNING: MUTANT BOSS!');
        
        this.changeZombieSpawnRate(600);
    }

    spawnBoss2() {
        let stats = this.gameData.enemies.boss2_zombie;
        let spawnX = this.player.x - 600;
        let spawnY = this.player.y + 600;
        
        let boss = new Boss2Zombie(this, spawnX, spawnY, 'boss2_walk_000', stats);
        this.bossGroup.add(boss);
        
        this.rearrangeBossHUDs(); 
        this.showBossWarning('WARNING: ARMORED BOSS!');

        this.changeZombieSpawnRate(600);
    }

    showBossWarning(text) {
        let warnText = this.add.text(400, 300, text, { 
            fontSize: '40px', fill: '#ff0000', fontStyle: 'bold', stroke: '#000000', strokeThickness: 5 
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
        this.tweens.add({ targets: warnText, alpha: 0, duration: 3000, onComplete: () => warnText.destroy() });
    }

    spawnZombie() {
        if (this.isGameOver || this.isLevelingUp) return; 

        let cam = this.cameras.main;
        let margin = 100;
        let side = Phaser.Math.Between(1, 4);
        let spawnX, spawnY;

        if (side === 1) { spawnX = Phaser.Math.Between(cam.worldView.x - margin, cam.worldView.right + margin); spawnY = cam.worldView.y - margin; } 
        else if (side === 2) { spawnX = Phaser.Math.Between(cam.worldView.x - margin, cam.worldView.right + margin); spawnY = cam.worldView.bottom + margin; } 
        else if (side === 3) { spawnX = cam.worldView.x - margin; spawnY = Phaser.Math.Between(cam.worldView.y - margin, cam.worldView.bottom + margin); } 
        else { spawnX = cam.worldView.right + margin; spawnY = Phaser.Math.Between(cam.worldView.y - margin, cam.worldView.bottom + margin); }

        spawnX = Phaser.Math.Clamp(spawnX, 0, this.mapWidth);
        spawnY = Phaser.Math.Clamp(spawnY, 0, this.mapHeight);

        let rand = Phaser.Math.Between(1, 100);
        let zombieTypeStr = 'normal';
        
        if (rand <= 15) zombieTypeStr = 'cop';
        else if (rand <= 30) zombieTypeStr = 'army';
        else if (rand <= 50) zombieTypeStr = 'big';

        let spriteKey, stats;
        
        if (zombieTypeStr === 'cop') { spriteKey = 'zombie_cop_walk'; stats = this.gameData.enemies.cop_zombie; } 
        else if (zombieTypeStr === 'army') { spriteKey = 'zombie_army_walk'; stats = this.gameData.enemies.army_zombie; } 
        else if (zombieTypeStr === 'big') { spriteKey = 'zombie_big_walk'; stats = this.gameData.enemies.big_zombie; } 
        else { spriteKey = 'zombie'; stats = this.gameData.enemies.normal_zombie; }

        let newZombie = this.zombies.create(spawnX, spawnY, spriteKey, 0).setScale(stats.scale).setDepth(5);
        newZombie.zombieType = zombieTypeStr; 
        
        if (zombieTypeStr === 'cop') { newZombie.body.setSize(350, 400); newZombie.body.setOffset(100, 70); } 
        else if (zombieTypeStr === 'army') { newZombie.body.setSize(250, 300); newZombie.body.setOffset(150, 120); } 
        else if (zombieTypeStr === 'big') { newZombie.body.setSize(450, 500); newZombie.body.setOffset(130, 60); newZombie.canShootAcid = true; } 
        else { newZombie.body.setSize(250, 300); newZombie.body.setOffset(70, 50); }
        
        newZombie.hp = stats.hp; 
        newZombie.isDead = false; 
        newZombie.isAttacking = false; 
        newZombie.canAttack = true; 
        newZombie.isStunned = false; 
        
        if (Phaser.Math.Between(1, 100) <= 50) {
            if (Phaser.Math.Between(1, 2) === 1) {
                this.sndZombie1.play();
            } else {
                this.sndZombie2.play();
            }
        }
    }

    killZombie(zombieTarget) {
        zombieTarget.isDead = true;
        zombieTarget.setVelocity(0, 0);
        zombieTarget.body.enable = false; 
        zombieTarget.setDepth(1); 
        
        if (zombieTarget.zombieType === 'cop') zombieTarget.play('zombie_cop_death_anim', true);
        else if (zombieTarget.zombieType === 'army') zombieTarget.play('zombie_army_death_anim', true);
        else if (zombieTarget.zombieType === 'big') zombieTarget.play('zombie_big_death_anim', true);
        else zombieTarget.play('zombie_death_anim', true);

        let dropChance = Phaser.Math.Between(1, 100);
        let dropType, imageKey, scaleSize;

        if (zombieTarget.zombieType === 'cop') {
            if (dropChance <= 40) { dropType = 'health'; imageKey = 'item_health'; scaleSize = 0.3; }
            else if (dropChance <= 70) { dropType = 'ammo'; imageKey = 'item_ammo'; scaleSize = 0.3; }
            else { dropType = 'money'; imageKey = 'item_money'; scaleSize = 0.25; }
        } else if (zombieTarget.zombieType === 'army' || zombieTarget.zombieType === 'big') {
            if (dropChance <= 50) { dropType = 'ammo'; imageKey = 'item_ammo'; scaleSize = 0.3; }
            else { dropType = 'health'; imageKey = 'item_health'; scaleSize = 0.3; }
        } else {
            if (dropChance <= 60) { dropType = 'money'; imageKey = 'item_money'; scaleSize = 0.2; }
            else if (dropChance <= 85) { dropType = 'ammo'; imageKey = 'item_ammo'; scaleSize = 0.3; }
            else { dropType = 'health'; imageKey = 'item_health'; scaleSize = 0.3; }
        }

        let dropItem = this.items.create(zombieTarget.x, zombieTarget.y, imageKey).setScale(scaleSize).setDepth(2);
        dropItem.itemType = dropType;
        if (dropType === 'money') dropItem.value = zombieTarget.zombieType === 'cop' ? Phaser.Math.Between(100, 300) : Phaser.Math.Between(10, 100); 

        this.time.delayedCall(2000, () => {
            if (zombieTarget && zombieTarget.active) this.tweens.add({ targets: zombieTarget, alpha: 0, duration: 2000, onComplete: () => { zombieTarget.destroy(); } });
        });
    }

    triggerGameOver() {
        if (this.isPlayerDead) return; 
        this.isPlayerDead = true; 
        this.isGameOver = true; 

        // 🌟 ปิดเสียงเดินเมื่อตาย 🌟
        if (this.sndWalk.isPlaying) {
            this.sndWalk.stop();
        }

        this.player.setVelocity(0, 0); 
        this.player.body.enable = false; 
        this.player.clearTint();
        this.player.setOrigin(0.5, 0.25); 

        this.input.setDefaultCursor('default');
        if (this.crosshair) this.crosshair.setVisible(false);

        this.player.play('player_death_anim', true);
        
        this.zombies.getChildren().forEach(zombie => {
            if (zombie.active) { zombie.setVelocity(0, 0); zombie.stop(); }
        });

        this.player.once('animationcomplete-player_death_anim', () => {
            this.scene.pause(); 
            this.scene.launch('GameOverScene'); 
        });
    }

    update() {
        this.checkLevelUp();
        if (this.scene.isPaused()) return; 

        if (Phaser.Input.Keyboard.JustDown(this.tabKey) && !this.isGameOver) {
            // 🌟 ปิดเสียงเดินเมื่อกด Tab เข้า Setting 🌟
            if (this.sndWalk.isPlaying) {
                this.sndWalk.stop();
            }
            this.scene.pause(); 
            this.input.setDefaultCursor('default'); 
            if (this.crosshair) this.crosshair.setVisible(false); 
            this.scene.launch('SettingScene', { gameplay: this });
            return; 
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.H) && !this.isGameOver) this.callHelicopter(); 
        if (Phaser.Input.Keyboard.JustDown(this.keys.B) && !this.isGameOver) this.spawnBoss();
        if (Phaser.Input.Keyboard.JustDown(this.keys.N) && !this.isGameOver) this.spawnBoss2();

        if (Phaser.Input.Keyboard.JustDown(this.keys.R) && !this.isGameOver) this.reloadWeapon();
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('K')) && !this.isGameOver) { this.playerHp = 0; this.updateHealthBarUI(); this.triggerGameOver(); return; }

        if (this.isGameOver) return; 

        let cam = this.cameras.main;
        this.crosshair.x = Phaser.Math.Clamp(this.crosshair.x, cam.worldView.x, cam.worldView.right);
        this.crosshair.y = Phaser.Math.Clamp(this.crosshair.y, cam.worldView.y, cam.worldView.bottom);

        let pointer = this.input.activePointer;
        let playerAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
        this.player.setRotation(playerAngle - 1.57);

        if (!this.isAttacking) {
            let vx = 0, vy = 0;
            if (this.cursors.left.isDown || this.keys.A.isDown) vx = -this.playerSpeed;
            else if (this.cursors.right.isDown || this.keys.D.isDown) vx = this.playerSpeed;
            if (this.cursors.up.isDown || this.keys.W.isDown) vy = -this.playerSpeed;
            else if (this.cursors.down.isDown || this.keys.S.isDown) vy = this.playerSpeed;
            this.player.setVelocity(vx, vy);

            if (vx !== 0 || vy !== 0) {
                this.player.play('walk_' + this.currentWeapon, true);
                
                if (this.time.now > this.lastWalkSoundTime + 2000) {
                    this.sndWalk.play();
                    this.lastWalkSoundTime = this.time.now;
                }
            } else { 
                this.player.stop(); 
                this.player.setTexture('player_' + this.currentWeapon, 0); 
                
                if (this.sndWalk.isPlaying) {
                    this.sndWalk.stop();
                }
                this.lastWalkSoundTime = 0;
            }
        }

        if (this.heli.visible && !this.isGameOver) {
            let angleToHeli = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.heli.x, this.heli.y);
            let distToHeli = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.heli.x, this.heli.y);

            if (distToHeli > 300) {
                this.heliArrow.setVisible(true);
                this.heliArrow.x = this.player.x + Math.cos(angleToHeli) * 150;
                this.heliArrow.y = this.player.y + Math.sin(angleToHeli) * 150;
                this.heliArrow.rotation = angleToHeli + 1.57; 
            } else {
                this.heliArrow.setVisible(false);
            }

            if (this.isHeliLanded) {
                this.extractGraphics.clear();
                let extractRadius = 180;

                this.extractGraphics.lineStyle(4, 0x00ff00, 0.8);
                this.extractGraphics.strokeCircle(this.heli.x, this.heli.y, extractRadius);

                if (distToHeli <= extractRadius) {
                    this.extractProgress += 1; 
                    let maxProgress = 180;

                    this.extractGraphics.fillStyle(0x00ff00, 0.4);
                    this.extractGraphics.beginPath();
                    this.extractGraphics.moveTo(this.heli.x, this.heli.y);
                    this.extractGraphics.arc(this.heli.x, this.heli.y, extractRadius, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + (360 * (this.extractProgress / maxProgress))), false);
                    this.extractGraphics.closePath();
                    this.extractGraphics.fillPath();

                    if (this.extractProgress >= maxProgress) {
                        this.triggerWin(); 
                    }
                } else {
                    this.extractProgress = 0; 
                }
            }
        }

        let activeBosses = this.bossGroup.getChildren().filter(b => !b.isDead);
        if (activeBosses.length === 0 && this.currentSpawnRate !== this.gameData.settings.zombieSpawnRate) {
            this.changeZombieSpawnRate(this.gameData.settings.zombieSpawnRate);
        }

        this.bossGroup.getChildren().forEach(boss => {
            if (boss.active) {
                boss.updateAI(this.player);
            }
        });

        this.zombies.getChildren().forEach(zombie => {
            if (zombie && zombie.active && !zombie.isDead) {
                let distance = Phaser.Math.Distance.Between(zombie.x, zombie.y, this.player.x, this.player.y);
                let zombieAngle = Phaser.Math.Angle.Between(zombie.x, zombie.y, this.player.x, this.player.y);
                zombie.setRotation(zombieAngle - 1.57);

                if (!zombie.isAttacking && !zombie.isStunned) { 
                    let stats;
                    if (zombie.zombieType === 'cop') stats = this.gameData.enemies.cop_zombie;
                    else if (zombie.zombieType === 'army') stats = this.gameData.enemies.army_zombie;
                    else if (zombie.zombieType === 'big') stats = this.gameData.enemies.big_zombie;
                    else stats = this.gameData.enemies.normal_zombie;

                    if (zombie.zombieType === 'big') {
                        if (distance > 350) {
                            this.physics.moveToObject(zombie, this.player, stats.speed); 
                            zombie.play('zombie_big_walk_anim', true);
                        } 
                        else if (distance > 100) {
                            zombie.setVelocity(0, 0);
                            zombie.stop(); 
                            zombie.setTexture('zombie_big_walk', 0); 
                            
                            if (zombie.canShootAcid) {
                                zombie.canShootAcid = false;
                                let acidX = zombie.x + Math.cos(zombieAngle) * 50;
                                let acidY = zombie.y + Math.sin(zombieAngle) * 50;
                                let acidBullet = this.enemyBullets.create(acidX, acidY, 'zombie_bullet').setScale(0.15).setDepth(8);
                                
                                acidBullet.rotation = zombieAngle - 1.57;
                                
                                this.physics.velocityFromRotation(zombieAngle, 300, acidBullet.body.velocity);
                                this.time.delayedCall(3000, () => { if(acidBullet && acidBullet.active) acidBullet.destroy(); });
                                this.time.delayedCall(2000, () => { if(zombie && zombie.active) zombie.canShootAcid = true; });
                            }
                        } 
                        else {
                            let escapeAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, zombie.x, zombie.y);
                            this.physics.velocityFromRotation(escapeAngle, stats.speed - 10, zombie.body.velocity);
                            zombie.play('zombie_big_walk_anim', true); 
                        }
                    } 
                    else {
                        if (distance > 50) {
                            this.physics.moveToObject(zombie, this.player, stats.speed);
                            
                            if (zombie.zombieType === 'cop') zombie.play('zombie_cop_walk_anim', true);
                            else if (zombie.zombieType === 'army') zombie.play('zombie_army_walk_anim', true);
                            else zombie.play('zombie_walk_anim', true);
                        } else {
                            if (zombie.canAttack) {
                                zombie.setVelocity(0, 0); 
                                zombie.isAttacking = true;
                                zombie.canAttack = false; 
                                
                                if (zombie.zombieType === 'cop') zombie.play('zombie_cop_attack_anim', true);
                                else if (zombie.zombieType === 'army') zombie.play('zombie_army_attack_anim', true);
                                else zombie.play('zombie_attack_anim', true);

                                this.damagePlayer(stats.damage);

                                let animKey = zombie.zombieType === 'cop' ? 'animationcomplete-zombie_cop_attack_anim' : 
                                              zombie.zombieType === 'army' ? 'animationcomplete-zombie_army_attack_anim' : 
                                              'animationcomplete-zombie_attack_anim';
                                              
                                let textureKey = zombie.zombieType === 'cop' ? 'zombie_cop_walk' : 
                                                 zombie.zombieType === 'army' ? 'zombie_army_walk' : 
                                                 'zombie';
                                
                                zombie.once(animKey, () => {
                                    if (zombie && zombie.active) {
                                        zombie.isAttacking = false;
                                        zombie.setTexture(textureKey, 0);
                                        this.time.delayedCall(1500, () => { if (zombie && zombie.active) zombie.canAttack = true; });
                                    }
                                });
                            } else { zombie.setVelocity(0, 0); zombie.stop(); }
                        }
                    }
                }
            }
        });
    }
}