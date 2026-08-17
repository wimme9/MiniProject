import { MenuScene } from './scenes/MenuScene.js';
import { GameplayScene } from './scenes/GameplayScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { VitoryScene } from './scenes/VitoryScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, GameplayScene, PauseScene, VitoryScene]
};

const game = new Phaser.Game(config);