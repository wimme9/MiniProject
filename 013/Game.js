// Game.js
import MenuScene from './Scene/MenuScene.js';
import GameplayScene from './Scene/GameplayScene.js';
import PauseScene from './Scene/PauseScene.js';
import VictoryScene from './Scene/VictoryScene.js';
import DefeatScene from './Scene/DefeatScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    // 💡 เปิดใช้งานระบบ Physics สำหรับเกม
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // เกมแนวมุมมองบนลงล่าง/สะสมของ ให้ gravity เป็น 0
            debug: false
        }
    },
    // 💡 รวม Scene ทั้งหมดไว้ตรงนี้
    scene: [ MenuScene, GameplayScene, PauseScene, VictoryScene, DefeatScene ]
};

const game = new Phaser.Game(config);