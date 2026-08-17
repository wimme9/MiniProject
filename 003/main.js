const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [TitleScene, GameScene, PauseScene, GameOverScene]
};

// รอให้ฟอนต์ Sarabun โหลดเสร็จก่อนเริ่มเกม
// เพื่อป้องกันปัญหาสระ/วรรณยุกต์ภาษาไทยแสดงผลไม่ครบในเฟรมแรกๆ
function startGame() {
    new Phaser.Game(config);
}

if (document.fonts) {
    Promise.all([
        document.fonts.load('400 16px Sarabun'),
        document.fonts.load('700 16px Sarabun')
    ]).then(startGame).catch(startGame);
} else {
    startGame();
}
