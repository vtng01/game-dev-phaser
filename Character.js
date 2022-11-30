export default class Character {
  constructor(hp, att) {
    this.hp = hp;
    this.att = att;
    this.maxHp = hp;
  }

  attack(target) {
    target.hp -= this.att;
  }
}
