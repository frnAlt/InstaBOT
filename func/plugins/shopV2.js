// @ts-check
export const meta = {
  name: "shop-rework",
  author: "Liane Cagara",
  version: "1.0.5",
  description: "This operates as easier way of managing shops!",
  supported: "^1.0.0",
  order: 2,
  type: "plugin",
  expect: ["ShopClass"],
};

export class ShopClass {
  /**
   *
   * @type {UserData["shopInv"]}
   */
  shopInv;

  /**
   *
   * @param {UserData["shopInv"]} shopInv
   */
  constructor(shopInv = {}) {
    this.shopInv = shopInv;
  }

  loadInv() {
    return this.shopInv;
  }

  /**
   *
   * @param {UserData["shopInv"]} inv
   */
  saveInv(inv) {
    this.shopInv = inv;
  }

  /**
   *
   * @param {string} commandName
   */
  lock(commandName) {
    commandName = String(commandName).toLowerCase();
    if (commandName in this.shopInv) {
      delete this.shopInv[commandName];
    }
  }

  /**
   *
   * @param {string} commandName
   */
  unlock(commandName) {
    commandName = String(commandName).toLowerCase();
    this.getPrice(commandName) !== 0
      ? (this.shopInv[commandName] = true)
      : null;
  }

  /**
   *
   * @param {string} commandName
   * @returns {boolean}
   */
  isUnlocked(commandName) {
    commandName = String(commandName).toLowerCase();
    return (
      !Cassidy.allowGames ||
      commandName in this.shopInv ||
      this.getPrice(commandName) === 0
    );
  }

  /**
   *
   * @param {string} commandName
   * @returns {number}
   */
  getPrice(commandName) {
    commandName = String(commandName).toLowerCase();
    const { meta } = global.Cassidy.multiCommands
      .values()
      .find(
        (i) =>
          i.meta.name === commandName ||
          String(i.meta.name).toLowerCase() ===
            String(commandName).toLowerCase()
      ) ?? {
      entry: null,
      meta: null,
    };
    return meta?.shopPrice || 0;
  }

  /**
   *
   * @param {string} commandName
   * @param {number} money
   * @returns {boolean}
   */
  canPurchase(commandName, money) {
    commandName = String(commandName).toLowerCase();
    const price = this.getPrice(commandName);
    return price !== 0 && money >= price;
  }

  /**
   *
   * @param {string} commandName
   * @param {number} money
   * @returns {{ success: boolean; cost: number; remainingMoney?: number }}
   */
  purchase(commandName, money) {
    commandName = String(commandName).toLowerCase();
    const price = this.getPrice(commandName);
    if (price === 0 || money < price) return { success: false, cost: price };
    this.shopInv[commandName] = true;
    money -= price;
    return { success: true, cost: price, remainingMoney: money };
  }

  getItems() {
    /**
     * @type {Record<string, CassidySpectra.CassidyCommand>}
     */
    const result = global.Cassidy.multiCommands
      .entries()
      .filter(([_, { meta }]) => meta?.shopPrice)
      .reduce((acc, [key, { meta }]) => {
        acc[meta.name] = { meta, key };
        return acc;
      }, {});

    const sortedKeys = Object.keys(result)
      .filter((i) => result[i].meta.shopPrice)
      .sort((a, b) => {
        return result[a].meta.shopPrice - result[b].meta.shopPrice;
      });
    /**
     * @type {Record<string, CassidyCommand> & { [Symbol.iterator]: () => Generator<CassidyCommand, void, unknown> }}
     */
    const finalResult = {
      *[Symbol.iterator]() {
        yield* Object.values(finalResult);
      },
    };
    for (const key of sortedKeys) {
      finalResult[key] = Cassidy.multiCommands.getOne(result[key].key);
    }

    return finalResult;
  }

  raw() {
    return { ...this.shopInv };
  }

  inventory() {
    return Object.keys(this.shopInv);
  }
}

/**
 *
 * @param {CommandContext} obj
 */
export async function use(obj) {
  obj.ShopClass = ShopClass;

  obj.next();
}
