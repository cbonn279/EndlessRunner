// Christian Bonardi
// Endless Runner
// 2/17/2026
// Time Taken: 3 hours

const config = {
    parent: 'phaser-game',
    type: Phaser.WEBGL,
    width: 1024,
    height: 600,
    backgroundColor: '#000000',   
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 2000 },
            debug: false
        }
    },
    scene: [ Load, Menu, Play, GameOver ]
}

const game = new Phaser.Game(config)
