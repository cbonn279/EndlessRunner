class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene')
    }

    create() {

        this.add.text(480, 200, 'GUPPY GOBBLERS', {
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        this.add.text(480, 300, '1 = Crab   2 = Lobster   3 = Shrimp', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5)

        const startWithChoose = (crustaceonIndex) => {
            const s = this.sound.add('choose')
            s.play({ volume: 0.12 })
            s.once('complete', () => this.scene.start('playScene', { crustaceon: crustaceonIndex }))
            this.time.delayedCall(400, () => {
                if (!this.scene.isActive('playScene')) this.scene.start('playScene', { crustaceon: crustaceonIndex })
            })
        }

        this.input.keyboard.on('keydown-ONE', () => startWithChoose(1))
        this.input.keyboard.on('keydown-TWO', () => startWithChoose(2))
        this.input.keyboard.on('keydown-THREE', () => startWithChoose(3))
    }
}