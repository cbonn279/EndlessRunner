class Crab extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)

        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.setScale(4)
        this.setCollideWorldBounds(true)
        this.body.setSize(15, 10)
        this.body.setOffset(5, 30)

        this.moveSpeed = 500
        this.jumpVelocity = -1050
        this.hurtDuration = 2000

        this.isInvincible = false
        this.health = 3 

        this.stateMachine = new StateMachine('idle', {
            idle: new CrabIdleState(),
            walk: new CrabWalkState(),
            jump: new CrabJumpState(),
            attack: new CrabAttackState()
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

class CrabIdleState extends State {
    enter(scene, crab) {
        crab.setVelocityX(0)
        crab.anims.play('Cwalk', true)
    }

    execute(scene, crab) {

        const { left, right, space, up } = scene.keys

        if(!crab.body.blocked.down) {
            this.stateMachine.transition('jump')
            return
        }

        if(Phaser.Input.Keyboard.JustDown(space)) {
            this.stateMachine.transition('attack')
            return
        }

        if(Phaser.Input.Keyboard.JustDown(up) && crab.body.blocked.down) {
            this.stateMachine.transition('jump')
            return
        }

        if(left.isDown || right.isDown) {
            this.stateMachine.transition('walk')
        }
    }
}

class CrabWalkState extends State {
    enter(scene, crab) {
        crab.anims.play('Cwalk', true)
    }

    execute(scene, crab) {
        const { left, right, up, space } = scene.keys

        if(!crab.body.blocked.down) {
            this.stateMachine.transition('jump')
            return
        }

        if(Phaser.Input.Keyboard.JustDown(space)) {
            this.stateMachine.transition('attack')
            return
        }

        if(Phaser.Input.Keyboard.JustDown(up)) {
            this.stateMachine.transition('jump')
            return
        }

        if(left.isDown) {
            crab.setVelocityX(-crab.moveSpeed)
        } else if(right.isDown) {
            crab.setVelocityX(crab.moveSpeed)
        } else {
            this.stateMachine.transition('idle')
        }
    }
}

class CrabJumpState extends State {
    enter(scene, crab) {
        crab.setVelocityY(crab.jumpVelocity)
        crab.anims.play('Cjump', true)
        scene.spawnHitbox(crab, 'circle', {
            width: 160,
            height: 160,
            offsetX: -30,
            offsetY: 30,
            duration: 1000,
            follow: true,
            team: 'crustaceon'
        }) 
    }

    execute(scene, crab) {
        const { left, right } = scene.keys

        crab.anims.play('Cjump', true)
        if(left.isDown) {
            crab.setVelocityX(-crab.moveSpeed)
        } else if(right.isDown) {
            crab.setVelocityX(crab.moveSpeed)
        }

        if(crab.body.blocked.down) {
            this.stateMachine.transition('idle')
        }
    }
}

class CrabAttackState extends State {
    enter(scene, crab) {
        crab.setVelocityX(0)
        crab.anims.play('Cattack')

        scene.spawnHitbox(crab, 'rect', {
            width: 60,
            height: 60,
            offsetX: 40,
            offsetY: 30,
            duration: 200,
            follow: false,
            team: 'crustaceon'
        })

        crab.once('animationcomplete', () => {
            this.stateMachine.transition('idle')
        })
    }

    execute(scene, crab) {
    }
}