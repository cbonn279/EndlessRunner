class Shrimp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setScale(4)
        this.setCollideWorldBounds(true)

        this.body.setSize(10, 20)
        this.body.setOffset(0, 24)

        this.defaultBody = { width: 10, height: 20, offsetX: 0, offsetY: 24 }
        this.upBody = { width: 10, height: 20, offsetX: 0, offsetY: 24 }
        this.downBody = { width: 10, height: 20, offsetX: 0, offsetY: 24 }

        this.moveSpeed = 500
        this.jumpVelocity = -700
        this.hurtDuration = 1700

        this.pogoCount = 0
        this.pogoIncrements = [0, 0.2, 0.4, 0.6, 0.8, 1.0]

        this.isInvincible = false
        this.health = 3

        this.pufferHitbox = null

        this.stateMachine = new StateMachine('idle', {
            idle: new ShrimpIdleState(),
            walk: new ShrimpWalkState(),
            up: new ShrimpUpState(),
            down: new ShrimpDownState()
        }, [scene, this])
    }

    takeDamage(amount = 1) {
        if (this.isInvincible) return false

        this.health = Math.max(0, this.health - amount)

        this.isInvincible = true
        this.setTint(0x888888)

        const flashInterval = 120
        let showTint = true
        const flashTimer = this.scene.time.addEvent({
            delay: flashInterval,
            loop: true,
            callback: () => {
                if (showTint) this.clearTint()
                else this.setTint(0x888888)
                showTint = !showTint
            }
        })

        this.scene.time.delayedCall(this.hurtDuration, () => {
            flashTimer.remove(false)
            this.clearTint()
            this.isInvincible = false
        })

        if (this.health <= 0) {
            this.disableBody(true, true)
        }

        return true
    }

    createPuffer(scene, cfg = {}) {
        if (this.pufferHitbox) {
            try { this.pufferHitbox.destroy() } catch (e) {}
            this.pufferHitbox = null
        }

        if (!scene || typeof scene.spawnHitbox !== 'function') return
        const defaults = {
            width: 170,
            height: 170,
            offsetX: 40,
            offsetY: 0,
            duration: 0,
            follow: true,
            damage: 1,
            team: 'crustaceon',
            shape: 'circle'
        }

        const final = Object.assign({}, defaults, cfg)

        this.pufferHitbox = scene.spawnHitbox(this, final.shape, {
            width: final.width,
            height: final.height,
            offsetX: final.offsetX,
            offsetY: final.offsetY,
            duration: final.duration,
            follow: final.follow,
            damage: final.damage,
            team: final.team
        })
    }

    destroyPuffer() {
        if (this.pufferHitbox) {
            try { this.pufferHitbox.destroy() } catch (e) {}
            this.pufferHitbox = null
        }
    }

    tryPogo(scene) {
        if (!scene || !scene.fishGroup) return false

        const overlapAnyFish = scene.physics.overlap(this, scene.fishGroup)
        const pufferOverlap = this.pufferHitbox ? scene.physics.overlap(this.pufferHitbox, scene.fishGroup) : false

        let dyingNearby = false
        if (!overlapAnyFish && !pufferOverlap) {
            scene.fishGroup.getChildren().forEach(f => {
                if (!f || !f.active) return
                if (!f.dying) return
                if (this.body && f.body) {
                    const a = this.body
                    const b = f.body
                    if (!(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height)) {
                        dyingNearby = true
                    }
                }
            })
        }

        if (!overlapAnyFish && !pufferOverlap && !dyingNearby) return false

        this.pogoCount = Math.min(this.pogoCount + 1, 5)
        const inc = this.pogoIncrements[this.pogoCount] || 0
        const multiplier = 1 + inc

        this.setVelocityY(this.jumpVelocity * multiplier)

        return true
    }

    resetPogo() {
        this.pogoCount = 0
    }
}

class ShrimpIdleState extends State {
    enter(scene, shrimp) {
        shrimp.setVelocityX(0)
        shrimp.anims.play('Swalk', true)

        shrimp.body.setSize(shrimp.defaultBody.width, shrimp.defaultBody.height)
        shrimp.body.setOffset(shrimp.defaultBody.offsetX, shrimp.defaultBody.offsetY)

        shrimp.createPuffer(scene, { shape: 'circle', width: 170, height: 170, offsetX: 45, offsetY: 20})
    }

    execute(scene, shrimp) {
        const { left, right, space, up } = scene.keys

        if (!shrimp.body.blocked.down) {
            this.stateMachine.transition('down')
            return
        }

        if (Phaser.Input.Keyboard.JustDown(space)) {
            const did = shrimp.tryPogo(scene)
            if (did) {
                this.stateMachine.transition('up')
                return
            }
        }

        if (Phaser.Input.Keyboard.JustDown(up)) {
            this.stateMachine.transition('up')
            return
        }

        if (left.isDown || right.isDown) {
            this.stateMachine.transition('walk')
            return
        }
    }

