import MenuScene from './js/MenuScene.js';
import GameplayScene from './js/GameplayScene.js';
import GameOverScene from './js/GameOverScene.js';
import SkillScene from './js/SkillScene.js';
import SettingScene from './js/SettingScene.js';
import WinScene from './js/WinScene.js';
import StoryScene from './js/StoryScene.js';     // 🌟 เพิ่มบรรทัดนี้
import HowToPlayScene from './js/HowToPlayScene.js'; // 🌟 เพิ่มบรรทัดนี้
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: document.body,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // เกมมุมมอง Top-down ไม่ต้องมีแรงโน้มถ่วงแนวตั้ง
            debug: false        // เปิดเป็น true ถ้าต้องการดูกรอบฟิสิกส์ (Hitbox)
        }
    },
    // ใส่ Scene ทั้งหมดของเกม เรียงตามลำดับการทำงาน
    scene: [MenuScene, GameplayScene, GameOverScene, SkillScene, SettingScene, WinScene, StoryScene, HowToPlayScene]
};

// เริ่มต้นรันเกมด้วย Config นี้
const game = new Phaser.Game(config);