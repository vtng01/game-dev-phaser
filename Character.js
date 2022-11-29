export default class Character {
  constructor(hp, att) {
    this.hp = hp;
    this.att = att;
  }

  attack(target) {
    target.hp -= this.att;
  }
}
