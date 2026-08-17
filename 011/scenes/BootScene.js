// ============================================================
// BootScene.js
// หน้าที่: โหลด game-data.json ก่อนสิ่งอื่นใด แล้ววัดขนาดจริง (pixel)
// ของแต่ละ spritesheet เพื่อคำนวณ frameWidth/frameHeight
// (กว้าง/4, สูง/2) ก่อนส่งต่อให้ PreloadScene โหลดเป็น spritesheet จริง
// ============================================================

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // โหลดไฟล์ข้อมูลเกม (ข้อมูลล้วนๆ ไม่มี logic)
    this.load.json("gameData", "data/game-data.json");
  }

  create() {
    const gameData = this.cache.json.get("gameData");
    this.registry.set("gameData", gameData);

    this.measureSpritesheets(gameData).then((frameSizes) => {
      this.registry.set("frameSizes", frameSizes);
      this.scene.start("PreloadScene");
    });
  }

  // วัดขนาดภาพจริงของแต่ละ spritesheet ผ่าน native Image object
  // เพื่อคำนวณ frameWidth = width/4, frameHeight = height/2 ตามสเปค (grid 4x2 = 8 เฟรม)
  measureSpritesheets(gameData) {
    const spritesheets = gameData.assets.spritesheets;
    const keys = Object.keys(spritesheets);
    const frameSizes = {};

    const promises = keys.map((key) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          frameSizes[key] = {
            frameWidth: Math.floor(img.naturalWidth / 4),
            frameHeight: Math.floor(img.naturalHeight / 2),
          };
          resolve();
        };
        img.onerror = () => {
          console.error("โหลดรูปเพื่อวัดขนาดไม่สำเร็จ:", spritesheets[key]);
          // ค่า fallback กันเกมล่มถ้าไฟล์หาย
          frameSizes[key] = { frameWidth: 64, frameHeight: 64 };
          resolve();
        };
        // encodeURI กันปัญหา path ภาษาไทยโหลดไม่ได้บน local server บางตัว
        img.src = encodeURI(spritesheets[key]);
      });
    });

    return Promise.all(promises).then(() => frameSizes);
  }
}
