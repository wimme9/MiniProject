import MenuScene from './scene/MenuScene.js';
import GameplayScene from './scene/GameplayScene.js';

const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 640,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, GameplayScene]
};

const game = new Phaser.Game(config);