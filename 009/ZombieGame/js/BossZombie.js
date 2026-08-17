export default class BossZombie extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, stats) {
        super(scene, x, y, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.speed = stats.speed;
        this.baseDamage = stats.damage;

        this.isDead = false;
        this.isAttacking = false;
        this.canAttack = true;

        this.setScale(stats.scale).setDepth(15); 
        this.body.setSize(this.width * 0.4, this.height * 0.5); 
        this.body.setOffset(this.width * 0.3, this.height * 0.4);

        this.createBossHUD();
    }

    createBossHUD() {
        this.hudContainer = this.scene.add.container(0, 0).setDepth(200).setScrollFactor(0);
        
        this.bgBar = this.scene.add.graphics();
        this.bgBar.fillStyle(0x000000, 0.8);
        this.bgBar.fillRect(250, 20, 300, 15); 

        this.hpBar = this.scene.add.graphics();
        
        this.bossName = this.scene.add.text(400, 42, 'ซอมกลายพันธุ์', {
            fontSize: '16px', fill: '#ff0000', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.hudContainer.add([this.bgBar, this.hpBar, this.bossName]);
        this.updateBossHUD();
    }

    updateBossHUD() {
        if (this.isDead) return;

        this.hpBar.clear();
        this.hpBar.fillStyle(0xff0000, 1);
        let progress = this.hp / this.maxHp;
        let width = progress * 300; 
        if (width < 0) width = 0;
        this.hpBar.fillRect(250, 20, width, 15);
    }

    takeDamage(amount) {
        if (this.isDead) return;

        this.hp -= amount;
        this.updateBossHUD(); // 🌟 อัปเดตแค่หลอดเลือดตัวเองพอ
        this.setTint(0xffffff); 
        this.scene.time.delayedCall(100, () => this.clearTint());
        this.scene.showFloatingText(this.x, this.y, '-' + amount, '#ffcc00');

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.setVelocity(0, 0);
        this.body.enable = false; 
        this.setDepth(1);
        
        this.play('boss1_death_anim', true); 
        this.hudContainer.destroy();

        // 🌟 สั่งให้ Scene จัดเรียงหลอดเลือดบอสที่เหลืออยู่ใหม่ทั้งหมด
        this.scene.rearrangeBossHUDs();

        let dropMoney = this.scene.items.create(this.x, this.y, 'item_money').setScale(0.5).setDepth(2);
        dropMoney.itemType = 'money';
        dropMoney.value = 5000; 
        
        let dropHealth = this.scene.items.create(this.x + 50, this.y, 'item_health').setScale(0.4).setDepth(2);
        dropHealth.itemType = 'health';

        this.scene.time.delayedCall(5000, () => {
            this.scene.tweens.add({ targets: this, alpha: 0, duration: 2000, onComplete: () => this.destroy() });
        });
    }

    updateAI(player) {
        if (this.isDead || this.scene.isGameOver || this.scene.isPlayerDead) return;

        let distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        let angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.setRotation(angle - 1.57);

        if (!this.isAttacking) {
            if (distance > 150) { 
                this.scene.physics.moveToObject(this, player, this.speed);
                this.play('boss1_walk_anim', true); 
            } else {
                if (this.canAttack) {
                    this.setVelocity(0, 0);
                    this.isAttacking = true;
                    this.canAttack = false;

                    this.performAttack1(player);
                } else {
                    this.setVelocity(0, 0);
                    this.stop();
                    this.setTexture('boss1_walk_000'); 
                }
            }
        }
    }

    performAttack1(player) {
        this.play('boss1_attack1_anim', true); 
        
        this.scene.time.delayedCall(600, () => {
            if (!this.isDead && !this.scene.isGameOver) {
                let dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
                if (dist <= 180) this.scene.damagePlayer(this.baseDamage);
            }
        });

        this.scene.time.delayedCall(1200, () => {
            if (!this.isDead && !this.scene.isGameOver) {
                let dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
                if (dist <= 180) this.scene.damagePlayer(this.baseDamage);
            }
        });

        this.scene.time.delayedCall(1600, () => { 
            this.isAttacking = false; 
            this.scene.time.delayedCall(1000, () => this.canAttack = true); 
        });
    }
}