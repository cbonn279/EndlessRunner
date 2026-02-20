class Fish extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'fish', 0)

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setScale(4)

        if (this.body) {
            this.body.setAllowGravity(false)
            this.body.setImmovable(true)
        }

        this.anims.play('Fwalk', true)
    }
}
