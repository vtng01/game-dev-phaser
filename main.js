import Phaser, { Game } from "phaser";
import { BattleScene } from "/BattleScene";
import { MainScene } from "./MainScene";

const myGame = new Game({
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
