class Play extends Phaser.Scene {
    constructor() {
        super("playScene")
    }

    create(data) {
        this.selectedCharacter = data.character

        const createLayer = (key, speed) => {

            let pond = this.textures.get(key).getSourceImage()
            let scaledHeight = pond.height * 4

            let layer = this.add.tileSprite(0, this.scale.height - scaledHeight, this.scale.width, scaledHeight, key).setOrigin(0)
            layer.setScale(4)
            layer.scrollSpeed = speed

            return layer
        }

        this.B1 = createLayer('B1', 0.01)
        this.B2 = createLayer('B2', 0.05)
        this.B3 = createLayer('B3', 0.08)
        this.B4 = createLayer('B4', 0.1)
        this.B5 = createLayer('B5', 0.2)
        this.B6 = createLayer('B6', 0.5)

        this.keys = this.input.keyboard.createCursorKeys()

        this.ground = this.physics.add.staticGroup()

        this.ground.create(this.scale.width / 2, this.scale.height - 30, null).setDisplaySize(this.scale.width, 20).refreshBody()

        this.ground.children.iterate(child => {
            child.setVisible(false)
        })

        this.crab = new Crab(this, 200, this.scale.height - 100, 'crab', 0)

        this.physics.add.collider(this.crab, this.ground)

        this.fishSpeed = [
            -500,
            -400,
            -300,
        ]

        this.fishLanes = [
            this.scale.height - 80,
            this.scale.height - 90,
            this.scale.height - 100,
            this.scale.height - 120,
            this.scale.height - 180,
            this.scale.height - 240,
            this.scale.height - 400,
        ]

        this.fishTints = [0xEA450B, 0xFE5A1D, 0xFFA324, 0xFFB300, 0xFFCF21]

        this.fishGroup = this.physics.add.group()
        this.time.addEvent({
            delay: 800,
            callback: this.spawnFish,
            callbackScope: this,
            loop: true
        })

        this.hitboxGroup = this.physics.add.group()

        this.physics.add.overlap(this.hitboxGroup, this.fishGroup, this.onHitboxHitsEnemy, null, this)

        this.physics.add.overlap(this.fishGroup, this.crab, this.onEnemyHitsPlayer, null, this)

        this.debugBoxes = false
        this.debugGraphics = this.add.graphics()
        this.input.keyboard.on('keydown-D', () => {
            this.debugBoxes = !this.debugBoxes
            this.debugGraphics.clear()
        })
    }


    spawnFish() {
        let laneY = Phaser.Utils.Array.GetRandom(this.fishLanes)
        let fspeed = Phaser.Utils.Array.GetRandom(this.fishSpeed)

        let fish = new Fish(this, this.scale.width + 100, laneY)

        this.fishGroup.add(fish)

        if (fish.body) {
            fish.body.setAllowGravity(false)
            fish.body.setImmovable(true)
            fish.body.setVelocityX(fspeed)
        } else {
            fish.setVelocityX(fspeed)
        }

        fish.setTint(Phaser.Utils.Array.GetRandom(this.fishTints))
        return fish
    }

    spawnHitbox(owner, shape = 'rect', cfg = {}) {
        const hb = new Hitbox(this, owner, shape, {
            width: cfg.width || 48,
            height: cfg.height || 32,
            offsetX: cfg.offsetX || 40,
            offsetY: cfg.offsetY || 0,
            duration: cfg.duration || 150,
            follow: cfg.follow || false,
            damage: cfg.damage || 1
        })

        hb.offsetX = cfg.offsetX || 40
        hb.offsetY = cfg.offsetY || 0

        this.hitboxGroup.add(hb)
        return hb
    }

    onHitboxHitsEnemy(hitbox, fish) {
        if (!fish || !fish.active) return
        if (!hitbox || !hitbox.owner) return

        if (hitbox.owner === fish) return

        if (fish._dying) return
        fish._dying = true

        fish.anims.play('Fdie')

        if (fish.body) {
            fish.body.setVelocityX(0)
            fish.body.setImmovable(false)
        }

        this.tweens.add({
            targets: fish,
            y: fish.y - 40,
            scale: fish.scale * 0.5,
            ease: 'Cubic.easeOut',
            duration: 800,
            onComplete: () => {
                if (fish && fish.destroy) fish.destroy()
            }
        })
    }

    onEnemyHitsPlayer(fish, maybePlayer) {
        let player = maybePlayer

        if (maybePlayer && maybePlayer.gameObject) {
            player = maybePlayer.gameObject
        }

        if (!player || typeof player.takeDamage !== 'function') {
            console.warn('onEnemyHitsPlayer: player has no takeDamage()', player)
            return
        }

        if (!player.active || !fish || !fish.active) return

        if (player.isInvincible) return

        const damaged = player.takeDamage()
        if (damaged) {
            if (fish && fish.destroy) {
                this.tweens.add({
                    targets: fish,
                    y: fish.y - 20,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => fish.destroy()
                })
            }
        }
    }



    update() {
        if(this.crab) {
            this.crab.stateMachine.step()
        }

        this.B1.tilePositionX += this.B1.scrollSpeed
        this.B2.tilePositionX += this.B2.scrollSpeed
        this.B3.tilePositionX += this.B3.scrollSpeed
        this.B4.tilePositionX += this.B4.scrollSpeed
        this.B5.tilePositionX += this.B5.scrollSpeed
        this.B6.tilePositionX += this.B6.scrollSpeed

        this.fishGroup.children.iterate(fish => {
            if (fish && fish.x < -100) {
                fish.destroy()
            }
        })

        if (this.debugBoxes) {
            this.debugGraphics.clear()
            this.debugGraphics.lineStyle(2, 0xff00ff, 1)

            if (this.crab && this.crab.body) {
                const b = this.crab.body
                this.debugGraphics.strokeRect(b.x, b.y, b.width, b.height)
            }

            this.fishGroup.getChildren().forEach(f => {
                if (f && f.body) {
                    const b = f.body
                    this.debugGraphics.lineStyle(2, 0xff0000, 1)
                    this.debugGraphics.strokeRect(b.x, b.y, b.width, b.height)
                }
            })

            this.hitboxGroup.getChildren().forEach(hb => {
                if (hb && hb.body) {
                    const b = hb.body
                    this.debugGraphics.lineStyle(2, 0x00ff00, 1)
                    if (hb.shape === 'circle') {
                        const cx = b.x + b.halfWidth
                        const cy = b.y + b.halfHeight
                        this.debugGraphics.strokeCircle(cx, cy, b.halfWidth)
                    } else {
                        this.debugGraphics.strokeRect(b.x, b.y, b.width, b.height)
                    }
                }
            })
        } else {
            this.debugGraphics.clear()
        }
    }
}