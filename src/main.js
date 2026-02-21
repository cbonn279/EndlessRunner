// Christian Bonardi
// Endless Runner
// last updated: 2/19/2026
// Time Taken: 25 hours

/* Sources:
https://docs.phaser.io/api-documentation/api-documentation
https://github.com/nathanaltice/MovementStudies
https://github.com/nathanaltice/FSM
https://www.youtube.com/watch?v=SCO2BbbO17c&t=382s
https://www.youtube.com/watch?v=LYMJ8U01Jco
https://www.youtube.com/watch?v=7jPMOD9-SgY&t=2s
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
