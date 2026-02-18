class Play extends Phaser.Scene {
    constructor() {
        super("playScene")
    }

    create(data) {

        this.selectedCharacter = data.character

        const createLayer = (key, speed) => {

            let pond = this.textures.get(key).getSourceImage()
            let scaledHeight = pond.height * 4

            let layer = this.add.tileSprite(
                0,
                this.scale.height - scaledHeight,
                this.scale.width,
                scaledHeight,
                key
            ).setOrigin(0)

            layer.setScale(4)
            layer.scrollSpeed = speed

            return layer
        }

        this.B1 = createLayer('B1', 0.05)
        this.B2 = createLayer('B2', 0.1)
        this.B3 = createLayer('B3', 0.2)
        this.B4 = createLayer('B4', 0.5)
        this.B5 = createLayer('B5', 0.7)
        this.B6 = createLayer('B6', 1)

        this.keys = this.input.keyboard.createCursorKeys()

        this.ground = this.physics.add.staticGroup()

        this.ground.create(
            this.scale.width / 2,
            this.scale.height - 10,
            null
        )
        .setDisplaySize(this.scale.width, 20)
        .refreshBody()

        this.ground.children.iterate(child => {
            child.setVisible(false)
        })

        this.crab = new Crab(
            this,
            200,
            this.scale.height - 100,
            'crab',
            0
        )

        this.physics.add.collider(this.crab, this.ground)

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
    }

}