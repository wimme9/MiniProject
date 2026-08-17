// ============================================================
// GameOverScene.js
// หน้าสรุปผล / เล่นอีกครั้ง: การ์ด 3D โค้งมน + ดาว + สกอร์เด่นชัด
// ============================================================

class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  init(data) {
    this.score = data.score || 0;
    this.isWin = data.isWin !== undefined ? data.isWin : false;
  }

  create() {
    this.gameData = this.registry.get("gameData");
    const { width, height } = this.sys.game.config;
    const text = this.gameData.text;

    // พื้นหลัง
    this.add.image(width / 2, height / 2, "background").setDisplaySize(width, height);

    // ฉากหลังมืดลงเล็กน้อย
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45);

    // ขนาดการ์ด Pop-up
    const cardW = 420;
    const cardH = 520;
    const cardX = width / 2;
    const cardY = height / 2;

    // การ์ดทรงโค้งมน
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 0.98);
    cardBg.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 32);
    cardBg.lineStyle(5, this.isWin ? 0x4caf50 : 0xef5350, 1);
    cardBg.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 32);

    // หัวข้อ (ยินดีด้วย! / Game Over)
    const titleText = this.isWin ? text.gameOverWinTitle : text.gameOverLoseTitle;
    const titleColor = this.isWin ? "#2e7d32" : "#c62828";
    this.add.text(cardX, cardY - 195, titleText, {
      fontSize: "38px",
      fontFamily: "'Kanit', sans-serif",
      fontStyle: "bold",
      color: titleColor
    }).setOrigin(0.5);

    // คำนวณดาวและสร้างการแสดงผลดาว
    const starsCount = this.calculateStars(this.score);
    this.createStarDisplay(cardX, cardY - 115, starsCount);

    // กล่องโชว์คะแนน
    const scoreBox = this.add.graphics();
    scoreBox.fillStyle(0xf1f8e9, 1);
    scoreBox.fillRoundedRect(cardX - 150, cardY - 55, 300, 95, 20);
    scoreBox.lineStyle(2, 0xaed581, 1);
    scoreBox.strokeRoundedRect(cardX - 150, cardY - 55, 300, 95, 20);

    this.add.text(cardX, cardY - 32, text.scoreLabel, {
      fontSize: "20px",
      fontFamily: "'Kanit', sans-serif",
      color: "#558b2f"
    }).setOrigin(0.5);

    this.add.text(cardX, cardY + 10, `${this.score}`, {
      fontSize: "46px",
      fontFamily: "'Kanit', sans-serif",
      fontStyle: "bold",
      color: "#2e7d32"
    }).setOrigin(0.5);

    // ปุ่ม 3D "เล่นอีกครั้ง"
    create3DButton(this, cardX, cardY + 105, 270, 64, text.replayButton, () => {
      this.scene.start("GameScene");
    }, {
      topColor: 0x4caf50,
      bottomColor: 0x2e7d32,
      hoverColor: 0x66bb6a,
      fontSize: "28px"
    });

    // ปุ่ม 3D "กลับหน้าแรก"
    create3DButton(this, cardX, cardY + 185, 270, 64, text.homeButton, () => {
      this.scene.start("MenuScene");
    }, {
      topColor: 0xff9800,
      bottomColor: 0xe65100,
      hoverColor: 0xffa726,
      fontSize: "28px"
    });
  }

  calculateStars(score) {
    if (!this.isWin) return 1;
    const grading = this.gameData.grading;
    for (let i = 0; i < grading.length; i++) {
      if (score >= grading[i].minScore) {
        return grading[i].stars;
      }
    }
    return 1;
  }

  createStarDisplay(x, y, count) {
    const spacing = 65;
    const startX = x - spacing;
    for (let i = 0; i < 3; i++) {
      const starKey = (i < count) ? "starFull" : "starEmpty";
      const star = this.add.image(startX + i * spacing, y, starKey).setScale(0.5);
      
      // อนิเมชันดาวเด้งขึ้นมาทีละดวง
      this.tweens.add({
        targets: star,
        scale: { from: 0, to: 0.5 },
        ease: 'Back.out',
        duration: 350,
        delay: i * 120
      });
    }
  }
}