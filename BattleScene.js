import Character from "./Character";

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "battleScene" });
    this.allCharacters = [1, 2];
    this.p1;
    this.p2;
    this.turnIndicator;
    this.buttonselector;
    this.buttons = [];
    this.selectedButtonIndex = 0;
    this.battleSceneCursors;
    this.mainScene;
    this.bar;
    this.bar2;
    this.playerTurnFlag = true;
    this.enemyNum;
    this.pokemon;
  }

  preload() {
    this.load.tilemapTiledJSON("battlemap", "assets/battlemap.json");
    this.load.image("playerBattlePosition", "assets/playerBattlePosition.png");
    this.load.image("glassPanel", "assets/glassPanel.png");
    this.load.image("pikachu", "assets/pikachu.png");
    this.load.image("cursorHand", "assets/cursor_pointer3D.png");
    this.load.spritesheet("pokemons", "assets/pokemons.png", {
      frameWidth: 120,
      frameHeight: 120,
    });
  }

  create() {
    this.mainScene = this.scene.manager.getScene("mainScene");
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
    this.p1 = new Character(100, 25);
    this.p2 = new Character(
      Phaser.Math.Between(70, 100),
      Phaser.Math.Between(10, 35)
    );
    this.allCharacters[0] = this.p1;
    this.allCharacters[1] = this.p2;

    this.turnIndicator = this.add.text(16, 16, "It's your turn!", {
      fontSize: "32px",
      fill: "#000",
    });
    this.physics.add.sprite(0.25 * 512, 0.75 * 512, "playerBattlePosition");
    this.drawHp(128 - 80 * 0.5, 284, this.p1.hp, this.p1.maxHp);

    this.num = Phaser.Math.Between(0, 15);

    this.pokemon = this.physics.add.sprite(
      0.75 * 512,
      0.25 * 512,
      "pokemons",
      this.num
    );

    this.drawHp(
      0.75 * 512 - 25,
      0.25 * 512 - 92 * 0.5 - 16,
      this.p2.hp,
      this.p2.maxHp
    );

    const attackButton = this.add
      .image(0.75 * 512, 310, "glassPanel")
      .setDisplaySize(200, 50);
    this.add.text(attackButton.x, attackButton.y, "Attack").setOrigin(0.5);
    attackButton.setInteractive();
    // attackButton.on("pointerdown", this.attack);
    attackButton.on("selected", this.attack);

    const runButton = this.add
      .image(0.75 * 512, 400, "glassPanel")
      .setDisplaySize(200, 50);
    this.add.text(runButton.x, runButton.y, "Run").setOrigin(0.5);
    runButton.setInteractive();
    // runButton.on("pointerdown", this.flee);
    runButton.on("selected", this.flee);

    this.buttons.push(attackButton);
    this.buttons.push(runButton);

    this.buttonselector = this.add.image(0.5 * 512, 0.5 * 512, "cursorHand");

    this.battleSceneCursors = this.input.keyboard.createCursorKeys();
    this.selectButton(0);
  }

  update() {
    const upJustPressed = Phaser.Input.Keyboard.JustDown(
      this.battleSceneCursors.up
    );
    const downJustPressed = Phaser.Input.Keyboard.JustDown(
      this.battleSceneCursors.down
    );
    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(
      this.battleSceneCursors.space
    );

    if (this.allCharacters[0] && this.allCharacters[0].hp <= 0) {
      console.log("Game over. You fainted.");
      this.scene.switch("mainScene");
      this.mainScene.score = 0;
      this.mainScene.scoreText.setText(`score: ${this.mainScene.score}`);
      this.pokemon.setTexture("pokemons", Phaser.Math.Between(0, 15));
      this.allCharacters[0].hp = 100;
      this.mainScene.grassesActive.playAnimation("grassActivity");
      this.drawHp(128 - 80 * 0.5, 284, this.p1.hp, this.p1.maxHp);
    }

    if (this.allCharacters[1] && this.allCharacters[1].hp <= 0) {
      console.log("The opponent fainted.");
      this.mainScene.score += 10;
      this.mainScene.scoreText.setText(`score: ${this.mainScene.score}`);
      let newHp = Phaser.Math.Between(70, 100);
      this.allCharacters[1].hp = newHp;
      this.allCharacters[1].maxHp = newHp;
      this.allCharacters[1].att = Phaser.Math.Between(10, 30);

      console.log("op", this.allCharacters[1]);
      this.scene.switch("mainScene");
      this.pokemon.setTexture("pokemons", Phaser.Math.Between(0, 15));
      this.mainScene.grassesActive.playAnimation("grassActivity");
      this.drawHp(
        0.75 * 512 - 25,
        0.25 * 512 - 92 * 0.5 - 16,
        this.p2.hp,
        this.p2.maxHp
      );
    }

    if (upJustPressed) {
      this.selectNextButton(1);
    } else if (downJustPressed) {
      this.selectNextButton(-1);
    } else if (spaceJustPressed) {
      this.confirmSelection();
    }
  }

  flee() {
    console.log("fleeing...");
    this.scene.scene.switch("mainScene");
    this.scene.pokemon.setTexture("pokemons", Phaser.Math.Between(0, 15));
    this.scene.mainScene.grassesActive.playAnimation("grassActivity");
    let newHp = Phaser.Math.Between(70, 100);
    this.scene.allCharacters[1].hp = newHp;
    this.scene.allCharacters[1].maxHp = newHp;
    this.scene.allCharacters[1].att = Phaser.Math.Between(10, 30);
    this.scene.drawHp(
      0.75 * 512 - 25,
      0.25 * 512 - 92 * 0.5 - 16,
      this.scene.p2.hp,
      this.scene.p2.maxHp
    );
  }

  async wait(time) {
    await new Promise((resolve) => setTimeout(resolve, time * 1000));
  }

  selectButton(index) {
    const currentButton = this.buttons[this.selectedButtonIndex];
    currentButton.setTint(0xffffff);
    const button = this.buttons[index];
    button.setTint(0x66ff7f);
    this.buttonselector.x = button.x + 200 * 0.35;
    this.buttonselector.y = button.y;
    this.selectedButtonIndex = index;
  }

  selectNextButton(number) {
    let index = this.selectedButtonIndex + number;

    if (index >= this.buttons.length) {
      index = 0;
    } else {
      index = this.buttons.length - 1;
    }

    this.selectButton(index);
  }

  confirmSelection() {
    if (this.playerTurnFlag) {
      const button = this.buttons[this.selectedButtonIndex];
      button.emit("selected");
    }
  }

  drawHp(x, y, hp, maxHp) {
    let bar2 = this.add.graphics();
    let bar = this.add.graphics();

    bar2.fillStyle(0xbf0407);
    bar2.fillRect(x, y, 80, 16);
    bar.fillStyle(0x0642cf);
    bar.fillRect(x, y, (hp / maxHp) * 80, 16);
  }

  async attack() {
    console.log("from attack", this.scene.buttons);
    this.scene.p1.attack(this.scene.p2);
    this.scene.playerTurnFlag = false;

    console.log("cursors: ", this.scene.battleSceneCursors);
    this.scene.drawHp(
      0.75 * 512 - 25,
      0.25 * 512 - 92 * 0.5 - 16,
      this.scene.p2.hp,
      this.scene.p2.maxHp
    );

    console.log("You attacked the Opponent");

    this.scene.turnIndicator.setText("Your opponent is planning!");

    await this.scene.wait(3);

    let prob = Math.random();
    if (prob < 0.3) {
      console.log("The pokemon attempted to flee...");
      this.scene.scene.switch("mainScene");
      this.scene.pokemon.setTexture("pokemons", Phaser.Math.Between(0, 15));
      this.scene.mainScene.grassesActive.playAnimation("grassActivity");
      let newHp = Phaser.Math.Between(70, 100);
      this.scene.allCharacters[1].hp = newHp;
      this.scene.allCharacters[1].maxHp = newHp;
      this.scene.allCharacters[1].att = Phaser.Math.Between(10, 30);
      this.scene.drawHp(
        0.75 * 512 - 25,
        0.25 * 512 - 92 * 0.5 - 16,
        this.scene.p2.hp,
        this.scene.p2.maxHp
      );
    } else {
      this.scene.p2.attack(this.scene.p1);
    }

    console.log("cursors: ", this.scene.battleSceneCursors);
    this.scene.playerTurnFlag = true;

    this.scene.drawHp(
      128 - 80 * 0.5,
      284,
      this.scene.p1.hp,
      this.scene.p1.maxHp
    );
    console.log("Your Opponent attacked you!");

    this.scene.turnIndicator.setText("It's your turn!");
  }
}