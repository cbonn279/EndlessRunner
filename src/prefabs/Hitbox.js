class Hitbox extends Phaser.GameObjects.Zone {
    constructor(scene, owner, shape, config = {}) {
        const x = owner.x + (config.offsetX ?? 0)
        const y = owner.y + (config.offsetY ?? 0)
        const w = config.width ?? 32
        const h = config.height ?? 32
        super(scene, x, y, w, h)

        this.owner = owner
        this.shape = shape || 'rect'
        this.damage = config.damage ?? 1
        this.team = config.team ?? (owner && owner.texture && owner.texture.key === 'fish' ? 'enemy' : 'crustaceon')

        scene.add.existing(this)
        scene.physics.add.existing(this)

        if (this.body) {
            this.body.setAllowGravity(false)
            this.body.setImmovable(true)
            this.body.setVelocity(0, 0)
            this.body.moves = false 
            this.body.enable = true     
            if (this.shape === 'circle') {
                const radius = Math.max(w, h) / 2
                this.body.setCircle(radius)
                this.body.setOffset(-radius + (this.width/2), -radius + (this.height/2))
            } else {
                this.body.setSize(w, h)
                this.body.setOffset(0, 0)
            }
        }

        this.follow = !!config.follow
        this.offsetX = config.offsetX ?? 0
        this.offsetY = config.offsetY ?? 0

        const dur = typeof config.duration === 'number' ? config.duration : 150
        if (dur > 0) {
            this._timer = scene.time.delayedCall(dur, () => {
                this.destroy()
            })
        }

        if (this.follow && this.owner) {
            if (this.owner._followHitbox && this.owner._followHitbox !== this) {
                try { this.owner._followHitbox.destroy() } catch (e) {}
            }
            this.owner._followHitbox = this
        }

        if (this.owner && this.owner.on) {
            this.owner.on('destroy', () => {
                if (this && this.destroy) this.destroy()
            })
        }
    }

    preUpdate(time, delta) {
        super.preUpdate && super.preUpdate(time, delta)
        if (this.follow && this.owner) {
            this.x = this.owner.x + (this.offsetX ?? 0)
            this.y = this.owner.y + (this.offsetY ?? 0)
            if (this.body) {
                this.body.position.x = this.x - (this.body.width / 2)
                this.body.position.y = this.y - (this.body.height / 2)
            }
        }
    }
}