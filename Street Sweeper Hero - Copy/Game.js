// ไฟล์ Game.js จะเหลือโค้ดแค่นี้เลยครับ!

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // ปิดโหมด Debug
        }
    },
    // บอกเกมให้รู้จัก Scenes ทั้งหมดที่เราสร้างไว้ในโฟลเดอร์ scenes
    scene: [ UI_Screen, GamesScenes, ScenesGameOver , UISTOP ] 
};

// เริ่มรันเกม
const game = new Phaser.Game(config);