class Load extends Phaser.Scene {
    constructor() {
        super("loadScene")
    }

    preload() {
        this.load.path = './assets/'

        this.load.image('B1', 'B1.png')
        this.load.image('B2', 'B2.png')
        this.load.image('B3', 'B3.png')
        this.load.image('B4', 'B4.png')
        this.load.image('B5', 'B5.png')
        this.load.image('B6', 'B6.png')

        this.load.spritesheet('crab', 'CrabSpritesheet.png', {
            frameWidth: 40,
            frameHeight: 40,
        })

        this.load.spritesheet('lobster', 'LobsterSpritesheet.png', {
            frameWidth: 61,
            frameHeight: 43,
        })

        this.load.spritesheet('shrimp', 'ShrimpSpritesheet.png', {
            frameWidth: 66,
            frameHeight: 44,
        })

        this.load.spritesheet('fish', 'FishSpritesheet.png', {
            frameWidth: 31,
            frameHeight: 24,
        })

        this.load.spritesheet('koi', 'KoiSpritesheet.png', {
            frameWidth: 182,
            frameHeight: 185,
        })

    }

    create() {
        // crab animations
        this.anims.create({
            key: 'Cwalk',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('crab', { start: 0, end: 3 }),
        })
        this.anims.create({
            key: 'Cattack',
            frameRate: 12,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('crab', { start: 4, end: 7 }),
        })
        this.anims.create({
            key: 'Cjump',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('crab', { start: 8, end: 11 }),
        })
        
        // lobster animations
        this.anims.create({
            key: 'Lwalk',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('lobster', { start: 0, end: 2 }),
        })
        this.anims.create({
            key: 'Lattack',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('lobster', { start: 3, end: 5 }),
        })
        this.anims.create({
            key: 'Ldown',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('lobster', { start: 6, end: 8 }),
        })
        this.anims.create({
            key: 'Lup',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('lobster', { start: 9, end: 9 }),
        })

        // shrimp animations
        this.anims.create({
            key: 'Swalk',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('shrimp', { start: 0, end: 3 }),
        })
        this.anims.create({
            key: 'Sdown',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('shrimp', { start: 4, end: 7 }),
        })
        this.anims.create({
            key: 'Sup',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('shrimp', { start: 8, end: 11 }),
        })

        // fish animations
        this.anims.create({
            key: 'Fwalk',
            frameRate: 4,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('fish', { start: 0, end: 1 }),
        })
        this.anims.create({
            key: 'Fdie',
            frameRate: 4,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('fish', { start: 2, end: 2 }),
        })

        // koi animations
        this.anims.create({
            key: 'Kbite',
            frameRate: 2,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('koi', { start: 0, end: 1 }),
        })
        
        this.scene.start('menuScene')
    }
}
