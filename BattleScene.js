import Character from "./Character";

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "battleScene" });
    this.allCharacters = [1, 2];
    this.p1;
    this.p2;
    this.infoMessage;
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
    this.pokemonAttackAnimation;
    this.pokemonReceiveDamageAnimation;
    this.player;
    this.playerAttackAnimation;
    this.playerReceiveDamageAnimation;
  }

  preload() {
    this.load.tilemapTiledJSON("battlemap", "assets/battlemap.json");
    this.load.image("playerBattlePosition", "assets/playerBattlePosition.png");
    this.load.image("glassPanel", "assets/glassPanel.png");
    this.load.image("metalPanel", "assets/metalPanel.png");
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

    const infoBox = this.add
      .image(0.5 * 512, 25, "metalPanel")
      .setDisplaySize(512, 50);

    this.infoMessage = this.add
      .text(infoBox.x, infoBox.y, "It's your turn!", {
        fontSize: "16px",
        fill: "#000",
        wordWrap: { width: 500, useAdvancedWrap: true },
      })
      .setOrigin(0.5);
    this.player = this.physics.add.sprite(
      0.25 * 512,
      0.75 * 512,
      "playerBattlePosition"
    );
    this.drawHp(0.25 * 512 - 60, 0.75 * 512 - 100, this.p1.hp, this.p1.maxHp);

    this.num = Phaser.Math.Between(0, 15);

    this.pokemon = this.physics.add.sprite(
      0.75 * 512,
      0.25 * 512,
      "pokemons",
      this.num
    );

    this.pokemonAttackAnimation = this.tweens.add({
      targets: this.pokemon,
      x: 0.25 * 512 + 80,
      y: 0.75 * 512 - 100,
      scaleX: 2.5,
      scaleY: 2.5,
      duration: 500,
      ease: "Power2",
      yoyo: true,
      onComplete: () => {
        this.pokemonAttackAnimation.restart();
      },
      paused: true,
    });

    this.pokemonReceiveDamageAnimation = this.tweens.add({
      targets: this.pokemon,
      x: 0.75 * 512 + 20,
      y: 0.25 * 512 - 20,
      duration: 150,
      ease: "Power3",
      yoyo: true,
      onComplete: () => {
        this.pokemonReceiveDamageAnimation.restart();
      },
      paused: true,
    });

    this.playerAttackAnimation = this.tweens.add({
      targets: this.player,
      x: 0.75 * 512 - 60,
      y: 0.25 * 512 + 60,
      scaleX: 0.4,
      scaleY: 0.4,
      duration: 500,
      ease: "Power2",
      yoyo: true,
      onComplete: () => {
        this.playerAttackAnimation.restart();
      },
      paused: true,
    });

    this.playerReceiveDamageAnimation = this.tweens.add({
      targets: this.player,
      x: 0.25 * 512 - 20,
      y: 0.75 * 512 + 20,
      duration: 150,
      ease: "Power3",
      yoyo: true,
      onComplete: () => {
        this.playerReceiveDamageAnimation.restart();
      },
      paused: true,
    });

    this.drawHp(0.75 * 512 - 60, 0.25 * 512 - 60, this.p2.hp, this.p2.maxHp);

    const attackButton = this.add
      .image(0.75 * 512, 310, "metalPanel")
      .setDisplaySize(200, 50);
    this.add
      .text(attackButton.x, attackButton.y, "Attack", { color: "0x0642cf" })
      .setOrigin(0.5);
    attackButton.setInteractive();
    attackButton.on("selected", this.attack);

    const captureButton = this.add
      .image(0.75 * 512, 380, "metalPanel")
      .setDisplaySize(200, 50);
    this.add
      .text(captureButton.x, captureButton.y, "Capture", { color: "0x0642cf" })
      .setOrigin(0.5);
    captureButton.setInteractive();
    captureButton.on("selected", this.capture);

    const runButton = this.add
      .image(0.75 * 512, 450, "metalPanel")
      .setDisplaySize(200, 50);
    this.add
      .text(runButton.x, runButton.y, "Run", { color: "0x0642cf" })
      .setOrigin(0.5);
    runButton.setInteractive();
    runButton.on("selected", this.flee);

    this.buttons.push(attackButton);
    this.buttons.push(captureButton);
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
      let newHp = Phaser.Math.Between(70, 100);
      this.allCharacters[1].hp = newHp;
      this.allCharacters[1].maxHp = newHp;
      this.allCharacters[1].att = Phaser.Math.Between(10, 30);
      this.pokemon.setTexture("pokemons", Phaser.Math.Between(0, 15));

      this.scene.switch("mainScene");
      this.mainScene.score = 0;
      this.mainScene.scoreText.setText(`score: ${this.mainScene.score}`);
      this.pokemon.setTexture("pokemons", Phaser.Math.Between(0, 15));
      this.allCharacters[0].hp = this.allCharacters[0].maxHp;
      this.mainScene.grassesActive.playAnimation("grassActivity");
      this.drawHp(0.25 * 512 - 60, 0.75 * 512 - 100, this.p1.hp, this.p1.maxHp);
    }

    if (this.allCharacters[1] && this.allCharacters[1].hp <= 0) {
      console.log("The opponent fainted.");
      this.mainScene.score += 10;
      this.mainScene.scoreText.setText(`score: ${this.mainScene.score}`);

      this.allCharacters[0].exp += this.allCharacters[1].maxHp;
      let factor = Math.floor(this.allCharacters[0].exp / 100);
      this.mainScene.level += factor;
      this.mainScene.levelText.setText(`Lvl: ${this.mainScene.level}`);

      this.allCharacters[0].exp %= 100;

      this.allCharacters[0].att += 5 * factor;
      this.allCharacters[0].maxHp += 15 * factor;
      this.allCharacters[0].hp = this.allCharacters[0].maxHp;
      this.drawHp(
        0.25 * 512 - 60,
        0.75 * 512 - 100,
        this.allCharacters[0].hp,
        this.allCharacters[0].maxHp
      );

      let newHp = Phaser.Math.Between(70, 100);
      this.allCharacters[1].hp = newHp;
      this.allCharacters[1].maxHp = newHp;
      this.allCharacters[1].att = Phaser.Math.Between(10, 30);

      this.scene.switch("mainScene");
      this.pokemon.setTexture("pokemons", Phaser.Math.Between(0, 15));
      this.mainScene.grassesActive.playAnimation("grassActivity");
      this.drawHp(0.75 * 512 - 60, 0.25 * 512 - 60, this.p2.hp, this.p2.maxHp);
    }

    if (upJustPressed) {
      this.selectNextButton(-1);
    } else if (downJustPressed) {
      this.selectNextButton(1);
    } else if (spaceJustPressed) {
      this.confirmSelection();
    }
  }

  async flee() {
    this.scene.playerTurnFlag = false;
    this.scene.infoMessage.setText(`You attempt to flee...`);
    await this.scene.wait(3);

    let prob = 0.7;

    if (Math.random() < prob) {
      this.scene.infoMessage.setText(`...and you got away!`);
      await this.scene.wait(3);
      this.scene.scene.switch("mainScene");
      this.scene.pokemon.setTexture("pokemons", Phaser.Math.Between(0, 15));
      this.scene.mainScene.grassesActive.playAnimation("grassActivity");
      let newHp = Phaser.Math.Between(70, 100);
      this.scene.allCharacters[1].hp = newHp;
      this.scene.allCharacters[1].maxHp = newHp;
      this.scene.allCharacters[1].att = Phaser.Math.Between(10, 30);
      this.scene.drawHp(
        0.75 * 512 - 60,
        0.25 * 512 - 60,
        this.scene.p2.hp,
        this.scene.p2.maxHp
      );
    } else {
      this.scene.infoMessage.setText(`...and you fail to get away!`);
      await this.scene.wait(3);
      this.scene.p2.attack(this.scene.p1);
      this.scene.infoMessage.setText(
        `...and the Pokemon dealt ${this.scene.p2.att} damage to you!`
      );
      await this.scene.wait(3);
      this.scene.infoMessage.setText("It's your turn!");
      this.scene.drawHp(
        0.25 * 512 - 60,
        0.75 * 512 - 100,
        this.scene.p1.hp,
        this.scene.p1.maxHp
      );
    }
    this.scene.playerTurnFlag = true;
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
    } else if (index < 0) {
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
    bar2.fillRect(x, y, 120, 16);
    bar.fillStyle(0x0642cf);
    bar.fillRect(x, y, (hp / maxHp) * 120, 16);
  }

  async attack() {
    this.scene.p1.attack(this.scene.p2);
    this.scene.playerTurnFlag = false;

    this.scene.playerAttackAnimation.play();
    await this.scene.wait(1);
    // this.scene.playerAttackAnimation.pause();
    this.scene.pokemonReceiveDamageAnimation.play();
    // await this.scene.wait(0.3);
    // this.scene.pokemonReceiveDamageAnimation.pause();

    this.scene.drawHp(
      0.75 * 512 - 60,
      0.25 * 512 - 60,
      this.scene.p2.hp,
      this.scene.p2.maxHp
    );
    this.scene.infoMessage.setText(
      `You dealt ${this.scene.p1.att} damage to the Pokemon`
    );
    await this.scene.wait(3);

    if (this.scene.p2.hp <= 0) {
      this.scene.infoMessage.setText("Opponent fainted");
      return;
    }

    this.scene.infoMessage.setText("Your opponent is planning...");
    await this.scene.wait(3);

    let prob = Math.random();
    if (prob < 0.3) {
      this.scene.infoMessage.setText("The Pokemon escaped");
      await this.scene.wait(3);
      this.scene.scene.switch("mainScene");
      this.scene.pokemon.setTexture("pokemons", Phaser.Math.Between(0, 15));
      this.scene.mainScene.grassesActive.playAnimation("grassActivity");
      let newHp = Phaser.Math.Between(70, 100);
      this.scene.allCharacters[1].hp = newHp;
      this.scene.allCharacters[1].maxHp = newHp;
      this.scene.allCharacters[1].att = Phaser.Math.Between(10, 30);
      this.scene.drawHp(
        0.75 * 512 - 60,
        0.25 * 512 - 60,
        this.scene.p2.hp,
        this.scene.p2.maxHp
      );
    } else {
      this.scene.p2.attack(this.scene.p1);
      this.scene.pokemonAttackAnimation.play();
      await this.scene.wait(1);
      // this.scene.pokemonAttackAnimation.play();
      this.scene.playerReceiveDamageAnimation.play();
      // await this.scene.wait(0.3);
      // this.scene.playerReceiveDamageAnimation.pause();
      this.scene.drawHp(
        0.25 * 512 - 60,
        0.75 * 512 - 100,
        this.scene.p1.hp,
        this.scene.p1.maxHp
      );
      this.scene.infoMessage.setText(
        `The Pokemon dealt ${this.scene.p2.att} damage to you!`
      );

      await this.scene.wait(3);
    }

    this.scene.playerTurnFlag = true;

    this.scene.infoMessage.setText("It's your turn!");
  }

  async capture() {
    this.scene.playerTurnFlag = false;
    let prob = 1 - (this.scene.p2.hp / this.scene.p2.maxHp) * 0.8;
    this.scene.infoMessage.setText(
      `You attempted to catch the monster with a ${prob.toFixed(2)} chance.`
    );
    await this.scene.wait(3);
    if (Math.random() < prob) {
      this.scene.infoMessage.setText("You captured the pokemon!!!");
      this.scene.mainScene.score += 50;
      this.scene.mainScene.scoreText.setText(
        `score: ${this.scene.mainScene.score}`
      );
      await this.scene.wait(3);
      this.scene.scene.switch("mainScene");
      this.scene.pokemon.setTexture("pokemons", Phaser.Math.Between(0, 15));
      this.scene.mainScene.grassesActive.playAnimation("grassActivity");
      let newHp = Phaser.Math.Between(70, 100);
      this.scene.allCharacters[1].hp = newHp;
      this.scene.allCharacters[1].maxHp = newHp;
      this.scene.allCharacters[1].att = Phaser.Math.Between(10, 30);
      this.scene.drawHp(
        0.75 * 512 - 60,
        0.25 * 512 - 60,
        this.scene.p2.hp,
        this.scene.p2.maxHp
      );
    } else {
      this.scene.infoMessage.setText("You failed to capture...");
      await this.scene.wait(3);
      this.scene.p2.attack(this.scene.p1);
      this.scene.infoMessage.setText(
        `...and the Pokemon dealt ${this.scene.p2.att} damage to you!`
      );
      await this.scene.wait(3);
      this.scene.infoMessage.setText("It's your turn!");
      this.scene.drawHp(
        0.25 * 512 - 60,
        0.75 * 512 - 100,
        this.scene.p1.hp,
        this.scene.p1.maxHp
      );
    }

    this.scene.playerTurnFlag = true;
  }
}
