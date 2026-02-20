class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene')
    }

    create() {

        this.add.text(480, 200, 'ENDLESS RUNNER', {
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        this.add.text(480, 300, 'Press 1, 2, or 3 to Select Crustaceon', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        this.input.keyboard.on('keydown-ONE', () => {
            this.scene.start('playScene', { crustaceonS: 1 })
        })

        this.input.keyboard.on('keydown-TWO', () => {
            this.scene.start('playScene', { crustaceonS: 2 })
        })

        this.input.keyboard.on('keydown-THREE', () => {
            this.scene.start('playScene', { crustaceonS: 3 })
        })
    }
}
