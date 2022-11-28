import Phaser, { Create, Game } from "phaser";

let player;
let cursors;

const myGame = new Game({
  type: Phaser.AUTO,
  width: 512,
  height: 512,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: {
    preload() {
      this.load.image("tiles", "assets/RPG Nature Tileset.png");
      this.load.tilemapTiledJSON("map", "assets/map.json");
      this.load.spritesheet("character", "assets/character.png", {
        frameWidth: 16,
        frameHeight: 20,
      });
      cursors = this.input.keyboard.createCursorKeys();
    },

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

      player = this.physics.add.sprite(256, 256, "character");
      player.setCollideWorldBounds(true);

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
    },
    update() {
      if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play("right", true);
      } else if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play("left", true);
      } else if (cursors.up.isDown) {
        player.setVelocityY(-160);
        player.anims.play("up", true);
      } else if (cursors.down.isDown) {
        player.setVelocityY(160);
        player.anims.play("down", true);
      } else {
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.anims.play("idle");
      }
    },
  },
});
