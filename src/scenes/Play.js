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

        this.fishMinSpacing = 10
        this.fishMaxSpacing = 50
        this.fishSpeed = -400

        this.fishTints = [0xEA450B, 0xFE5A1D, 0xFFA324, 0xFFB300, 0xFFCF21]

        this.fishLanes = [
            this.scale.height - 60, 
            this.scale.height - 140, 
            this.scale.height - 220  
        ]
        this.lastFishX = this.scale.width
        this.spawnFish()
    }

    spawnFish() {
        let spawnX = this.lastFishX + Phaser.Math.Between(this.fishMinSpacing, this.fishMaxSpacing)

        let laneY = Phaser.Utils.Array.GetRandom(this.fishLanes)
        let fish = new Fish(this, spawnX, laneY)
        fish.setVelocityX(this.fishSpeed)

        fish.setTint(Phaser.Utils.Array.GetRandom(this.fishTints))

        this.lastFishX = spawnX

        return fish
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

        this.children.list.forEach(child => {
            if(child instanceof Fish && child.x < -100) {
                child.destroy()
                this.spawnFish()
            }
        })
    }
}