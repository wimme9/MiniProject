// ============================================================
// MenuScene.js
// หน้าแรก: โลโก้, ปุ่มเริ่มเกม 3D, ปุ่มวิธีเล่น, และการ์ดโค้งมน
// ============================================================

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.gameData = this.registry.get("gameData");
    const { width, height } = this.sys.game.config;
    const text = this.gameData.text;

    // พื้นหลังเต็มจอ
    this.add.image(width / 2, height / 2, "titleArt").setDisplaySize(width, height);

    // การ์ดรองหลังปุ่มทรงโค้งมนสไตล์โมเดิร์น (Glassmorphism Effect)
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x000000, 0.45);
    cardBg.fillRoundedRect(width / 2 - 165, 650, 330, 220, 28);
    cardBg.lineStyle(3, 0xffffff, 0.5);
    cardBg.strokeRoundedRect(width / 2 - 165, 650, 330, 220, 28);

    // ปุ่มเริ่มเกม (3D Green)
    create3DButton(this, width / 2, 715, 270, 68, text.startButton, () => {
      this.scene.start("GameScene");
    }, {
      topColor: 0x4caf50,
      bottomColor: 0x2e7d32,
      hoverColor: 0x66bb6a,
      fontSize: "30px"
    });

    // ปุ่มวิธีเล่น (3D Orange/Amber)
    create3DButton(this, width / 2, 805, 270, 68, text.howToPlayButton, () => {
      this.showHowToPlay();
    }, {
      topColor: 0xff9800,
      bottomColor: 0xe65100,
      hoverColor: 0xffa726,
      fontSize: "30px"
    });

    this.createMuteToggle();
    this.playBgmIfNeeded();
  }

  showHowToPlay() {
    const { width, height } = this.sys.game.config;
    const text = this.gameData.text;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65).setInteractive();
    
    // หน้าต่าง Modal ทรงโค้งมน
    const modalBg = this.add.graphics();
    modalBg.fillStyle(0xffffff, 0.98);
    modalBg.fillRoundedRect(width / 2 - 220, height / 2 - 210, 440, 420, 30);
    modalBg.lineStyle(4, 0x4caf50, 1);
    modalBg.strokeRoundedRect(width / 2 - 220, height / 2 - 210, 440, 420, 30);

    const title = this.add.text(width / 2, height / 2 - 150, text.howToPlayTitle, {
      fontSize: "32px",
      fontFamily: "'Kanit', sans-serif",
      fontStyle: "bold",
      color: "#2e7d32"
    }).setOrigin(0.5);

    const body = this.add.text(width / 2, height / 2 - 20, text.howToPlayText, {
      fontSize: "22px",
      fontFamily: "'Kanit', sans-serif",
      color: "#333333",
      align: "center",
      lineSpacing: 10
    }).setOrigin(0.5);

    const closeBtnContainer = create3DButton(this, width / 2, height / 2 + 140, 180, 56, text.closeButton, () => {
      overlay.destroy();
      modalBg.destroy();
      title.destroy();
      body.destroy();
      closeBtnContainer.destroy();
    }, {
      topColor: 0xf44336,
      bottomColor: 0xc62828,
      hoverColor: 0xef5350,
      fontSize: "24px"
    });
  }

  createMuteToggle() {
    const { width } = this.sys.game.config;
    const isMuted = this.sound.mute;

    const btnBg = this.add.circle(width - 45, 45, 26, 0xffffff, 0.9).setStrokeStyle(3, 0x4caf50);
    this.muteText = this.add.text(width - 45, 45, isMuted ? "🔇" : "🔊", {
      fontSize: "26px"
    }).setOrigin(0.5);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerdown", () => {
      this.sound.mute = !this.sound.mute;
      this.muteText.setText(this.sound.mute ? "🔇" : "🔊");
    });
  }

  playBgmIfNeeded() {
    const existing = this.sound.get("bgm");
    if (existing && existing.isPlaying) return;

    const bgm = existing || this.sound.add("bgm", { loop: true, volume: 0.5 });
    bgm.play();
  }
}