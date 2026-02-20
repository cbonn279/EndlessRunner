class GameOver extends Phaser.Scene {
    constructor() {
        super("gameoverScene")
    }

    create() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.6).setOrigin(0)

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 20, 'GAME OVER', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5)

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 30, 'Press R to return to Menu', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5)

        this.input.keyboard.on('keydown-R', () => {
            this.scene.start('menuScene')
        })
    }
}