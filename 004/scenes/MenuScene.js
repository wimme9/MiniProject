export class MenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MenuScene' });

        this.floatingObjects = [];
    }


    create() {

        const { width, height } = this.scale;


        // =====================================================
        // 1. BACKGROUND
        // =====================================================

        this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x070b18
        );


        // =====================================================
        // 2. BACKGROUND GLOW
        // =====================================================

        const glow1 = this.add.circle(
            width * 0.20,
            height * 0.28,
            300,
            0x243b80,
            0.18
        );

        const glow2 = this.add.circle(
            width * 0.80,
            height * 0.68,
            350,
            0x5b214f,
            0.15
        );


        // แสงวงกลมดวงที่ 1 เคลื่อนที่
        this.tweens.add({

            targets: glow1,

            x: width * 0.35,
            y: height * 0.38,

            scale: 1.15,

            duration: 5000,

            yoyo: true,

            repeat: -1,

            ease: 'Sine.easeInOut'
        });


        // แสงวงกลมดวงที่ 2 เคลื่อนที่
        this.tweens.add({

            targets: glow2,

            x: width * 0.65,
            y: height * 0.58,

            scale: 1.2,

            duration: 6000,

            yoyo: true,

            repeat: -1,

            ease: 'Sine.easeInOut'
        });


        // =====================================================
        // 3. PARTICLES / STARS
        // =====================================================

        for (let i = 0; i < 35; i++) {

            const x = Phaser.Math.Between(0, width);

            const y = Phaser.Math.Between(0, height);

            const star = this.add.circle(

                x,

                y,

                Phaser.Math.Between(1, 3),

                0xffffff,

                Phaser.Math.FloatBetween(0.2, 0.8)

            );


            this.tweens.add({

                targets: star,

                alpha: 0.1,

                scale: 0.3,

                duration: Phaser.Math.Between(
                    1200,
                    2500
                ),

                yoyo: true,

                repeat: -1,

                delay: Phaser.Math.Between(
                    0,
                    1500
                )
            });
        }


        // =====================================================
        // 4. FLOATING FRUIT / HAZARDS
        // =====================================================

        const floatingItems = [

            {
                emoji: '🍓',
                x: 120,
                y: 150,
                size: 55
            },

            {
                emoji: '🍍',
                x: width - 130,
                y: 180,
                size: 55
            },

            {
                emoji: '🍇',
                x: 160,
                y: height - 150,
                size: 52
            },

            {
                emoji: '🍎',
                x: width - 150,
                y: height - 180,
                size: 50
            },

            {
                emoji: '💣',
                x: width - 300,
                y: 130,
                size: 48
            },

            {
                emoji: '🍓',
                x: 300,
                y: height - 100,
                size: 42
            }

        ];


        floatingItems.forEach((item, index) => {

            const obj = this.add.text(

                item.x,

                item.y,

                item.emoji,

                {
                    fontSize: `${item.size}px`
                }

            ).setOrigin(0.5);


            this.floatingObjects.push(obj);


            this.tweens.add({

                targets: obj,

                y: item.y -
                    Phaser.Math.Between(
                        15,
                        35
                    ),

                angle: Phaser.Math.Between(
                    -8,
                    8
                ),

                duration: Phaser.Math.Between(
                    1800,
                    3000
                ),

                yoyo: true,

                repeat: -1,

                ease: 'Sine.easeInOut',

                delay: index * 250

            });

        });


        // =====================================================
        // 5. GAME TITLE
        // =====================================================

        const titleGlow = this.add.text(

            width / 2,

            height * 0.14,

            'DROPPING GAME',

            {

                fontFamily:
                    'Arial Black, Arial',

                fontSize:
                    '64px',

                fontStyle:
                    'bold',

                color:
                    '#ffffff',

                stroke:
                    '#ff4d9d',

                strokeThickness:
                    10,

                shadow: {

                    offsetX: 0,

                    offsetY: 0,

                    color:
                        '#ff4d9d',

                    blur:
                        25,

                    fill:
                        true
                }

            }

        ).setOrigin(0.5);


        const title = this.add.text(

            width / 2,

            height * 0.14,

            'DROPPING GAME',

            {

                fontFamily:
                    'Arial Black, Arial',

                fontSize:
                    '60px',

                fontStyle:
                    'bold',

                color:
                    '#ffffff',

                stroke:
                    '#172554',

                strokeThickness:
                    5,

                shadow: {

                    offsetX: 0,

                    offsetY: 5,

                    color:
                        '#000000',

                    blur:
                        10,

                    fill:
                        true
                }

            }

        ).setOrigin(0.5);


        // =====================================================
        // TITLE GLOW ANIMATION
        // =====================================================

        this.tweens.add({

            targets:
                titleGlow,

            alpha:
                0.35,

            scale:
                1.04,

            duration:
                1300,

            yoyo:
                true,

            repeat:
                -1,

            ease:
                'Sine.easeInOut'
        });


        this.tweens.add({

            targets:
                title,

            scale:
                1.015,

            duration:
                1300,

            yoyo:
                true,

            repeat:
                -1,

            ease:
                'Sine.easeInOut'
        });


        // =====================================================
        // 6. SUBTITLE
        // =====================================================

        this.add.text(

            width / 2,

            height * 0.215,

            '🍓  CATCH THE FRUIT • AVOID THE BOMBS  💣',

            {

                fontFamily:
                    'Arial',

                fontSize:
                    '16px',

                fontStyle:
                    'bold',

                color:
                    '#67e8f9',

                shadow: {

                    offsetX: 0,

                    offsetY: 0,

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
        // 7. CENTER GAME DISPLAY PANEL
        // =====================================================

        const panel = this.add.rectangle(

            width / 2,

            height * 0.40,

            540,

            165,

            0x111827,

            0.92

        );


        panel.setStrokeStyle(
            2,
            0x334155
        );


        // =====================================================
        // 8. PANEL GLOW
        // =====================================================

        const panelGlow = this.add.rectangle(

            width / 2,

            height * 0.40,

            550,

            175,

            0x38bdf8,

            0.03

        );


        panelGlow.setStrokeStyle(
            1,
            0x38bdf8,
            0.25
        );


        this.tweens.add({

            targets:
                panelGlow,

            alpha:
                0.4,

            duration:
                1600,

            yoyo:
                true,

            repeat:
                -1,

            ease:
                'Sine.easeInOut'
        });


        // =====================================================
        // 9. BASKET
        // =====================================================

        const basket = this.add.text(

            width / 2,

            height * 0.405,

            '🧺',

            {

                fontSize:
                    '70px'
            }

        ).setOrigin(0.5);


        this.tweens.add({

            targets:
                basket,

            y:
                height * 0.405 - 10,

            duration:
                1200,

            yoyo:
                true,

            repeat:
                -1,

            ease:
                'Sine.easeInOut'
        });


        // =====================================================
        // 10. FALLING FRUIT
        // =====================================================
        // ไม่ใช้ onRepeat เปลี่ยน X แบบทันที
        // เพื่อป้องกันผลไม้วาร์ป/กระตุก
        // =====================================================

        const fallingFruit = this.add.text(

            width / 2 - 100,

            height * 0.30,

            '🍓',

            {

                fontSize:
                    '35px'
            }

        ).setOrigin(0.5);


        const fruitStartY =
            height * 0.30;

        const fruitEndY =
            height * 0.405;


        // ฟังก์ชันปล่อยผลไม้
        const dropFruit = () => {

            // ตำแหน่งเป้าหมายใหม่
            const targetX =
                width / 2 +
                Phaser.Math.Between(
                    -170,
                    170
                );


            // เริ่มต้นด้านบน
            fallingFruit.x =
                width / 2 +
                Phaser.Math.Between(
                    -120,
                    120
                );

            fallingFruit.y =
                fruitStartY;


            // Animation เคลื่อนที่ลง
            this.tweens.add({

                targets:
                    fallingFruit,

                x:
                    targetX,

                y:
                    fruitEndY,

                duration:
                    1000,

                ease:
                    'Quad.easeIn',

                onComplete: () => {

                    // รอเล็กน้อย
                    this.time.delayedCall(
                        250,
                        () => {

                            dropFruit();

                        }
                    );

                }

            });

        };


        // เริ่มต้น Animation
        dropFruit();


        // =====================================================
        // 11. BOMB
        // =====================================================

        const bomb = this.add.text(

            width / 2 + 150,

            height * 0.33,

            '💣',

            {

                fontSize:
                    '35px'
            }

        ).setOrigin(0.5);


        // หมุน
        this.tweens.add({

            targets:
                bomb,

            angle:
                360,

            duration:
                3500,

            repeat:
                -1,

            ease:
                'Linear'
        });


        // ลอยขึ้นลง
        this.tweens.add({

            targets:
                bomb,

            y:
                height * 0.33 - 8,

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
        // 12. START GAME BUTTON
        // =====================================================

        const startButton = this.add.rectangle(

            width / 2,

            height * 0.62,

            330,

            70,

            0x10b981

        )
        .setInteractive({
            useHandCursor: true
        })
        .setStrokeStyle(
            3,
            0x6ee7b7
        );


        const startText = this.add.text(

            width / 2,

            height * 0.62,

            '▶  START GAME',

            {

                fontFamily:
                    'Arial Black, Arial',

                fontSize:
                    '25px',

                fontStyle:
                    'bold',

                color:
                    '#ffffff',

                shadow: {

                    offsetX: 0,

                    offsetY: 3,

                    color:
                        '#064e3b',

                    blur:
                        5,

                    fill:
                        true
                }

            }

        ).setOrigin(0.5);


        // =====================================================
        // START BUTTON PULSE
        // =====================================================

        this.tweens.add({

            targets:
                [
                    startButton,
                    startText
                ],

            scaleX:
                1.025,

            scaleY:
                1.025,

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
        // START BUTTON HOVER
        // =====================================================

        startButton.on(
            'pointerover',
            () => {

                startButton.setFillStyle(
                    0x22c55e
                );

                startButton.setStrokeStyle(
                    3,
                    0xd1fae5
                );


                this.tweens.add({

                    targets:
                        [
                            startButton,
                            startText
                        ],

                    scaleX:
                        1.08,

                    scaleY:
                        1.08,

                    duration:
                        150,

                    ease:
                        'Back.easeOut'
                });

            }
        );


        startButton.on(
            'pointerout',
            () => {

                startButton.setFillStyle(
                    0x10b981
                );

                startButton.setStrokeStyle(
                    3,
                    0x6ee7b7
                );


                this.tweens.add({

                    targets:
                        [
                            startButton,
                            startText
                        ],

                    scaleX:
                        1,

                    scaleY:
                        1,

                    duration:
                        150

                });

            }
        );


        // =====================================================
        // START BUTTON CLICK
        // =====================================================

        startButton.on(
            'pointerdown',
            () => {

                // Flash Screen
                this.cameras.main.flash(
                    250,
                    255,
                    255,
                    255
                );


                // กดแล้วหด
                this.tweens.add({

                    targets:
                        [
                            startButton,
                            startText
                        ],

                    scaleX:
                        0.9,

                    scaleY:
                        0.9,

                    duration:
                        100,

                    yoyo:
                        true,

                    onComplete:
                        () => {

                            this.scene.start(
                                'GameplayScene'
                            );

                        }

                });

            }
        );


        // =====================================================
        // 13. HOW TO PLAY BUTTON
        // =====================================================

        const howButton = this.add.text(

            width / 2,

            height * 0.735,

            '📖  HOW TO PLAY',

            {

                fontFamily:
                    'Arial',

                fontSize:
                    '17px',

                fontStyle:
                    'bold',

                color:
                    '#facc15',

                shadow: {

                    offsetX: 0,

                    offsetY: 0,

                    color:
                        '#facc15',

                    blur:
                        8,

                    fill:
                        true
                }

            }

        )
        .setOrigin(0.5)
        .setInteractive({
            useHandCursor: true
        });


        // Hover
        howButton.on(
            'pointerover',
            () => {

                howButton.setColor(
                    '#ffffff'
                );

                howButton.setScale(
                    1.08
                );

            }
        );


        howButton.on(
            'pointerout',
            () => {

                howButton.setColor(
                    '#facc15'
                );

                howButton.setScale(
                    1
                );

            }
        );


        // Click
        howButton.on(
            'pointerdown',
            () => {

                this.showHowToPlay();

            }
        );


        // =====================================================
        // 14. HIGH SCORE
        // =====================================================

        const highScore =
            localStorage.getItem(
                'dropping_high_score'
            ) || 0;


        this.add.text(

            width / 2,

            height * 0.825,

            `🏆  HIGH SCORE   ${highScore}`,

            {

                fontFamily:
                    'Arial Black, Arial',

                fontSize:
                    '19px',

                fontStyle:
                    'bold',

                color:
                    '#fbbf24',

                shadow: {

                    offsetX: 0,

                    offsetY: 0,

                    color:
                        '#f59e0b',

                    blur:
                        10,

                    fill:
                        true
                }

            }

        ).setOrigin(0.5);


        // =====================================================
        // 15. CONTROL INFO
        // =====================================================

        this.add.text(

            width / 2,

            height * 0.925,

            '←  A / D  →       •       60 SECONDS       •       ARCADE MODE',

            {

                fontFamily:
                    'Arial',

                fontSize:
                    '13px',

                color:
                    '#94a3b8',

                fontStyle:
                    'bold'
            }

        ).setOrigin(0.5);


        // =====================================================
        // 16. SCREEN FADE IN
        // =====================================================

        this.cameras.main.fadeIn(

            700,

            7,
            11,
            24

        );

    }


    // =========================================================
    // HOW TO PLAY POPUP
    // =========================================================

    showHowToPlay() {

        const {
            width,
            height
        } = this.scale;


        // =====================================================
        // OVERLAY
        // =====================================================

        const overlay =
            this.add.rectangle(

                width / 2,

                height / 2,

                width,

                height,

                0x000000,

                0.78

            )
            .setInteractive();


        // =====================================================
        // POPUP
        // =====================================================

        const popup =
            this.add.rectangle(

                width / 2,

                height / 2,

                600,

                470,

                0x111827,

                1

            );


        popup.setStrokeStyle(
            3,
            0x38bdf8
        );


        // =====================================================
        // POPUP TITLE
        // =====================================================

        const title =
            this.add.text(

                width / 2,

                height * 0.28,

                '📖 HOW TO PLAY',

                {

                    fontFamily:
                        'Arial Black, Arial',

                    fontSize:
                        '30px',

                    fontStyle:
                        'bold',

                    color:
                        '#67e8f9',

                    shadow: {

                        offsetX: 0,

                        offsetY: 0,

                        color:
                            '#22d3ee',

                        blur:
                            15,

                        fill:
                            true
                    }

                }

            ).setOrigin(0.5);


        // =====================================================
        // INSTRUCTIONS
        // =====================================================

        const instructions =
            this.add.text(

                width / 2,

                height * 0.48,

                '← / → หรือ A / D\n' +

                'เคลื่อนที่ตะกร้าไปทางซ้ายและขวา\n\n' +

                '🍓  ผลไม้ 1        +10 คะแนน\n' +

                '🍍  ผลไม้ 2        +20 คะแนน\n' +

                '🍇  ผลไม้ 3        +30 คะแนน\n' +

                '🧺  BONUS          +50 คะแนน\n' +

                '💣  ระเบิด         -30 คะแนน  •  -1 HP\n\n' +

                '❤️  HP เริ่มต้น: 3\n' +

                '⏱️  เวลาเล่น: 60 วินาที',

                {

                    fontFamily:
                        'Arial',

                    fontSize:
                        '17px',

                    fontStyle:
                        'bold',

                    color:
                        '#e2e8f0',

                    align:
                        'left',

                    lineSpacing:
                        7,

                    shadow: {

                        offsetX: 0,

                        offsetY: 2,

                        color:
                            '#000000',

                        blur:
                            4,

                        fill:
                            true
                    }

                }

            ).setOrigin(0.5);


        // =====================================================
        // CLOSE BUTTON
        // =====================================================

        const closeButton =
            this.add.rectangle(

                width / 2,

                height * 0.76,

                160,

                50,

                0xef4444

            )
            .setInteractive({
                useHandCursor: true
            })
            .setStrokeStyle(
                2,
                0xfca5a5
            );


        const closeText =
            this.add.text(

                width / 2,

                height * 0.76,

                '✕  CLOSE',

                {

                    fontFamily:
                        'Arial Black, Arial',

                    fontSize:
                        '17px',

                    color:
                        '#ffffff'
                }

            ).setOrigin(0.5);


        // =====================================================
        // CLOSE HOVER
        // =====================================================

        closeButton.on(
            'pointerover',
            () => {

                closeButton.setFillStyle(
                    0xdc2626
                );

            }
        );


        closeButton.on(
            'pointerout',
            () => {

                closeButton.setFillStyle(
                    0xef4444
                );

            }
        );


        // =====================================================
        // CLOSE CLICK
        // =====================================================

        closeButton.on(
            'pointerdown',
            () => {

                overlay.destroy();

                popup.destroy();

                title.destroy();

                instructions.destroy();

                closeButton.destroy();

                closeText.destroy();

            }
        );


        // =====================================================
        // POPUP INITIAL STATE
        // =====================================================

        popup.setScale(0.8);

        title.setAlpha(0);

        instructions.setAlpha(0);

        closeButton.setAlpha(0);

        closeText.setAlpha(0);


        // =====================================================
        // POPUP SCALE ANIMATION
        // =====================================================

        this.tweens.add({

            targets:
                popup,

            scale:
                1,

            duration:
                300,

            ease:
                'Back.easeOut'

        });


        // =====================================================
        // POPUP FADE ANIMATION
        // =====================================================

        this.tweens.add({

            targets:
                [
                    title,
                    instructions,
                    closeButton,
                    closeText
                ],

            alpha:
                1,

            duration:
                300

        });

    }

}