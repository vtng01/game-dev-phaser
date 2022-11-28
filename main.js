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
    },
    update() {},
  },
});
