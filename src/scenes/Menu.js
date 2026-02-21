class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene')
    }

    create() {

        this.add.text(480, 200, 'ENDLESS RUNNER', {
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        this.add.text(480, 300, '1 = Crab   2 = Lobster   3 = Shrimp', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        this.input.keyboard.on('keydown-ONE', () => {
            this.scene.start('playScene', { crustaceon: 1 })
        })

        this.input.keyboard.on('keydown-TWO', () => {
            this.scene.start('playScene', { crustaceon: 2 })
        })

        this.input.keyboard.on('keydown-THREE', () => {
            this.scene.start('playScene', { crustaceon: 3 })
        })
    }
}