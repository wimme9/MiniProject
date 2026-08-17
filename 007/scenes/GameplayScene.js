// scenes/GameplayScene.js
// Core gameplay: player movement, jump, gravity, collisions, coins,
// hazards, checkpoint, timer, HP and scoring - plus all the "juice":
// particles, camera shake/flash, squash & stretch, score popups, SFX.

class GameplayScene extends Phaser.Scene {
  constructor() {
    super('GameplayScene');
  }

  create() {
    const config = this.cache.json.get('gameData');

    // Fresh, randomized, difficulty-ramped level every single time this
    // scene starts - Start, Replay and Restart all land here.
    const level = generateLevel(config.levelGen);

    // Merge the static config with the freshly generated level layout.
    this.data_ = {
      ...config,
      world: { ...config.world, width: level.worldWidth },
      ground: level.ground,
      pits: level.pits,
      platforms: level.platforms,
      coins: level.coins,
      bonusCoins: level.bonusCoins,
      spikes: level.spikes,
      checkpoints: level.checkpoints,
      goal: level.goal
    };
    const d = this.data_;

    this.score = 0;
    this.coinsCollected = 0;
    this.hp = d.player.maxHp;
    this.timeLeft = d.timeLimit;
    this.invulnerable = false;
    this.gameEnded = false;
    this.respawnPoint = { x: d.player.startX, y: d.player.startY };
    this.wasOnGround = true;
    this.timeWarningStarted = false;

    this.physics.world.setBounds(0, 0, d.world.width, d.world.height);
    this.cameras.main.setBounds(0, 0, d.world.width, d.world.height);
    this.cameras.main.fadeIn(300, 0, 0, 0);
    SFX.startMusic('gameplay');

    this.buildBackground(d);
    this.buildWorld(d);
    this.buildPlayer(d);
    this.buildUI();
    this.buildAmbience(d);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(160, 120);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,ESC');

    this.input.keyboard.on('keydown-ESC', () => this.pauseGame());

    // Timer: -1 second every 1000ms
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tickTimer()
    });
  }

  buildBackground(d) {
    // Parallax backdrop, repeated across the level width.
    const tiles = Math.ceil(d.world.width / 960) + 1;
    for (let i = 0; i < tiles; i++) {
      this.add.image(i * 960, 0, 'bg').setOrigin(0, 0).setScrollFactor(0.3);
    }

    // A slow-drifting cloud layer well behind the action for extra depth.
    const cloudCount = Math.ceil(d.world.width / 260);
    for (let i = 0; i < cloudCount; i++) {
      this.add.image(
        Phaser.Math.Between(0, d.world.width),
        Phaser.Math.Between(20, 160),
        'cloud'
      ).setAlpha(0.75).setScale(Phaser.Math.FloatBetween(0.6, 1.3)).setScrollFactor(0.12);
    }
  }

  buildWorld(d) {
    // Ground segments
    this.groundGroup = this.physics.add.staticGroup();
    d.ground.forEach(seg => {
      const cols = Math.ceil(seg.width / 64);
      for (let i = 0; i < cols; i++) {
        const tile = this.groundGroup.create(seg.x + i * 64 + 32, seg.y + 20, 'ground');
        tile.setSize(64, 40);
      }
    });

    // Ground decoration: bushes and flowers scattered along each segment,
    // purely visual (no collision), just to add color and life.
    d.ground.forEach(seg => {
      const decorCount = Math.max(1, Math.floor(seg.width / 220));
      for (let i = 0; i < decorCount; i++) {
        const dx = seg.x + Phaser.Math.FloatBetween(30, Math.max(31, seg.width - 30));
        if (Phaser.Math.Between(0, 1) === 0) {
          this.add.image(dx, seg.y - 2, 'bush').setOrigin(0.5, 1).setDepth(-1)
            .setScale(Phaser.Math.FloatBetween(0.6, 1));
        } else {
          this.add.image(dx, seg.y, 'flower').setOrigin(0.5, 1).setDepth(-1)
            .setScale(Phaser.Math.FloatBetween(0.7, 1.1));
        }
      }
    });

    // Floating platforms (with a soft shadow blob beneath each one)
    this.platformGroup = this.physics.add.staticGroup();
    d.platforms.forEach(p => {
      this.add.image(p.x + p.width / 2, p.y + p.height + 6, 'shadowBlob')
        .setDisplaySize(p.width * 0.7, 10).setAlpha(0.35).setDepth(-1);
      const plat = this.platformGroup.create(p.x + p.width / 2, p.y + p.height / 2, 'platform');
      plat.setDisplaySize(p.width, p.height);
      plat.refreshBody();
    });

    // Pits: invisible sensor zones below the level's floor
    this.pitGroup = this.physics.add.staticGroup();
    d.pits.forEach(pit => {
      const zone = this.add.zone(pit.x + pit.width / 2, d.world.height - 4, pit.width, 8);
      this.physics.add.existing(zone, true);
      this.pitGroup.add(zone);
    });

    // Coins
    this.coinGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    d.coins.forEach(c => {
      const coin = this.coinGroup.create(c.x, c.y, 'coin');
      this.tweens.add({ targets: coin, y: c.y - 8, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    // Bonus coins
    this.bonusGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    d.bonusCoins.forEach(c => {
      const coin = this.bonusGroup.create(c.x, c.y, 'bonusCoin');
      this.tweens.add({ targets: coin, angle: 360, duration: 1400, repeat: -1 });
      this.tweens.add({ targets: coin, scale: 1.15, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    // Spikes
    this.spikeGroup = this.physics.add.staticGroup();
    d.spikes.forEach(s => this.spikeGroup.create(s.x, s.y, 'spike'));

    // Checkpoints (one or more, spaced along the level)
    this.checkpointGroup = this.physics.add.staticGroup();
    d.checkpoints.forEach(cp => {
      const flag = this.checkpointGroup.create(cp.x, cp.y, 'flagDown');
      flag.body.setSize(20, 64);
      flag.setData('awarded', false);
      this.wave(flag);
    });

    // Goal
    this.goalFlag = this.physics.add.staticImage(d.goal.x, d.goal.y, 'goal');
    this.wave(this.goalFlag);
  }

  // Gentle back-and-forth rotation to make flags feel like they're waving.
  wave(target) {
    this.tweens.add({
      targets: target,
      angle: { from: -4, to: 4 },
      duration: 850 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  buildPlayer(d) {
    this.player = this.physics.add.sprite(d.player.startX, d.player.startY, 'cat_idle', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2.5);
    this.player.setSize(18, 18).setOffset(7, 10);
    this.player.setDragX(900);
    this.player.setMaxVelocity(d.player.speed, 900);
    this.player.anims.play('cat-idle');

    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.platformGroup);

    this.physics.add.overlap(this.player, this.coinGroup, this.onCollectCoin, null, this);
    this.physics.add.overlap(this.player, this.bonusGroup, this.onCollectBonus, null, this);
    this.physics.add.overlap(this.player, this.spikeGroup, this.onHitSpike, null, this);
    this.physics.add.overlap(this.player, this.pitGroup, this.onFallInPit, null, this);
    this.physics.add.overlap(this.player, this.checkpointGroup, this.onCheckpoint, null, this);
    this.physics.add.overlap(this.player, this.goalFlag, this.onReachGoal, null, this);
  }

  buildAmbience(d) {
    // A few birds gliding across the sky in a loop, well behind the action.
    this.birds = [];
    const birdCount = Math.max(3, Math.ceil(d.world.width / 700));
    for (let i = 0; i < birdCount; i++) {
      const bird = this.add.image(
        Phaser.Math.Between(0, d.world.width),
        Phaser.Math.Between(40, 140),
        'bird'
      ).setAlpha(0.7).setScale(Phaser.Math.FloatBetween(0.8, 1.3)).setScrollFactor(0.5).setDepth(-2);
      bird.speed = Phaser.Math.FloatBetween(20, 45);
      bird.flapT = Math.random() * 1000;
      this.birds.push(bird);
    }

    // Gentle ambient sparkle drifting up here and there, for a touch of magic.
    this.add.particles(0, 0, 'particleSpark', {
      x: { min: 0, max: d.world.width },
      y: { min: 0, max: d.world.height - 60 },
      lifespan: 1800,
      speedY: { min: -20, max: -8 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: [0xffffff, 0xfff0b3, 0xbfe8ff],
      quantity: 1,
      frequency: 260
    }).setDepth(-1);
  }

  buildUI() {
    this.uiLayer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

    const scorePanel = this.add.graphics();
    scorePanel.fillStyle(0xffffff, 0.55);
    scorePanel.fillRoundedRect(8, 8, 150, 34, 16);

    this.scoreText = this.add.text(20, 14, 'SCORE: 0', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', color: '#3a5a2f',
      stroke: '#ffffff', strokeThickness: 3
    });

    const heartsPanel = this.add.graphics();
    heartsPanel.fillStyle(0xffffff, 0.5);
    heartsPanel.fillRoundedRect(410, 10, this.data_.player.maxHp * 28 + 12, 30, 15);

    this.hearts = [];
    for (let i = 0; i < this.data_.player.maxHp; i++) {
      const h = this.add.image(430 + i * 28, 24, 'heartFull');
      this.hearts.push(h);
    }

    const timePanel = this.add.graphics();
    timePanel.fillStyle(0xffffff, 0.55);
    timePanel.fillRoundedRect(802, 8, 142, 34, 16);

    this.timeText = this.add.text(936, 14, 'TIME: 60', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', color: '#3a5a2f',
      stroke: '#ffffff', strokeThickness: 3
    }).setOrigin(1, 0);

    const muteIcon = () => (SFX.isMuted() ? '\uD83D\uDD07' : '\uD83D\uDD0A');
    const muteBadge = this.add.circle(944, 56, 18, 0xffffff, 0.6);
    this.muteBtn = this.add.text(944, 56, muteIcon(), { fontSize: '16px' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.muteBtn.on('pointerdown', () => {
      SFX.toggle();
      this.muteBtn.setText(muteIcon());
      if (!SFX.isMuted()) SFX.click();
    });

    this.uiLayer.add([scorePanel, this.scoreText, heartsPanel, ...this.hearts, timePanel, this.timeText, muteBadge, this.muteBtn]);
  }

  update(time, delta) {
    if (this.gameEnded) return;

    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const jump = this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown;

    // The cat art faces LEFT by default, so flip only when heading right.
    if (left) {
      this.player.setAccelerationX(-900);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setAccelerationX(900);
      this.player.setFlipX(false);
    } else {
      this.player.setAccelerationX(0);
    }

    if (jump && onGround) {
      this.player.setVelocityY(this.data_.player.jumpVelocity);
      SFX.jump();
    }

    if (onGround && !this.wasOnGround) {
      SFX.land();
    }
    this.wasOnGround = onGround;

    // Animation state machine: idle / run on the ground, jump / fall in the air.
    if (!onGround) {
      this.player.anims.play(this.player.body.velocity.y < 0 ? 'cat-jump' : 'cat-fall', true);
    } else if (left || right) {
      this.player.anims.play('cat-run', true);
    } else {
      this.player.anims.play('cat-idle', true);
    }

    // Extra safety: falling past the bottom of the world also counts as a pit fall
    if (this.player.y > this.data_.world.height + 40) {
      this.onFallInPit();
    }

    if (this.birds) {
      this.birds.forEach(bird => {
        bird.x += bird.speed * (delta / 1000);
        if (bird.x > this.data_.world.width + 40) bird.x = -40;
        bird.flapT += delta;
        bird.y += Math.sin(bird.flapT / 220) * 0.3;
      });
    }
  }

  // ---------- juice helpers ----------

  burstParticles(x, y, texture, extra, count) {
    const emitter = this.add.particles(x, y, texture, {
      speed: { min: 70, max: 190 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 450,
      quantity: count,
      frequency: -1,
      ...extra
    });
    emitter.explode(count, x, y);
    this.time.delayedCall(600, () => emitter.destroy());
  }

  scorePopup(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Arial Black, Arial', fontSize: '18px', color,
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({
      targets: t, y: y - 42, alpha: 0, duration: 700, ease: 'Cubic.easeOut',
      onComplete: () => t.destroy()
    });
  }

  pulseScoreText() {
    this.tweens.killTweensOf(this.scoreText);
    this.scoreText.setScale(1.3);
    this.tweens.add({ targets: this.scoreText, scale: 1, duration: 200, ease: 'Back.easeOut' });
  }

  // ---------- game events ----------

  tickTimer() {
    if (this.gameEnded) return;
    this.timeLeft--;
    this.timeText.setText('TIME: ' + Math.max(0, this.timeLeft));

    if (this.timeLeft <= 10 && !this.timeWarningStarted) {
      this.timeWarningStarted = true;
      this.timeText.setColor('#ff5a5a');
      this.tweens.add({ targets: this.timeText, scale: 1.18, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    if (this.timeLeft <= 0) {
      this.endGame(false, 'time');
    }
  }

  addScore(amount) {
    this.score = Math.max(0, this.score + amount);
    this.scoreText.setText('SCORE: ' + this.score);
    this.pulseScoreText();
  }

  onCollectCoin(player, coin) {
    const { x, y } = coin;
    coin.destroy();
    this.coinsCollected++;
    this.addScore(this.data_.scoring.coin);
    this.burstParticles(x, y, 'particleSpark', { tint: [0xffe14a, 0xfff0b3] }, 7);
    this.scorePopup(x, y - 10, '+' + this.data_.scoring.coin, '#ffe14a');
    SFX.coin();
  }

  onCollectBonus(player, coin) {
    const { x, y } = coin;
    coin.destroy();
    this.coinsCollected++;
    this.addScore(this.data_.scoring.bonusCoin);
    this.burstParticles(x, y, 'particleSpark', { tint: [0xffb347, 0xfff0b3, 0xffffff] }, 14);
    this.scorePopup(x, y - 12, '+' + this.data_.scoring.bonusCoin, '#ffb347');
    this.cameras.main.flash(90, 255, 210, 120);
    SFX.bonusCoin();
  }

  onHitSpike() {
    if (this.invulnerable || this.gameEnded) return;
    this.addScore(this.data_.scoring.hazardHit);
    SFX.hit();
    this.loseHp();
    // small knockback away from the spike
    this.player.setVelocity(this.player.flipX ? -200 : 200, -300);
  }

  onFallInPit() {
    if (this.gameEnded) return;
    this.addScore(this.data_.scoring.hazardHit);
    SFX.fall();
    this.loseHp();
    this.respawnPlayer();
  }

  loseHp() {
    this.hp--;
    const heart = this.hearts[this.hp];
    if (heart) heart.setTexture('heartEmpty');

    if (this.hp <= 0) {
      this.endGame(false, 'hp');
      return;
    }

    // Hurt feedback: the cat flashes red briefly and the screen shakes a touch.
    this.invulnerable = true;
    this.cameras.main.shake(120, 0.004);
    this.player.setTint(0xff4d4d);
    this.time.delayedCall(150, () => this.player.clearTint());
    this.time.delayedCall(1000, () => { this.invulnerable = false; });
  }

  respawnPlayer() {
    this.player.setPosition(this.respawnPoint.x, this.respawnPoint.y);
    this.player.setVelocity(0, 0);
  }

  onCheckpoint(player, flag) {
    if (flag.getData('awarded')) return;
    flag.setData('awarded', true);
    flag.setTexture('flagUp');
    this.respawnPoint = { x: flag.x, y: flag.y - 20 };
    this.addScore(this.data_.scoring.checkpoint);
    this.tweens.add({ targets: flag, scale: 1.35, duration: 130, yoyo: true, ease: 'Back.easeOut' });
    this.burstParticles(flag.x, flag.y - 20, 'particleSpark', { tint: [0x6fe089, 0xffffff] }, 12);
    this.scorePopup(flag.x, flag.y - 60, '+' + this.data_.scoring.checkpoint, '#6fe089');
    SFX.checkpoint();
  }

  onReachGoal() {
    if (this.gameEnded) return;
    const timeBonus = this.timeLeft * this.data_.scoring.timeBonusPerSecond;
    this.addScore(this.data_.scoring.goal);
    this.addScore(timeBonus);
    this.burstParticles(this.goalFlag.x, this.goalFlag.y - 30, 'particleConfetti',
      { tint: [0xffe14a, 0xff5252, 0x4d8fe0, 0x5cb85c, 0xffffff], gravityY: 300, rotate: { min: 0, max: 360 } }, 22);
    this.cameras.main.flash(200, 255, 255, 255);
    this.cameras.main.shake(200, 0.004);
    this.endGame(true, 'goal');
  }

  pauseGame() {
    if (this.gameEnded) return;
    SFX.pause();
    this.scene.pause();
    this.scene.launch('PauseScene', { gameplayKey: 'GameplayScene' });
  }

  endGame(won, reason) {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent.remove();

    const payload = {
      score: this.score,
      coinsCollected: this.coinsCollected,
      timeLeft: Math.max(0, this.timeLeft),
      reason
    };

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start(won ? 'VictoryScene' : 'GameOverScene', payload);
    });
  }
}