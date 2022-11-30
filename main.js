import Phaser, { Game } from "phaser";
import Character from "./Character";

let player;
let cursors;
let grasses;
let grassesActive;
let allCharacters = [1, 2];
let p1;
let p2;
let turnIndicator;
let buttonSelector;
let buttons = [];
let selectedButtonIndex = 0;
let battleSceneCursors;
let grassX = [];
let grassY = [];

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
  pixelArt: true,
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
  this.load.image("grass", "assets/grass-single.png");

  this.load.spritesheet("grass-active", "assets/grass-active2.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

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

  grasses = this.physics.add.group();

  grassX = Array.from({ length: 12 }, (x, i) => 100 + 16 * i);

  grassY = Array.from({ length: 5 }, (y, i) => 200 + 20 * i);

  console.log(grassX);
  console.log(grassY);

  for (let i = 0; i < 5; i++) {
    grasses.createMultiple({
      key: "grass",
      repeat: 12,
      setXY: { x: 100, y: 200 + 20 * i, stepX: 16 },
    });
  }

  grassesActive = this.physics.add.group();
  spawnActiveBrushes();

  player = this.physics.add.sprite(400, 256, "character");
  allCharacters[0] = new Character(100, 25);

  console.log(allCharacters);
  player.setCollideWorldBounds(true);
  console.log("from create", this);

  this.physics.add.overlap(player, grassesActive, loadBattleScene, null, this);

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

  grassesActive.playAnimation("grassActivity");
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
  this.load.image("cursorHand", "assets/cursor_pointer3D.png");
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
  this.physics.add.sprite(0.25 * 512, 0.75 * 512, "playerBattlePosition");

  this.physics.add.sprite(0.75 * 512, 0.25 * 512, "pikachu");

  const attackButton = this.add
    .image(0.75 * 512, 310, "glassPanel")
    .setDisplaySize(200, 50);
  this.add.text(attackButton.x, attackButton.y, "Attack").setOrigin(0.5);
  attackButton.setInteractive();
  attackButton.on("pointerdown", attack);
  attackButton.on("selected", attack);

  const runButton = this.add
    .image(0.75 * 512, 400, "glassPanel")
    .setDisplaySize(200, 50);
  this.add.text(runButton.x, runButton.y, "Run").setOrigin(0.5);
  runButton.setInteractive();
  runButton.on("pointerdown", flee);
  runButton.on("selected", flee);

  buttons.push(attackButton);
  buttons.push(runButton);

  buttonSelector = this.add.image(0.5 * 512, 0.5 * 512, "cursorHand");

  battleSceneCursors = this.input.keyboard.createCursorKeys();
  selectButton(0);
}

function battleSceneUpdate() {
  const upJustPressed = Phaser.Input.Keyboard.JustDown(battleSceneCursors.up);
  const downJustPressed = Phaser.Input.Keyboard.JustDown(
    battleSceneCursors.down
  );
  const spaceJustPressed = Phaser.Input.Keyboard.JustDown(
    battleSceneCursors.space
  );

  if (allCharacters[0] && allCharacters[0].hp <= 0) {
    console.log("Game over. You fainted.");
    this.scene.switch("mainGame");
    allCharacters[0].hp = 100;
    grassesActive.playAnimation("grassActivity");
  }

  if (allCharacters[1] && allCharacters[1].hp <= 0) {
    console.log("The opponent fainted.");
    this.scene.switch("mainGame");
    grassesActive.playAnimation("grassActivity");
  }

  if (upJustPressed) {
    selectNextButton(1);
  } else if (downJustPressed) {
    selectNextButton(-1);
  } else if (spaceJustPressed) {
    confirmSelection();
  }
}

async function loadBattleScene(player, grass) {
  allCharacters[1] = new Character(100, 20);
  spawnActiveBrushes();
  player.setVelocityX(0);
  player.setVelocityY(0);
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

async function flee() {
  console.log("fleeing...");
  this.scene.scene.switch("mainGame");
  grassesActive.playAnimation("grassActivity");
}

async function wait(time) {
  await new Promise((resolve) => setTimeout(resolve, time * 1000));
}

function selectButton(index) {
  const currentButton = buttons[selectedButtonIndex];
  currentButton.setTint(0xffffff);
  const button = buttons[index];
  button.setTint(0x66ff7f);
  buttonSelector.x = button.x + 200 * 0.35;
  buttonSelector.y = button.y;
  selectedButtonIndex = index;
}

function selectNextButton(number) {
  let index = selectedButtonIndex + number;

  if (index >= buttons.length) {
    index = 0;
  } else {
    index = buttons.length - 1;
  }

  selectButton(index);
}

function confirmSelection() {
  const button = buttons[selectedButtonIndex];
  button.emit("selected");
}

function spawnActiveBrushes() {
  grassesActive.clear(true, true);
  let numOfActives = Phaser.Math.Between(1, 12);

  for (let i = 0; i < numOfActives; i++) {
    let x = grassX[Phaser.Math.Between(0, grassX.length - 1)];
    let y = grassY[Phaser.Math.Between(0, grassY.length - 1)];
    grassesActive.create(x, y, "grass-active");
  }
}
