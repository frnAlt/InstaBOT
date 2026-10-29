export const meta = {
  name: "shopSystem",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "This operates as easier way of managing shops!",
  supported: "^1.0.0",
  order: 2,
  type: "plugin",
  expect: ["Shop"],
};

export async function use(obj) {
  const { commands } = obj;
  const money = new Proxy(
    {},
    {
      get(target, prop) {
        return obj.money[prop];
      },
    }
  );
  async function loadInv(userID) {
    const { shopInv = {} } = await money.get(userID);
    return shopInv;
  }
  async function saveInv(inv, userID) {
    await money.set(userID, {
      shopInv: inv,
    });
  }
  const Shop = {
    async lock(commandName, userID) {
      const inv = await loadInv(userID);
      if (commandName in inv) {
        delete inv[commandName];
      }
      await saveInv(inv, userID);
    },
    async unlock(commandName, userID) {
      const inv = await loadInv(userID);
      inv[commandName] = true;
      await saveInv(inv, userID);
    },
    async isUnlocked(commandName, userID) {
      const inv = await loadInv(userID);
      return commandName in inv;
    },
    async inventory(userID) {
      const inv = await loadInv(userID);
      return Object.keys(inv);
    },
    getPrice(commandName) {
      const { meta = {} } = commands[commandName] ?? {};
      return meta.shopPrice || 0;
    },
    async canPurchase(commandName, userID) {
      const { money: userMoney } = await money.get(userID);
      const price = this.getPrice(commandName);
      if (price === null) {
        return false;
      }
      return userMoney >= price;
    },
    getItems() {
      let result = {};
      for (const key in commands) {
        const { meta } = commands[key];
        if (!meta) {
          continue;
        }
        if (!meta.shopPrice) {
          continue;
        }
        if (result[meta.name]) {
          continue;
        }
        result[meta.name] = commands[key];
      }
      let finalResult = {};
      const sortedKeys = Object.keys(result).sort((a, b) => {
        const aPrice = result[a].meta.shopPrice;
        const bPrice = result[b].meta.shopPrice;
        return aPrice - bPrice;
      });
      for (const key of sortedKeys) {
        finalResult[key] = result[key];
      }
      finalResult[Symbol.iterator] = function* () {
        yield* Object.values(finalResult);
      };
      return finalResult;
    },
    async purchase(commandName, userID) {
      const { money: userMoney } = await money.get(userID);
      const price = await this.getPrice(commandName);
      if (price === null) {
        return false;
      }
      if (userMoney < price) {
        return false;
      }
      await this.unlock(commandName, userID);
      await money.set(userID, {
        money: userMoney - price,
      });
      return true;
    },
  };
  obj.Shop = new Proxy(Shop, {
    get(target, prop) {
      if (!(prop in target) && prop !== "then") {
        throw new Error(`No such property: Shop.${prop}`);
      }
      return target[prop];
    },
    set() {
      throw new Error(`You can't set properties on Shop.`);
    },
  });

  obj.next();
}
