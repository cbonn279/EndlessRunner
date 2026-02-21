class GameOver extends Phaser.Scene {
    constructor() {
        super("gameoverScene")
    }

    create(data) {
        try {
            this.sound.stopAll()
            this.sound.play('gameover', { volume: 0.12 })
        } catch (e) {}
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x348c77, 0.6).setOrigin(0)

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 60, 'GAME OVER', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5)

        const finalScore = (data && typeof data.score === 'number') ? data.score : 0
        const highScore = (data && typeof data.highScore === 'number') ? data.highScore : 0
        const newHigh = data && data.newHigh
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 10, `SCORE: ${finalScore}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5)
        if (newHigh) {
            this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 20,
                `NEW HIGH SCORE: ${finalScore}`, {
                    fontSize: '28px',
                    color: '#ffff00'
                }).setOrigin(0.5)
        } else {
            this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 20,
                `HIGH SCORE: ${highScore}`, {
                    fontSize: '28px',
                    color: '#ffffff'
                }).setOrigin(0.5)
        }
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 40, 'Press R to return to Menu', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5)

        this.input.keyboard.on('keydown-R', () => {
            this.scene.start('menuScene')
        })
    }
}