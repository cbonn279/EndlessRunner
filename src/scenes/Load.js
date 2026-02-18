class Load extends Phaser.Scene {
    constructor() {
        super("loadScene")
    }

    preload() {
        this.load.path = './assets/'

        this.load.image('B1', 'B1.png')
        this.load.image('B2', 'B2.png')
        this.load.image('B3', 'B3.png')
        this.load.image('B4', 'B4.png')
        this.load.image('B5', 'B5.png')
        this.load.image('B6', 'B6.png')
    }

    create() {
        this.scene.start('menuScene')
    }
}
