class Fish extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'fish', 0)

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setScale(4)
        this.setVelocityX(-100)
        this.setImmovable(true)
        this.body.allowGravity = false

        this.anims.play('Fwalk', true)
    }
}
