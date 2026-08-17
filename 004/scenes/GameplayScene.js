export class GameplayScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameplayScene' });

        this.floatingDecorations = [];
        this.backgroundParticles = [];
        this.heartIcons = [];

        this.aKey = null;
        this.dKey = null;
    }


    // =========================================================
    // PRELOAD
    // =========================================================

    preload() {

        this.load.json(
            'gameData',
            'data/gamedata.json'
        );

        // =====================================================
        // PLAYER
        // =====================================================

        this.load.image(
            'player',
            'asset/takla_player.png'
        );


        // =====================================================
        // ITEMS
        // =====================================================

        this.load.image(
            'fruit1',
            'asset/1.png'
        );

        this.load.image(
            'fruit2',
            'asset/2.png'
        );

        this.load.image(
            'fruit3',
            'asset/3.png'
        );

        this.load.image(
            'bonus',
            'asset/bonus.png'
        );

        this.load.image(
            'bomb',
            'asset/bomb.png'
        );


        // =====================================================
        // UI
        // =====================================================

        this.load.image(
            'heart',
            'asset/heart (2).png'
        );

        this.load.image(
            'pauseBtn',
            'asset/pausebutton.png'
        );


        // =====================================================
        // AUDIO
        // =====================================================

        this.load.audio(
            'collectSound',
            'asset/correct_answer.mp3'
        );

        this.load.audio(
            'bgm',
            'asset/game sound.mp3'
        );

        this.load.audio(
            'winSound',
            'asset/winning.mp3'
        );
    }


    // =========================================================
    // CREATE
    // =========================================================

    create() {

        const {
            width,
            height
        } = this.scale;


        // =====================================================
        // GAME DATA
        // =====================================================

        this.gameConfig =
            this.cache.json.get('gameData');


        this.score = 0;

        this.hearts =
            this.gameConfig.initialHearts;

        this.timeLeft =
            this.gameConfig.gameDuration;


        // =====================================================
        // BACKGROUND
        // =====================================================

        this.createBackground();


        // =====================================================
        // DECORATION
        // =====================================================

        this.createDecorations();


        // =====================================================
        // BOTTOM GLOW
        // =====================================================

        this.createBottomGlow();


        // =====================================================
        // BGM
        // =====================================================

        this.bgm = this.sound.add(
            'bgm',
            {
                loop: true,
                volume: 0.4
            }
        );

        this.bgm.play();


        // =====================================================
        // PLAYER
        // =====================================================

        this.player =
            this.physics.add.sprite(
                width / 2,
                height - 105,
                'player'
            );


        this.player.setCollideWorldBounds(
            true
        );


        this.player.setScale(
            0.1
        );


        // ไม่ให้ตะกร้าหลุดด้านล่าง
        this.player.setDragX(900);


        // =====================================================
        // PLAYER GLOW
        // =====================================================

        this.playerGlow =
            this.add.ellipse(
                width / 2,
                height - 62,
                120,
                25,
                0x38bdf8,
                0.18
            );


        this.playerGlow.setDepth(
            1
        );


        this.player.setDepth(
            5
        );


        // Animation ใต้ตะกร้า
        this.tweens.add({

            targets:
                this.playerGlow,

            scaleX:
                1.15,

            alpha:
                0.08,

            duration:
                900,

            yoyo:
                true,

            repeat:
                -1,

            ease:
                'Sine.easeInOut'
        });


        // =====================================================
        // KEYBOARD
        // =====================================================

        this.cursors =
            this.input.keyboard.createCursorKeys();


        this.aKey =
            this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.A
            );


        this.dKey =
            this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.D
            );


        // =====================================================
        // ITEMS GROUP
        // =====================================================

        this.itemsGroup =
            this.physics.add.group();


        // =====================================================
        // SPAWN ITEM
        // =====================================================

        this.spawnTimer =
            this.time.addEvent({

                delay:
                    900,

                callback:
                    this.spawnItem,

                callbackScope:
                    this,

                loop:
                    true
            });


        // =====================================================
        // GAME TIMER
        // =====================================================

        this.gameTimer =
            this.time.addEvent({

                delay:
                    1000,

                callback:
                    () => {

                        this.timeLeft--;

                        this.updateTimerUI();


                        if (
                            this.timeLeft <= 0
                        ) {

                            this.endGame(
                                true
                            );

                        }

                    },

                loop:
                    true
            });


        // =====================================================
        // UI
        // =====================================================

        this.createGameUI();


        // =====================================================
        // COLLISION
        // =====================================================

        this.physics.add.overlap(

            this.player,

            this.itemsGroup,

            this.collectItem,

            null,

            this

        );


        // =====================================================
        // SCREEN FADE
        // =====================================================

        this.cameras.main.fadeIn(

            700,

            7,
            11,
            24

        );
    }


    // =========================================================
    // BACKGROUND
    // =========================================================

    createBackground() {

        const {
            width,
            height
        } = this.scale;


        // =====================================================
        // BASE
        // =====================================================

        this.add.rectangle(

            width / 2,

            height / 2,

            width,

            height,

            0x07111f

        );


        // =====================================================
        // LARGE GLOW 1
        // =====================================================

        const glow1 =
            this.add.circle(

                width * 0.15,

                height * 0.20,

                350,

                0x164e63,

                0.22

            );


        // =====================================================
        // LARGE GLOW 2
        // =====================================================

        const glow2 =
            this.add.circle(

                width * 0.85,

                height * 0.65,

                400,

                0x312e81,

                0.20

            );


        // =====================================================
        // LARGE GLOW 3
        // =====================================================

        const glow3 =
            this.add.circle(

                width * 0.50,

                height * 0.85,

                350,

                0x064e3b,

                0.15

            );


        // =====================================================
        // GLOW ANIMATION
        // =====================================================

        this.tweens.add({

            targets:
                glow1,

            x:
                width * 0.28,

            y:
                height * 0.30,

            scale:
                1.2,

            duration:
                6000,

            yoyo:
                true,

            repeat:
                -1,

            ease:
                'Sine.easeInOut'
        });


        this.tweens.add({

            targets:
                glow2,

            x:
                width * 0.70,

            y:
                height * 0.50,

            scale:
                1.25,

            duration:
                7000,

            yoyo:
                true,

            repeat:
                -1,

            ease:
                'Sine.easeInOut'
        });


        this.tweens.add({

            targets:
                glow3,

            scale:
                1.15,

            alpha:
                0.08,

            duration:
                5000,

            yoyo:
                true,

            repeat:
                -1,

            ease:
                'Sine.easeInOut'
        });


        // =====================================================
        // SOFT HORIZONTAL LIGHT
        // =====================================================

        const lightLine =
            this.add.rectangle(

                width / 2,

                height * 0.32,

                width,

                2,

                0x38bdf8,

                0.08

            );


        this.tweens.add({

            targets:
                lightLine,

            alpha:
                0.25,

            duration:
                2000,

            yoyo:
                true,

            repeat:
                -1
        });


        // =====================================================
        // STARS
        // =====================================================

        for (
            let i = 0;
            i < 55;
            i++
        ) {

            const x =
                Phaser.Math.Between(
                    0,
                    width
                );

            const y =
                Phaser.Math.Between(
                    0,
                    height
                );


            const star =
                this.add.circle(

                    x,

                    y,

                    Phaser.Math.Between(
                        1,
                        3
                    ),

                    0xffffff,

                    Phaser.Math.FloatBetween(
                        0.15,
                        0.7
                    )

                );


            this.backgroundParticles.push(
                star
            );


            this.tweens.add({

                targets:
                    star,

                alpha:
                    0.05,

                scale:
                    0.3,

                duration:
                    Phaser.Math.Between(
                        1000,
                        2800
                    ),

                yoyo:
                    true,

                repeat:
                    -1,

                delay:
                    Phaser.Math.Between(
                        0,
                        1800
                    )

            });

        }
    }


    // =========================================================
    // DECORATIONS
    // =========================================================

    createDecorations() {

        const {
            width,
            height
        } = this.scale;


        const decorations = [

            {
                emoji: '🍓',
                x: 55,
                y: 190,
                size: 30
            },

            {
                emoji: '🍇',
                x: 80,
                y: 400,
                size: 28
            },

            {
                emoji: '🍍',
                x: width - 65,
                y: 220,
                size: 32
            },

            {
                emoji: '🍎',
                x: width - 80,
                y: 450,
                size: 30
            },

            {
                emoji: '✨',
                x: 115,
                y: 280,
                size: 22
            },

            {
                emoji: '✨',
                x: width - 120,
                y: 330,
                size: 22
            }

        ];


        decorations.forEach(
            (item, index) => {

                const obj =
                    this.add.text(

                        item.x,

                        item.y,

                        item.emoji,

                        {

                            fontSize:
                                `${item.size}px`

                        }

                    ).setOrigin(0.5);


                obj.setAlpha(
                    0.55
                );


                this.floatingDecorations.push(
                    obj
                );


                this.tweens.add({

                    targets:
                        obj,

                    y:
                        item.y - 15,

                    angle:
                        Phaser.Math.Between(
                            -8,
                            8
                        ),

                    duration:
                        Phaser.Math.Between(
                            2000,
                            3500
                        ),

                    yoyo:
                        true,

                    repeat:
                        -1,

                    ease:
                        'Sine.easeInOut',

                    delay:
                        index * 200

                });

            }
        );
    }


    // =========================================================
    // BOTTOM GLOW
    // =========================================================

    createBottomGlow() {

        const {
            width,
            height
        } = this.scale;


        const bottomGlow =
            this.add.ellipse(

                width / 2,

                height - 35,

                width * 0.75,

                100,

                0x0ea5e9,

                0.07

            );


        this.tweens.add({

            targets:
                bottomGlow,

            scaleX:
                1.08,

            alpha:
                0.13,

            duration:
                1800,

            yoyo:
                true,

            repeat:
                -1,

            ease:
                'Sine.easeInOut'

        });
    }


    // =========================================================
    // GAME UI
    // =========================================================

    createGameUI() {

        const {
            width,
            height
        } = this.scale;


        // =====================================================
        // TOP LEFT SCORE PANEL
        // =====================================================

        const scorePanel =
            this.add.rectangle(

                125,

                48,

                205,

                58,

                0x0f172a,

                0.88

            );


        scorePanel.setStrokeStyle(
            2,
            0x38bdf8,
            0.7
        );


        this.add.text(

            40,

            30,

            '🏆',

            {

                fontSize:
                    '24px'

            }

        );


        this.scoreText =
            this.add.text(

                75,

                33,

                `SCORE  ${this.score}`,

                {

                    fontFamily:
                        'Arial Black, Arial',

                    fontSize:
                        '19px',

                    fontStyle:
                        'bold',

                    color:
                        '#f8fafc',

                    shadow: {

                        offsetX:
                            0,

                        offsetY:
                            0,

                        color:
                            '#38bdf8',

                        blur:
                            8,

                        fill:
                            true

                    }

                }

            );


        // =====================================================
        // TIMER PANEL
        // =====================================================

        const timerPanel =
            this.add.rectangle(

                125,

                110,

                205,

                48,

                0x0f172a,

                0.88

            );


        timerPanel.setStrokeStyle(
            2,
            0xfacc15,
            0.6
        );


        this.timerText =
            this.add.text(

                125,

                110,

                `⏱️  ${this.timeLeft}s`,

                {

                    fontFamily:
                        'Arial Black, Arial',

                    fontSize:
                        '18px',

                    fontStyle:
                        'bold',

                    color:
                        '#fef08a',

                    shadow: {

                        offsetX:
                            0,

                        offsetY:
                            0,

                        color:
                            '#facc15',

                        blur:
                            8,

                        fill:
                            true

                    }

                }

            ).setOrigin(0.5);


        // =====================================================
        // HEART PANEL
        // =====================================================

        const heartPanel =
            this.add.rectangle(

                width - 130,

                48,

                210,

                58,

                0x0f172a,

                0.88

            );


        heartPanel.setStrokeStyle(
            2,
            0xfb7185,
            0.7
        );


        this.add.text(

            width - 220,

            48,

            '❤️',

            {

                fontSize:
                    '24px'

            }

        ).setOrigin(0.5);


        this.heartLabel =
            this.add.text(

                width - 175,

                38,

                'HP',

                {

                    fontFamily:
                        'Arial Black, Arial',

                    fontSize:
                        '14px',

                    fontStyle:
                        'bold',

                    color:
                        '#fda4af'

                }

            );


        // =====================================================
        // PAUSE BUTTON
        // =====================================================

        const pauseButton =
            this.add.image(

                width - 48,

                110,

                'pauseBtn'

            )
            .setInteractive({
                useHandCursor: true
            })
            .setScale(0.09);


        pauseButton.setDepth(
            20
        );


        // Glow รอบปุ่ม
        const pauseGlow =
            this.add.circle(

                width - 48,

                110,

                29,

                0x38bdf8,

                0.08

            );


        pauseGlow.setDepth(
            19
        );


        this.tweens.add({

            targets:
                pauseGlow,

            scale:
                1.25,

            alpha:
                0.02,

            duration:
                1300,

            yoyo:
                true,

            repeat:
                -1

        });


        pauseButton.on(
            'pointerover',
            () => {

                this.tweens.add({

                    targets:
                        pauseButton,

                    scale:
                        0.105,

                    duration:
                        120,

                    ease:
                        'Back.easeOut'

                });

            }
        );


        pauseButton.on(
            'pointerout',
            () => {

                this.tweens.add({

                    targets:
                        pauseButton,

                    scale:
                        0.09,

                    duration:
                        120

                });

            }
        );


        pauseButton.on(
            'pointerdown',
            () => {

                this.scene.pause();

                this.scene.launch(
                    'PauseScene'
                );

            }
        );


        // =====================================================
        // GAME MODE TEXT
        // =====================================================

        this.add.text(

            width / 2,

            30,

            '🍓  DROPPING GAME  💣',

            {

                fontFamily:
                    'Arial Black, Arial',

                fontSize:
                    '16px',

                fontStyle:
                    'bold',

                color:
                    '#67e8f9',

                shadow: {

                    offsetX:
                        0,

                    offsetY:
                        0,

                    color:
                        '#22d3ee',

                    blur:
                        10,

                    fill:
                        true

                }

            }

        ).setOrigin(0.5);


        // =====================================================
        // CONTROL HINT
        // =====================================================

        this.add.text(

            width / 2,

            height - 25,

            '←  A / D  →     CATCH THE FRUIT!',

            {

                fontFamily:
                    'Arial',

                fontSize:
                    '13px',

                fontStyle:
                    'bold',

                color:
                    '#64748b'

            }

        ).setOrigin(0.5);


        // =====================================================
        // HEART UI
        // =====================================================

        this.updateHeartsUI();
    }


    // =========================================================
    // UPDATE
    // =========================================================

    update() {

        if (
            !this.player ||
            !this.player.active
        ) {

            return;

        }


        // =====================================================
        // LEFT
        // =====================================================

        if (
            this.cursors.left.isDown ||
            this.aKey.isDown
        ) {

            this.player.setVelocityX(
                -600
            );


            this.player.setFlipX(
                true
            );

        }


        // =====================================================
        // RIGHT
        // =====================================================

        else if (
            this.cursors.right.isDown ||
            this.dKey.isDown
        ) {

            this.player.setVelocityX(
                600
            );


            this.player.setFlipX(
                false
            );

        }


        // =====================================================
        // STOP
        // =====================================================

        else {

            this.player.setVelocityX(
                0
            );

        }


        // =====================================================
        // UPDATE PLAYER GLOW
        // =====================================================

        if (this.playerGlow) {

            this.playerGlow.x =
                this.player.x;

        }


        // =====================================================
        // KEEP ITEMS INSIDE SCREEN
        // =====================================================

        this.itemsGroup.children.iterate(
            (item) => {

                if (
                    item &&
                    item.active &&
                    item.y >
                    this.scale.height + 80
                ) {

                    item.destroy();

                }

            }
        );
    }


    // =========================================================
    // SPAWN ITEM
    // =========================================================

    spawnItem() {

        if (
            !this.scene.isActive()
        ) {

            return;

        }


        const {
            width
        } = this.scale;


        const x =
            Phaser.Math.Between(
                60,
                width - 60
            );


        let selectedType;


        // =====================================================
        // RANDOM ITEM
        // =====================================================

        const roll =
            Phaser.Math.Between(
                1,
                100
            );


        // 3% BONUS
        if (
            roll <= 3
        ) {

            selectedType =
                'bonus';

        }


        // 12% BOMB
        else if (
            roll <= 15
        ) {

            selectedType =
                'bomb';

        }


        // FRUIT
        else {

            const fruitPool = [

                'fruit1',
                'fruit1',
                'fruit1',

                'fruit2',
                'fruit2',

                'fruit3'

            ];


            selectedType =
                Phaser.Math.RND.pick(
                    fruitPool
                );

        }


        // =====================================================
        // CREATE ITEM
        // =====================================================

        const item =
            this.itemsGroup.create(

                x,

                -60,

                selectedType

            );


        item.setData(
            'type',
            selectedType
        );


        item.setVelocityY(

            Phaser.Math.Between(
                250,
                450
            )

        );


        item.setScale(
            0.1
        );


        item.setDepth(
            4
        );


        // =====================================================
        // RANDOM ROTATION
        // =====================================================

        item.setAngularVelocity(

            Phaser.Math.Between(
                -100,
                100
            )

        );


        // =====================================================
        // SPECIAL ITEM EFFECT
        // =====================================================

        if (
            selectedType === 'bonus'
        ) {

            item.setScale(
                0.11
            );


            this.tweens.add({

                targets:
                    item,

                scale:
                    0.125,

                duration:
                    400,

                yoyo:
                    true,

                repeat:
                    -1,

                ease:
                    'Sine.easeInOut'

            });

        }


        if (
            selectedType === 'bomb'
        ) {

            this.tweens.add({

                targets:
                    item,

                angle:
                    360,

                duration:
                    800,

                repeat:
                    -1,

                ease:
                    'Linear'

            });

        }
    }


    // =========================================================
    // COLLECT ITEM
    // =========================================================

    collectItem(
        player,
        item
    ) {

        if (
            !item ||
            !item.active
        ) {

            return;

        }


        const type =
            item.getData(
                'type'
            );


        const x =
            item.x;


        const y =
            item.y;


        // ทำให้ไอเทมหาย
        item.destroy();


        // =====================================================
        // BOMB
        // =====================================================

        if (
            type === 'bomb'
        ) {

            this.score =
                Math.max(

                    0,

                    this.score -
                    this.gameConfig.items.bomb.penalty

                );


            this.hearts -=
                this.gameConfig.items.bomb.damage;


            this.showFloatingText(
                x,
                y,
                '-30',
                '#f87171'
            );


            this.createExplosionEffect(
                x,
                y
            );


            this.updateHeartsUI();


            // สั่นหน้าจอ
            this.cameras.main.shake(
                220,
                0.008
            );


            if (
                this.hearts <= 0
            ) {

                this.endGame(
                    false
                );

            }

        }


        // =====================================================
        // NORMAL ITEMS
        // =====================================================

        else {

            let points = 10;


            if (
                type === 'fruit2'
            ) {

                points = 20;

            }


            else if (
                type === 'fruit3'
            ) {

                points = 30;

            }


            else if (
                type === 'bonus'
            ) {

                points = 50;

            }


            this.score +=
                points;


            // =================================================
            // SCORE FLOATING TEXT
            // =================================================

            this.showFloatingText(

                x,

                y,

                `+${points}`,

                type === 'bonus'
                    ? '#facc15'
                    : '#67e8f9'

            );


            // =================================================
            // COLLECT EFFECT
            // =================================================

            this.createCollectEffect(
                x,
                y
            );


            // =================================================
            // SOUND
            // =================================================

            this.sound.play(
                'collectSound'
            );

        }


        // =====================================================
        // UPDATE SCORE
        // =====================================================

        this.scoreText.setText(

            `SCORE  ${this.score}`

        );


        // =====================================================
        // SCORE POP
        // =====================================================

        this.tweens.add({

            targets:
                this.scoreText,

            scale:
                1.15,

            duration:
                100,

            yoyo:
                true,

            ease:
                'Back.easeOut'

        });
    }


    // =========================================================
    // FLOATING SCORE TEXT
    // =========================================================

    showFloatingText(
        x,
        y,
        text,
        color
    ) {

        const floating =
            this.add.text(

                x,

                y,

                text,

                {

                    fontFamily:
                        'Arial Black, Arial',

                    fontSize:
                        '24px',

                    fontStyle:
                        'bold',

                    color:
                        color,

                    stroke:
                        '#0f172a',

                    strokeThickness:
                        4,

                    shadow: {

                        offsetX:
                            0,

                        offsetY:
                            0,

                        color:
                            color,

                        blur:
                            10,

                        fill:
                            true

                    }

                }

            ).setOrigin(0.5);


        floating.setDepth(
            20
        );


        this.tweens.add({

            targets:
                floating,

            y:
                y - 65,

            alpha:
                0,

            scale:
                1.2,

            duration:
                750,

            ease:
                'Cubic.easeOut',

            onComplete:
                () => {

                    floating.destroy();

                }

        });
    }


    // =========================================================
    // COLLECT EFFECT
    // =========================================================

    createCollectEffect(
        x,
        y
    ) {

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const particle =
                this.add.circle(

                    x,

                    y,

                    Phaser.Math.Between(
                        2,
                        5
                    ),

                    0xfacc15,

                    0.9

                );


            particle.setDepth(
                15
            );


            const targetX =
                x +
                Phaser.Math.Between(
                    -45,
                    45
                );


            const targetY =
                y +
                Phaser.Math.Between(
                    -45,
                    45
                );


            this.tweens.add({

                targets:
                    particle,

                x:
                    targetX,

                y:
                    targetY,

                alpha:
                    0,

                scale:
                    0.2,

                duration:
                    450,

                ease:
                    'Cubic.easeOut',

                onComplete:
                    () => {

                        particle.destroy();

                    }

            });

        }
    }


    // =========================================================
    // EXPLOSION EFFECT
    // =========================================================

    createExplosionEffect(
        x,
        y
    ) {

        const flash =
            this.add.circle(

                x,

                y,

                25,

                0xef4444,

                0.5

            );


        flash.setDepth(
            20
        );


        this.tweens.add({

            targets:
                flash,

            scale:
                3,

            alpha:
                0,

            duration:
                350,

            onComplete:
                () => {

                    flash.destroy();

                }

        });


        for (
            let i = 0;
            i < 14;
            i++
        ) {

            const particle =
                this.add.circle(

                    x,

                    y,

                    Phaser.Math.Between(
                        2,
                        6
                    ),

                    Phaser.Math.RND.pick([

                        0xef4444,

                        0xf97316,

                        0xfacc15

                    ])

                );


            particle.setDepth(
                20
            );


            this.tweens.add({

                targets:
                    particle,

                x:
                    x +
                    Phaser.Math.Between(
                        -80,
                        80
                    ),

                y:
                    y +
                    Phaser.Math.Between(
                        -80,
                        80
                    ),

                alpha:
                    0,

                duration:
                    500,

                ease:
                    'Cubic.easeOut',

                onComplete:
                    () => {

                        particle.destroy();

                    }

            });

        }
    }


    // =========================================================
    // HEART UI
    // =========================================================

    updateHeartsUI() {

        this.heartIcons.forEach(
            icon => {

                icon.destroy();

            }
        );


        this.heartIcons = [];


        const heartScale =
            0.045;


        const spacing =
            34;


        const startX =
            this.scale.width - 105;


        for (
            let i = 0;
            i < this.hearts;
            i++
        ) {

            const icon =
                this.add.image(

                    startX +
                    (i * spacing),

                    58,

                    'heart'

                )
                .setScale(
                    heartScale
                );


            icon.setDepth(
                21
            );


            this.heartIcons.push(
                icon
            );


            // Animation หัวใจ
            this.tweens.add({

                targets:
                    icon,

                scale:
                    heartScale * 1.08,

                duration:
                    700,

                yoyo:
                    true,

                repeat:
                    -1,

                ease:
                    'Sine.easeInOut',

                delay:
                    i * 120

            });

        }


        // =====================================================
        // DAMAGE ANIMATION
        // =====================================================

        if (
            this.hearts >= 0
        ) {

            this.heartIcons.forEach(
                icon => {

                    this.tweens.add({

                        targets:
                            icon,

                        angle:
                            8,

                        duration:
                            80,

                        yoyo:
                            true,

                        repeat:
                            2

                    });

                }
            );

        }
    }


    // =========================================================
    // TIMER UI
    // =========================================================

    updateTimerUI() {

        this.timerText.setText(

            `⏱️  ${this.timeLeft}s`

        );


        // =====================================================
        // NORMAL
        // =====================================================

        if (
            this.timeLeft > 10
        ) {

            this.timerText.setColor(
                '#fef08a'
            );

        }


        // =====================================================
        // WARNING
        // =====================================================

        else {

            this.timerText.setColor(
                '#fb7185'
            );


            this.tweens.add({

                targets:
                    this.timerText,

                scale:
                    1.15,

                duration:
                    150,

                yoyo:
                    true,

                ease:
                    'Power2'

            });


            this.cameras.main.flash(
                80,
                255,
                80,
                80,
                false
            );

        }
    }


    // =========================================================
    // END GAME
    // =========================================================

    endGame(
        isWin
    ) {

        // ป้องกันเรียกซ้ำ
        if (
            this.gameEnded
        ) {

            return;

        }


        this.gameEnded =
            true;


        // หยุด Timer
        if (
            this.gameTimer
        ) {

            this.gameTimer.remove();

        }


        // หยุด Spawn
        if (
            this.spawnTimer
        ) {

            this.spawnTimer.remove();

        }


        // หยุดเพลง
        if (
            this.bgm
        ) {

            this.bgm.stop();

        }


        // เล่นเสียงชนะ
        if (
            isWin
        ) {

            this.sound.play(
                'winSound'
            );

        }


        // =====================================================
        // SAVE SCORE
        // =====================================================

        localStorage.setItem(

            'dropping_last_score',

            this.score

        );


        // =====================================================
        // SAVE HIGH SCORE
        // =====================================================

        const oldHighScore =
            Number(

                localStorage.getItem(
                    'dropping_high_score'
                ) || 0

            );


        if (
            this.score >
            oldHighScore
        ) {

            localStorage.setItem(

                'dropping_high_score',

                this.score

            );

        }


        // =====================================================
        // SCREEN EFFECT
        // =====================================================

        if (
            isWin
        ) {

            this.cameras.main.flash(

                500,

                255,
                255,
                255

            );

        }

        else {

            this.cameras.main.shake(

                500,

                0.015

            );

        }


        // =====================================================
        // VICTORY SCENE
        // =====================================================

        this.time.delayedCall(

            350,

            () => {

                this.scene.start(

                    'VitoryScene',

                    {

                        score:
                            this.score,

                        isWin:
                            isWin

                    }

                );

            }

        );

    }

}