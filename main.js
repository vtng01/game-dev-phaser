import Phaser, { Game } from "phaser";
import Character from "./Character";

let player;
let cursors;
let grasses;
let grassesActive;
let playerBattlePosition;
let opponent;
let allCharacters = [1, 2];
let p1;
let p2;
let turnIndicator;

let buttons = Phaser.GameObjects.Image;
let selectedButton = 0;

const mainGameConfig = {
  key: "mainGame",
  preload: preload,
  create: create,
  update: update,
};

const battleSceneConfig = {
  key: "battleScene",
  preload: battleScenePreload,
  create: battleSceneCreate,
  update: battleSceneUpdate,
};

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
  scene: [mainGameConfig, battleSceneConfig],
});

function preload() {
  this.load.image("tiles", "assets/RPG Nature Tileset.png");
  this.load.tilemapTiledJSON("map", "assets/map.json");
  this.load.spritesheet("character", "assets/character.png", {
    frameWidth: 16,
    frameHeight: 20,
  });
  this.load.image("grass", "assets/grass-single.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

  this.load.image("grass-active", "assets/grass-active.png");

  cursors = this.input.keyboard.createCursorKeys();
}

function create() {
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
  allCharacters[0] = new Character(100, 25);

  console.log(allCharacters);
  player.setCollideWorldBounds(true);

  grassesActive = this.physics.add.group();
  grasses = this.physics.add.group();
  grasses.create(200, 200, "grass");
  grasses.create(100, 200, "grass");
  grassesActive.create(100, 200, "grass-active");
  this.physics.add.overlap(player, grassesActive, loadBattleScene, null, this);

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
}

function update() {
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
}

function battleScenePreload() {
  this.load.tilemapTiledJSON("battlemap", "assets/battlemap.json");
  this.load.image("playerBattlePosition", "assets/playerBattlePosition.png");
  this.load.image("glassPanel", "assets/glassPanel.png");
  this.load.image("pikachu", "assets/pikachu.png");
}

function battleSceneCreate() {
  console.log(this);
  const battlemap = this.make.tilemap({ key: "battlemap" });
  const tileset2 = battlemap.addTilesetImage(
    "RPG Nature Tileset",
    "tiles",
    32,
    32,
    0,
    0
  );
  const layer1 = battlemap.createLayer("Tile Layer 2", tileset2, 0, 0);

  turnIndicator = this.add.text(16, 16, "It's your turn!", {
    fontSize: "32px",
    fill: "#000",
  });
  playerBattlePosition = this.physics.add.sprite(
    0.25 * 512,
    0.75 * 512,
    "playerBattlePosition"
  );

  opponent = this.physics.add.sprite(0.75 * 512, 0.25 * 512, "pikachu");
  allCharacters[1] = new Character(100, 20);

  const attackButton = this.add
    .image(0.75 * 512, 310, "glassPanel")
    .setDisplaySize(200, 50);
  this.add.text(attackButton.x, attackButton.y, "Attack").setOrigin(0.5);
  attackButton.setInteractive();
  attackButton.on("pointerdown", attack);

  const runButton = this.add
    .image(0.75 * 512, 400, "glassPanel")
    .setDisplaySize(200, 50);
  this.add.text(runButton.x, runButton.y, "Run").setOrigin(0.5);
  runButton.setInteractive();
  runButton.on("pointerdown", flee);
}

function battleSceneUpdate() {
  if (allCharacters[0] && allCharacters[0].hp <= 0) {
    console.log("Game over. You fainted.");
    allCharacters[player].hp = 100;
    this.scene.switch("mainGame");
  }

  if (allCharacters[1] && allCharacters[1].hp <= 0) {
    console.log("The opponent fainted.");
    this.scene.switch("mainGame");
  }
}

function loadBattleScene(player, grass) {
  player.setVelocityX(0);
  player.setVelocityY(0);
  grass.disableBody(true, true);
  console.log("loading battle scene", this.scene);
  this.scene.switch("battleScene");
}

async function attack() {
  console.log(allCharacters);
  p1 = allCharacters[0];
  p2 = allCharacters[1];

  console.log("Opponent health: ", p2.hp);
  p1.attack(p2);
  console.log("You attacked the Opponent");
  console.log("Opponent health is now: ", p2.hp);
  turnIndicator.setText("Your opponent is planning!");
  await wait(3);

  console.log("Your Opponent attacked you!");
  p2.attack(p1);
  turnIndicator.setText("It's your turn!");
  console.log("Your health is now: ", p1.hp);
}

function flee() {
  console.log("attempting to flee");
  this.scene.scene.switch("mainGame");
}

async function wait(time) {
  await new Promise((resolve) => setTimeout(resolve, time * 1000));
}
