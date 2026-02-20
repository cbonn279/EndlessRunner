// Christian Bonardi
// Endless Runner
// 2/17/2026
// Time Taken: 18 hours

/* Sources:
https://www.youtube.com/watch?v=SCO2BbbO17c&t=382s
*/

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
