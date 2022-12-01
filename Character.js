export default class Character {
  constructor(hp, att) {
    this.hp = hp;
    this.att = att;
    this.maxHp = hp;
    this.exp = 0;
  }

  attack(target) {
    target.hp -= this.att;
  }
}
