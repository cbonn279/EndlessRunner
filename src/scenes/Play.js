class Play extends Phaser.Scene {
    constructor() {
        super("playScene")
    }

    create(data) {
        this.selectedCrustaceon = data.crustaceon || 1

        const createLayer = (key, speed) => {

            let pond = this.textures.get(key).getSourceImage()
            let scaledHeight = pond.height * 4

            let layer = this.add.tileSprite(0, this.scale.height - scaledHeight, this.scale.width, scaledHeight, key).setOrigin(0)
            layer.setScale(4)
            layer.scrollSpeed = speed

            return layer
        }

        // parallax
        this.B1 = createLayer('B1', 0.01)
        this.B2 = createLayer('B2', 0.05)
        this.B3 = createLayer('B3', 0.08)
        this.B4 = createLayer('B4', 0.1)
        this.B5 = createLayer('B5', 0.2)
        this.B6 = createLayer('B6', 0.5)

        this.keys = this.input.keyboard.createCursorKeys()

        // ground
        this.ground = this.physics.add.staticGroup()
        this.ground.create(this.scale.width / 2, this.scale.height - 30, null).setDisplaySize(this.scale.width, 20).refreshBody()
        this.ground.children.iterate(child => {
            child.setVisible(false)
        })

        // background to camera
        const baseBg = this.textures.get('B1').getSourceImage()
        this.bgScaledHeight = baseBg.height * 4
        this.worldTopY = this.scale.height - this.bgScaledHeight
        this.physics.world.setBounds(0, this.worldTopY, this.scale.width, this.bgScaledHeight)
        this.cameras.main.setBounds(0, this.worldTopY, this.scale.width, this.bgScaledHeight)
        this.cameras.main.scrollX = 0
        this.cameras.main.scrollY = 0


        // spawn crustaceon
        const groundTop = this.scale.height - 30
        const spawnX = 200
        const spawnY = groundTop - 80

        switch (this.selectedCrustaceon) {
            case 1:
                this.crustaceon = new Crab(this, spawnX, spawnY, 'crab', 0)
                break
            case 2:
                this.crustaceon = new Lobster(this, spawnX, spawnY, 'lobster', 0)
                break
            case 3:
                this.crustaceon = new Shrimp(this, spawnX, spawnY, 'shrimp', 0)
                break
        }

        this.physics.add.collider(this.crustaceon, this.ground)

        // health UI
        this.CrustaceonHealth = 3
        this.healthRects = []
        const rectW = 30
        const rectH = 12
        const padding = 6
        const startX = 10
        const startY = 10

        for (let i = 0; i < this.CrustaceonHealth; i++) {
            const r = this.add.rectangle(startX + i * (rectW + padding), startY, rectW, rectH, 0xFF0000).setOrigin(0, 0)
            r.setScrollFactor(0)            // keep health rect fixed on screen
            this.healthRects.push(r)
        }

        this.updateHealthDisplay = function () {
            const cur = (this.crustaceon && typeof this.crustaceon.health === 'number')
                ? this.crustaceon.health
                : 0

            for (let i = 0; i < this.healthRects.length; i++) {
                if (i < cur) {
                    this.healthRects[i].setFillStyle(0x00FF00)
                } else {
                    this.healthRects[i].setFillStyle(0x888888)
                }
            }
        }.bind(this)
        this.updateHealthDisplay()

        // score UI
        this.score = 0
        const savedHigh = localStorage.getItem('HighScore')
        this.highScore = savedHigh ? parseInt(savedHigh) : 0
        this.scoreText = this.add.text(this.scale.width - 20, 10, 'SCORE: 0', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(1, 0).setScrollFactor(0)

        this.updateScoreDisplay = function () {
            this.scoreText.setText('SCORE: ' + this.score)
        }.bind(this)

        this.updateScoreDisplay()

        // fish features
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

        // koi callibrations
        this.koi = new Koi(this, this.scale.width * 0.5, this.worldTopY - 220)
        this.koi.setVisible(true)

        this.koiTargetY = this.worldTopY + 160
        this.koiBiteRange = 80
        this.koiLowerDuration = 1600
        this.koiRetreatDuration = 900
        this.koiLungeDuration = 300
        this.koiAutoLungeProximity = 500

        this.koiBiteConfig = {
            width: 140,
            height: 90,
            offsetX: 0,
            offsetY: 10
        }

        this.koiDiveTimes = [3000, 5000, 8000, 12000]
        this.koiBusy = false
        this.koiTimer = null
        this.scheduleNextKoiDive = () => {
            if (this.koiTimer) this.koiTimer.remove(false)
            const delay = Phaser.Utils.Array.GetRandom(this.koiDiveTimes)
            this.koiTimer = this.time.delayedCall(delay, () => this.startKoiLower(), [], this)
        }
        this.scheduleNextKoiDive()

        // hitbox interactions
        this.hitboxGroup = this.physics.add.group()
        this.physics.add.overlap(this.hitboxGroup, this.crustaceon, this.damageCrustaceon, null, this)
        this.physics.add.overlap(this.hitboxGroup, this.fishGroup, this.damageFish, null, this)
        this.physics.add.overlap(this.crustaceon, this.hitboxGroup, this.damageCrustaceon, null, this)
        this.physics.add.overlap(this.fishGroup, this.hitboxGroup, this.damageFish, null, this)

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

         const hb = this.spawnHitbox(fish, 'rect', {
            width: 100,
            height: 80,
            offsetX: 0,
            offsetY: 0,
            duration: 0,  
            follow: true,
            damage: 1,
            team: 'enemy'
        })
        return fish
    }

    spawnHitbox(owner, shape = 'rect', cfg = {}) {
        const hb = new Hitbox(this, owner, shape, {
            width: cfg.width ?? 48,
            height: cfg.height ?? 32,
            offsetX: cfg.offsetX ?? 40,
            offsetY: cfg.offsetY ?? 0,
            duration: cfg.duration ?? 150,
            follow: cfg.follow ?? false,
            damage: cfg.damage ?? 1,
            team: cfg.team ?? (owner && owner.texture && owner.texture.key === 'fish' ? 'enemy' : 'crustaceon')
        })

        hb.offsetX = cfg.offsetX ?? 40
        hb.offsetY = cfg.offsetY ?? 0

        this.hitboxGroup.add(hb)
        return hb
    }

    damageFish(a, b) {
        const normalize = (obj) => {
            if (!obj) return obj
            if (obj.gameObject) return obj.gameObject
            return obj
        }

        const nA = normalize(a)
        const nB = normalize(b)

        let hitbox = null
        let fish = null

        if (nA instanceof Hitbox) hitbox = nA
        if (nB instanceof Hitbox) hitbox = nB

        if (nA instanceof Fish) fish = nA
        if (nB instanceof Fish) fish = nB

        if (!hitbox || !fish) return

        if (hitbox.team !== 'crustaceon') return

        if (!fish.active) return
        if (!hitbox.owner) return
        if (hitbox.owner === fish) return
        if (fish.dying) return

        fish.dying = true
        if (!fish.scored) {
            this.score += 1
            fish.scored = true
            this.updateScoreDisplay()
        }
        if (fish.followHitbox) {
            fish.followHitbox.destroy()
            fish.followHitbox = null
        }
        fish.anims.play('Fdie')

        if (fish.body) {
            fish.body.setVelocityX(0)
            fish.body.setImmovable(false)
        }

        this.tweens.add({
            targets: fish,
            y: fish.y - 40,
            scale: fish.scale * 0.5,
            alpha: 0,
            ease: 'Cubic.easeOut',
            duration: 1500,
            onComplete: () => {
                if (fish && fish.destroy) fish.destroy()
            }
        })
    }

    damageCrustaceon(a, b) {
        let hitbox = null
        let crustaceon = null

        const normalize = (obj) => {
            if (!obj) return obj
            if (obj.gameObject) return obj.gameObject
            return obj
        }

        const nA = normalize(a)
        const nB = normalize(b)

        if (nA instanceof Hitbox) hitbox = nA
        if (nB instanceof Hitbox) hitbox = nB

        if (nA === this.crustaceon) crustaceon = nA
        if (nB === this.crustaceon) crustaceon = nB

        if (!hitbox || !crustaceon) {
            return
        }

        if (hitbox.body && !hitbox.body.enable) return
        if (crustaceon.body && !crustaceon.body.enable) return

        if (hitbox.team !== 'enemy') return

        if (crustaceon.isInvincible) return

        const damaged = crustaceon.takeDamage(hitbox.damage || 1)
        if (damaged) {

            this.updateHealthDisplay()

            if (crustaceon.health <= 0) {
                let newHigh = false
                if (this.score > this.highScore) {
                    this.highScore = this.score
                    localStorage.setItem('HighScore', this.highScore)
                    newHigh = true
                }
                this.scene.start('gameoverScene', {
                    score: this.score,
                    highScore: this.highScore,
                    newHigh: newHigh
                })
            }
        }
    }

    // koi functions
    startKoiLower() {
        if (!this.koi || this.koiBusy) return

        this.koiBusy = true
        this.koiBitThisCycle = false

        this.koiLockedX = Phaser.Math.Clamp(this.crustaceon.x, 50, this.scale.width - 50)

        this.koi.anims.play('Kblub', true)

        this.tweens.add({
            targets: this.koi,
            x: this.koiLockedX,
            duration: 200,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.tweens.add({
                    targets: this.koi,
                    y: this.koiTargetY,
                    duration: this.koiLowerDuration,
                    ease: 'Sine.easeInOut',
                    onComplete: () => this.koiDecideBite()
                })
            }
        })
    }

    startImmediateKoiBite() {
        if (!this.koi || this.koiBusy) return

        this.koiBusy = true
        this.koi.x = Phaser.Math.Clamp(this.crustaceon.x, 50, this.scale.width - 50)
        this.koiLungeAndBite()
    }

    koiDecideBite() {
        if (!this.koi || !this.crustaceon) {
            this.koiRetreat()
            return
        }

        const dx = Math.abs(this.koiLockedX - this.crustaceon.x)

        if (dx <= this.koiBiteRange) {
            this.koiLungeAndBite()
        } else {
            this.koiRetreat()
        }
    }

    koiLungeAndBite() {
        if (!this.koi || !this.crustaceon) {
            this.koiRetreat()
            return
        }

        this.koiBitThisCycle = true

        try { this.koi.anims.play('Kblub', true) } catch (e) {}

        const cfg = this.koiBiteConfig || { width: 140, height: 90, offsetX: 0, offsetY: 10 }
        const biteW = cfg.width
        const biteH = cfg.height
        const extraOffsetY = cfg.offsetY || 0
        const offsetX = cfg.offsetX || 0

        this._koiBiteZone = this.add.zone(
            this.koi.x + offsetX,
            this.koi.y + (this.koi.displayHeight / 2) + extraOffsetY,
            biteW,
            biteH
        )

        this.physics.add.existing(this._koiBiteZone)

        if (this._koiBiteZone.body) {
            this._koiBiteZone.body.setAllowGravity(false)
            this._koiBiteZone.body.setImmovable(true)
        }

        let biteConnected = false

        this._koiBiteCollider = this.physics.add.overlap(
            this._koiBiteZone,
            this.crustaceon,
            () => {
                if (biteConnected) return
                biteConnected = true

                this.crustaceon.health = Math.max(
                    0,
                    (this.crustaceon.health || 0) - 3
                )
                this.updateHealthDisplay()
            },
            null,
            this
        )

        const targetY = (this.crustaceon.y || (this.worldTopY + 200)) - 350

        this.tweens.add({
            targets: this.koi,
            y: targetY,
            ease: 'Expo.easeIn',
            duration: this.koiLungeDuration,

            onUpdate: () => {
                if (this._koiBiteZone && this._koiBiteZone.body && this.koi) {
                    this._koiBiteZone.x = this.koi.x + offsetX
                    this._koiBiteZone.y =
                        this.koi.y +
                        (this.koi.displayHeight / 2) +
                        extraOffsetY

                    this._koiBiteZone.body.position.x =
                        this._koiBiteZone.x -
                        this._koiBiteZone.body.width / 2

                    this._koiBiteZone.body.position.y =
                        this._koiBiteZone.y -
                        this._koiBiteZone.body.height / 2
                }
            },

            onComplete: () => {
                try { this.koi.anims.play('Kbite', true) } catch (e) {}

                try {
                    if (this._koiBiteCollider) {
                        this.physics.world.removeCollider(this._koiBiteCollider)
                        this._koiBiteCollider = null
                    }
                } catch (e) {}

                try {
                    if (this._koiBiteZone && this._koiBiteZone.destroy) {
                        this._koiBiteZone.destroy()
                        this._koiBiteZone = null
                    }
                } catch (e) {}

                this.time.delayedCall(180, () => {
                    if (biteConnected) {
                        if (this.crustaceon && this.crustaceon.health <= 0) {
                            let newHigh = false
                            if (this.score > this.highScore) {
                                this.highScore = this.score
                                localStorage.setItem('HighScore', this.highScore)
                                newHigh = true
                            }
                            this.scene.start('gameoverScene', {
                                score: this.score,
                                highScore: this.highScore,
                                newHigh: newHigh
                            })
                            return
                        }
                    }

                    this.koiRetreat()
                })
            }
        })
    }

    koiRetreat() {
        if (!this.koi) {
            this.koiBusy = false
            this.scheduleNextKoiDive()
            return
        }

        const retreatY = this.worldTopY - 220

        try { this.koi.anims.play('Kbite', true) } catch (e) {}

        this.tweens.add({
            targets: this.koi,
            y: retreatY,
            ease: 'Sine.easeInOut',
            duration: this.koiRetreatDuration,
            onComplete: () => {
                this.koiBusy = false
                this.koiLockedX = null

                try { this.koi.anims.play('Kblub', true) } catch (e) {}

                this.scheduleNextKoiDive()
            }
        })
    }

    update() {
        if (this.crustaceon) {
            this.crustaceon.stateMachine.step()
        }

        if (this.crustaceon) {
            const cam = this.cameras.main
            const camH = cam.height
            const targetY = this.crustaceon.y - camH / 2 

            const camTopLimit = this.worldTopY
            const camBottomLimit = this.worldTopY + this.bgScaledHeight - camH

            const clamped = Phaser.Math.Clamp(targetY, this.worldTopY, camBottomLimit)

            const lerp = 0.12
            cam.scrollY = Phaser.Math.Interpolation.Linear([cam.scrollY, clamped], lerp)
            cam.scrollX = 0
        }

        if (this.koi && this.crustaceon && !this.koiBusy) {
            this.koi.x = Phaser.Math.Linear(
                this.koi.x,
                this.crustaceon.x,
                0.08
            )
            const dy = Math.abs(this.koi.y - this.crustaceon.y)
            if (typeof this.koiAutoLungeProximity === 'number' && dy <= this.koiAutoLungeProximity) {
                this.startImmediateKoiBite()
            }
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

            if (this.crustaceon && this.crustaceon.body) {
                const b = this.crustaceon.body
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