    exit(scene, shrimp) {
        shrimp.destroyPuffer()
    }
}

class ShrimpWalkState extends State {
    enter(scene, shrimp) {
        shrimp.anims.play('Swalk', true)
        shrimp.body.setSize(shrimp.defaultBody.width, shrimp.defaultBody.height)
        shrimp.body.setOffset(shrimp.defaultBody.offsetX, shrimp.defaultBody.offsetY)

        shrimp.createPuffer(scene, { shape: 'circle', width: 170, height: 170, offsetX: 45, offsetY: 20})
    }

    execute(scene, shrimp) {
        const { left, right, space, up } = scene.keys

        if (!shrimp.body.blocked.down) {
            this.stateMachine.transition('down')
            return
        }

        if (Phaser.Input.Keyboard.JustDown(space)) {
            const did = shrimp.tryPogo(scene)
            if (did) {
                this.stateMachine.transition('up')
                return
            }
        }

        if (Phaser.Input.Keyboard.JustDown(up)) {
            this.stateMachine.transition('up')
            return
        }

        if (left.isDown) {
            shrimp.setVelocityX(-shrimp.moveSpeed)
        } else if (right.isDown) {
            shrimp.setVelocityX(shrimp.moveSpeed)
        } else {
            this.stateMachine.transition('idle')
        }
    }

    exit(scene, shrimp) {
        shrimp.destroyPuffer()
    }
}

class ShrimpUpState extends State {
    enter(scene, shrimp) {
        shrimp.body.setSize(shrimp.upBody.width, shrimp.upBody.height)
        shrimp.body.setOffset(shrimp.upBody.offsetX, shrimp.upBody.offsetY)

        shrimp.createPuffer(scene, { shape: 'circle', width: 170, height: 170, offsetX: 45, offsetY: 20})
        if (shrimp.body.blocked.down) {
            shrimp.setVelocityY(shrimp.jumpVelocity)
        }
    }

    execute(scene, shrimp) {
        const { left, right, space, up } = scene.keys

        if (shrimp.body.velocity.y < 0) {
            shrimp.anims.play('Sup', true)
        } else {
            shrimp.anims.play('Sdown', true)
        }

        if (left.isDown) {
            shrimp.setVelocityX(-shrimp.moveSpeed)
        } else if (right.isDown) {
            shrimp.setVelocityX(shrimp.moveSpeed)
        } else {
            shrimp.setVelocityX(0)
        }

        if (Phaser.Input.Keyboard.JustDown(up)) {
            shrimp.setVelocityY(Math.min(shrimp.body.velocity.y, shrimp.jumpVelocity * 0.6))
        }

        if (Phaser.Input.Keyboard.JustDown(space)) {
            const did = shrimp.tryPogo(scene)
            if (did) {

                this.stateMachine.transition('up')
                return
            }
        }

        if (shrimp.body.velocity.y > 0) {
            this.stateMachine.transition('down')
            return
        }

        if (shrimp.body.blocked.down) {
            shrimp.resetPogo()
            this.stateMachine.transition('idle')
            return
        }
    }

    exit(scene, shrimp) {
        shrimp.destroyPuffer()
        shrimp.body.setSize(shrimp.defaultBody.width, shrimp.defaultBody.height)
        shrimp.body.setOffset(shrimp.defaultBody.offsetX, shrimp.defaultBody.offsetY)
    }
}

class ShrimpDownState extends State {
    enter(scene, shrimp) {
        shrimp.body.setSize(shrimp.downBody.width, shrimp.downBody.height)
        shrimp.body.setOffset(shrimp.downBody.offsetX, shrimp.downBody.offsetY)

        shrimp.createPuffer(scene, { shape: 'circle', width: 200, height: 200, offsetX: -45, offsetY: 20})
    }

    execute(scene, shrimp) {
        const { left, right, space } = scene.keys

        if (shrimp.body.velocity.y < 0) {
            shrimp.anims.play('Sup', true)
        } else {
            shrimp.anims.play('Sdown', true)
        }

        if (left.isDown) {
            shrimp.setVelocityX(-shrimp.moveSpeed)
        } else if (right.isDown) {
            shrimp.setVelocityX(shrimp.moveSpeed)
        } else {
            shrimp.setVelocityX(0)
        }

        if (Phaser.Input.Keyboard.JustDown(space)) {
            const did = shrimp.tryPogo(scene)
            if (did) {
                this.stateMachine.transition('up')
                return
            }
        }

        if (shrimp.body.blocked.down) {
            shrimp.resetPogo()
            if (left.isDown || right.isDown) {
                this.stateMachine.transition('walk')
            } else {
                this.stateMachine.transition('idle')
            }
            return
        }
    }

    exit(scene, shrimp) {
        shrimp.destroyPuffer()
        shrimp.body.setSize(shrimp.defaultBody.width, shrimp.defaultBody.height)
        shrimp.body.setOffset(shrimp.defaultBody.offsetX, shrimp.defaultBody.offsetY)
    }
}