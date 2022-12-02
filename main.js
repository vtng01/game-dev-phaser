import "phaser";
import { BattleScene } from "/BattleScene";
import { MainScene } from "./MainScene";

const myGame = new Phaser.Game({
  type: Phaser.AUTO,
  width: 512,
  height: 512,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
    },
  },
  scene: [MainScene, BattleScene],
});
