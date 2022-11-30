import Character from "./Character";

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "mainScene" });
    this.player;
    this.cursors;
    this.grasses;
    this.grassesActive;
    this.grassX = [];
    this.grassY = [];
  }

  preload() {
    this.load.image("tiles", "assets/RPG Nature Tileset.png");
    this.load.tilemapTiledJSON("map", "assets/map.json");
    this.load.spritesheet("character", "assets/character.png", {
      frameWidth: 16,
      frameHeight: 20,
    });
    this.load.image("grass", "assets/grass-single.png");

    this.load.spritesheet("grass-active", "assets/grass-active2.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage(
      "RPG Nature Tileset",
      "tiles",
      32,
      32,
      0,
      0
    );
    const layer1 = map.createLayer("Tile Layer 1", tileset, 0, 0);

    this.grasses = this.physics.add.group();

    this.grassX = Array.from({ length: 12 }, (x, i) => 100 + 16 * i);

    this.grassY = Array.from({ length: 5 }, (y, i) => 200 + 20 * i);

    for (let i = 0; i < 5; i++) {
      this.grasses.createMultiple({
        key: "grass",
        repeat: 12,
        setXY: { x: 100, y: 200 + 20 * i, stepX: 16 },
      });
    }

    this.grassesActive = this.physics.add.group();
    this.spawnActiveBrushes();

    this.player = this.physics.add.sprite(400, 256, "character");

    this.player.setCollideWorldBounds(true);

    this.physics.add.overlap(
      this.player,
      this.grassesActive,
      this.loadBattleScene,
      null,
      this
    );

    this.anims.create({
      key: "grassActivity",
      frames: this.anims.generateFrameNumbers("grass-active", {
        start: 0,
        end: 1,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("character", {
        start: 7,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("character", {
        start: 4,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("character", {
        start: 10,
        end: 12,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("character", {
        start: 1,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "idle",
      frames: [{ key: "character", frame: 0 }],
      frameRate: 20,
    });

    this.grassesActive.playAnimation("grassActivity");
  }

  update() {
    if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
      this.player.anims.play("up", true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
      this.player.anims.play("down", true);
    } else {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
      this.player.anims.play("idle");
    }
  }

  async loadBattleScene(player, grass) {
    this.spawnActiveBrushes();
    player.setVelocityX(0);
    player.setVelocityY(0);
    console.log("loading battle scene", this.scene);
    this.scene.switch("battleScene");
  }

  spawnActiveBrushes() {
    this.grassesActive.clear(true, true);
    let numOfActives = Phaser.Math.Between(1, 12);

    for (let i = 0; i < numOfActives; i++) {
      let x = this.grassX[Phaser.Math.Between(0, this.grassX.length - 1)];
      let y = this.grassY[Phaser.Math.Between(0, this.grassY.length - 1)];
      this.grassesActive.create(x, y, "grass-active");
    }
  }
}
