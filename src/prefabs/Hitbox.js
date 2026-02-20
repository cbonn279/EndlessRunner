class Hitbox extends Phaser.GameObjects.Zone {
    constructor(scene, owner, shape, config = {}) {
        const x = owner.x + (config.offsetX || 0)
        const y = owner.y + (config.offsetY || 0)
        const w = config.width || 32
        const h = config.height || 32
        super(scene, x, y, w, h)

        this.owner = owner
        this.shape = shape || 'rect'
        this.damage = config.damage || 1

        scene.add.existing(this)
        scene.physics.add.existing(this)

        if (this.body) {
            this.body.setAllowGravity(false)
            this.body.setImmovable(true)

                this.body.setSize(w, h)
        }

        this.follow = !!config.follow

        // schedule destruction
        const dur = config.duration || 150
        this._timer = scene.time.delayedCall(dur, () => {
            this.destroy()
        })
    }
    takeDamage() {
        if (this.isInvincible) return false

        this.health = Math.max(0, this.health - 1)
        this.isInvincible = true
        this.setTint(0x888888)

        this.scene.time.delayedCall(this.hurtDuration, () => {
            this.clearTint()
            this.isInvincible = false
        })

        if (this.health <= 0) {
            this.disableBody(true, true)
        }

        return true
    }

    preUpdate(time, delta) {
        super.preUpdate && super.preUpdate(time, delta)
        if (this.follow && this.owner) {
            this.x = this.owner.x + (this.offsetX || 0)
            this.y = this.owner.y + (this.offsetY || 0)
            if (this.body) {
                this.body.position.x = this.x - (this.body.width / 2)
                this.body.position.y = this.y - (this.body.height / 2)
            }
        }
    }
}
