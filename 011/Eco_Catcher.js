// ============================================================
// Eco_Catcher.js
// ไฟล์หลักของเกม: ตั้งค่า Phaser Game Instance เท่านั้น
// Logic ของแต่ละหน้าจออยู่ในโฟลเดอร์ scenes/
// ============================================================

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#87CEEB",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "game-container",
    width: 540,
    height: 960,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, GameOverScene],
};

const game = new Phaser.Game(config);
