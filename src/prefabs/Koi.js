class Koi extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'koi', 0)

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setScale(5)

        if (this.body) {
            this.body.setAllowGravity(false)
            this.body.setImmovable(true)
        }
    }
}