class ScenesGameOver extends Phaser.Scene {
    constructor() {
        super('ScenesGameOver'); 
    }

    create(data) {
        let finalScore = (data && data.score !== undefined) ? data.score : 0;

        // 🌟 1. เอฟเฟกต์เฟดหน้าจอตอนเริ่มฉาก (Camera Fade-in) จากสีดำ (0,0,0) ใช้เวลา 1000ms
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // --- สร้างพื้นหลังไล่สี ---
        let graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a1d, 0x1a1a1d, 0x660000, 0x660000, 1); 
        graphics.fillRect(0, 0, 400, 600);

        // --- 2. ข้อความ GAME OVER (เปลี่ยนเป็นค่อยๆ สว่างและขยายขึ้นมาแทน) ---
        let gameOverText = this.add.text(200, 200, 'GAME OVER', {  
            fontSize: '50px', 
            fill: '#ff3333', 
            fontFamily: 'Impact, Arial',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5);

        // เริ่มต้นให้โปร่งใส (Alpha=0) และย่อขนาดไว้ครึ่งนึง (Scale=0.5)
        gameOverText.setAlpha(0); 
        gameOverText.setScale(0.5); 

        // แอนิเมชันให้ค่อยๆ เฟดสว่างขึ้นและขยายขนาดจนเต็ม
        this.tweens.add({
            targets: gameOverText,
            alpha: 1,                 
            scale: 1,                 
            ease: 'Cubic.easeOut',    // เอฟเฟกต์แบบนุ่มนวล
            duration: 1500            // ใช้เวลา 1.5 วินาที
        });

        // --- 3. ข้อความสรุปคะแนน ---
        let scoreText = this.add.text(200, 300, 'FINAL SCORE: ' + finalScore, { 
            fontSize: '26px', 
            fill: '#ffd700', 
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        scoreText.setAlpha(0); 
        this.tweens.add({
            targets: scoreText,
            alpha: 1,              
            ease: 'Linear',
            duration: 1000,
            delay: 1000             // รอ 1 วินาทีให้ GAME OVER โผล่มาก่อน
        });

        // --- 4. ปุ่ม RESTART ---
        let restartBtn = this.add.text(200, 450, 'RESTART', { 
            fontSize: '30px', 
            fill: '#00ffcc', 
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#222222', 
            padding: { x: 20, y: 10 }   
        }).setOrigin(0.5);

        restartBtn.setAlpha(0); 
        this.tweens.add({
            targets: restartBtn,
            alpha: 1,
            ease: 'Linear',
            duration: 500,
            delay: 1500, // รอ 1.5 วินาทีให้คะแนนโผล่มาก่อน
            onComplete: () => {
                // เอฟเฟกต์ปุ่มเต้นตุบๆ
                this.tweens.add({
                    targets: restartBtn,
                    scaleX: 1.1,         
                    scaleY: 1.1,         
                    ease: 'Sine.easeInOut',
                    duration: 600,       
                    yoyo: true,          
                    repeat: -1           
                });
            }
        });

        // --- ระบบคลิกปุ่ม ---
        restartBtn.setInteractive({ useHandCursor: true });

        restartBtn.on('pointerover', () => {
            restartBtn.setTint(0xffffff); 
        });

        restartBtn.on('pointerout', () => {
            restartBtn.clearTint();
        });

        restartBtn.on('pointerdown', () => {
            // 🌟 5. ใส่เอฟเฟกต์หน้าจอมืดลง (Fade-out) ก่อนกลับไปเริ่มเกมใหม่
            this.cameras.main.fadeOut(500, 0, 0, 0);
            
            // รอให้จอมืดสนิทก่อน แล้วค่อยสั่งสลับ Scene
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('GamesScenes'); 
            });
        });
    }
}