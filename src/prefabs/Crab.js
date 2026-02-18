class Crab extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)

        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.setScale(3.5)
        this.setCollideWorldBounds(true)
        this.body.setSize(this.width * 0.6, this.height * 0.8, true)

        this.moveSpeed = 200
        this.jumpVelocity = -700
        this.hurtDuration = 1000

        this.isInvincible = false

        this.stateMachine = new StateMachine('idle', {
            idle: new CrabIdleState(),
            walk: new CrabWalkState(),
            jump: new CrabJumpState(),
            attack: new CrabAttackState(),
            hurt: new CrabHurtState()
        }, [scene, this])
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

        if(crab.isInvincible) return

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

        crab.once('animationcomplete', () => {
            this.stateMachine.transition('idle')
        })
    }

    execute(scene, crab) {
        if(crab.isInvincible) {
            this.stateMachine.transition('hurt')
        }
    }
}

class CrabHurtState extends State {
    enter(scene, crab) {
        crab.isInvincible = true
        crab.setTint(0x888888)

        crab.setVelocityY(-300)

        scene.time.delayedCall(crab.hurtDuration, () => {
            crab.clearTint()
            crab.isInvincible = false
            this.stateMachine.transition('idle')
        })
    }

    execute(scene, crab) {
        crab.setVelocityX(0)
    }
}
