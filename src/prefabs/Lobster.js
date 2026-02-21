class Lobster extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setScale(4)
        this.setCollideWorldBounds(true)
        this.body.setSize(25, 15)
        this.body.setOffset(10, 25)

        this.defaultBody = {
            width: 25,
            height: 15,
            offsetX: 10,
            offsetY: 26
        }

        this.moveSpeed = 500 
        this.floatSpeed = -300 
        this.hurtDuration = 2000

        this.isInvincible = false
        this.health = 3

        this.stateMachine = new StateMachine('idle', {
            idle: new LobsterIdleState(),
            walk: new LobsterWalkState(),
            up: new LobsterUpState(),
            down: new LobsterDownState(),
            attack: new LobsterAttackState()
        }, [scene, this])
    }

    takeDamage(amount = 1) {
        if (this.isInvincible) return false

        this.health = Math.max(0, this.health - amount)

        this.isInvincible = true

        const flashInterval = 120
        let showTint = true
        this.setTint(0x888888)

        const flashTimer = this.scene.time.addEvent({
            delay: flashInterval,
            loop: true,
            callback: () => {
                if (showTint) {
                    this.clearTint()
                } else {
                    this.setTint(0x888888)
                }
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
}

class LobsterIdleState extends State {
    enter(scene, lobster) {
        lobster.setVelocityX(0)
        lobster.anims.play('Lwalk', true)
    }

    execute(scene, lobster) {
        const { left, right, space, up } = scene.keys

        if (!lobster.body.blocked.down) {
            this.stateMachine.transition('down')
            return
        }

        if (space.isDown) {
            this.stateMachine.transition('attack')
            return
        }

        if (up.isDown) {
            this.stateMachine.transition('up')
            return
        }

        if (left.isDown || right.isDown) {
            this.stateMachine.transition('walk')
            return
        }
    }
}

class LobsterWalkState extends State {
    enter(scene, lobster) {
        lobster.anims.play('Lwalk', true)
    }

    execute(scene, lobster) {
        const { left, right, space, up } = scene.keys

        if (!lobster.body.blocked.down) {
            this.stateMachine.transition('down')
            return
        }

        if (space.isDown) {
            this.stateMachine.transition('attack')
            return
        }

        if (up.isDown) {
            this.stateMachine.transition('up')
            return
        }

        if (left.isDown) {
            lobster.setVelocityX(-lobster.moveSpeed)
        } else if (right.isDown) {
            lobster.setVelocityX(lobster.moveSpeed)
        } else {
            this.stateMachine.transition('idle')
        }
    }
}

class LobsterUpState extends State {
    enter(scene, lobster) {
        lobster.anims.play('Lup', true)
        lobster.body.setSize(25, 15)
        lobster.body.setOffset(10, 0)
        lobster.setVelocityY(lobster.floatSpeed * 0.8)
    }

    execute(scene, lobster) {
        const { left, right, up } = scene.keys

        lobster.anims.play('Lup', true)

        if (left.isDown) {
            lobster.setVelocityX(-lobster.moveSpeed)
        } else if (right.isDown) {
            lobster.setVelocityX(lobster.moveSpeed)
        } else {
            lobster.setVelocityX(0)
        }

        if (up.isDown) {
            lobster.setVelocityY(lobster.floatSpeed)
        } else {
            if (!lobster.body.blocked.down) {
                this.stateMachine.transition('down')
                return
            }
            this.stateMachine.transition('idle')
            return
        }
    }

    exit(scene, lobster) {
        lobster.body.setSize(
            lobster.defaultBody.width,
            lobster.defaultBody.height
        )
        lobster.body.setOffset(
            lobster.defaultBody.offsetX,
            lobster.defaultBody.offsetY
        )
    }
}

class LobsterDownState extends State {
    enter(scene, lobster) {
        lobster.anims.play('Ldown', true)

        const hb = scene.spawnHitbox(lobster, 'rect', {
            width: 120,
            height: 100,
            offsetX: 20,
            offsetY: 40,
            duration: 0,
            follow: true,
            damage: 1,
            team: 'crustaceon'
        })
        lobster._downHitbox = hb
    }

    execute(scene, lobster) {
        const { left, right } = scene.keys

        if (left.isDown) {
            lobster.setVelocityX(-lobster.moveSpeed)
        } else if (right.isDown) {
            lobster.setVelocityX(lobster.moveSpeed)
        } else {
            lobster.setVelocityX(0)
        }

        if (lobster.body.blocked.down) {
            if (lobster._downHitbox) {
                try { lobster._downHitbox.destroy() } catch (e) {}
                lobster._downHitbox = null
            }

            if (left.isDown || right.isDown) {
                this.stateMachine.transition('walk')
            } else {
                this.stateMachine.transition('idle')
            }
            return
        }
    }

    exit(scene, lobster) {
        if (lobster._downHitbox) {
            try { lobster._downHitbox.destroy() } catch (e) {}
            lobster._downHitbox = null
        }
    }
}

class LobsterAttackState extends State {
    enter(scene, lobster) {
        lobster.anims.play('Lattack', true)

        const hb = scene.spawnHitbox(lobster, 'rect', {
            width: 200,
            height: 80,
            offsetX: 50,
            offsetY: 50,
            duration: 0, 
            follow: true,
            damage: 1,
            team: 'crustaceon'
        })

        lobster._attackHitbox = hb
    }

   execute(scene, lobster) {
        const { left, right, space } = scene.keys

        lobster.setVelocityY(0)

        if (left.isDown) {
            lobster.setVelocityX(-lobster.moveSpeed * 0.5)
        } else if (right.isDown) {
            lobster.setVelocityX(lobster.moveSpeed * 1.5)
        } else {
            lobster.setVelocityX(0)
        }

        if (!space.isDown) {
            if (left.isDown || right.isDown) {
                this.stateMachine.transition('walk')
            } else {
                this.stateMachine.transition('idle')
            }
        }
    }
    exit(scene, lobster) {
        if (lobster._attackHitbox) {
            try { lobster._attackHitbox.destroy() } catch (e) {}
            lobster._attackHitbox = null
        }
    }
}