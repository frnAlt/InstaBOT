// @ts-check
import { CassEXP } from "../modules/cassEXP.js";
import { clamp, countEmojis, UNISpectra } from "@cassidy/unispectra";
import { Inventory, Collectibles } from "@cass-modules/InventoryEnhanced";
import { PetPlayer } from "./pet-fight";
import {
  abbreviateNumber,
  formatCash,
  formatValue,
  parseBet,
} from "@cass-modules/ArielUtils";
import { calculateInflation } from "@cass-modules/unitypes";
import { Slicer } from "./utils-liane";

export const meta = {
  name: "ut-shop",
  author: "Liane Cagara",
  version: "4.0.0",
  description: "I'm lazy so I made these",
  supported: "^1.0.0",
  order: 1,
  type: "plugin",
  expect: [
    "getInflationRate",
    "randomWithProb",
    "generateGift",
    "generateTrash",
    "generateTreasure",
    "Collectibles",
    "treasures",
    "petPlayerMaps",
    "UTShop",
    "Inventory",
    "CassEXP",
  ],
};
const { parseCurrency: pCy } = global.utils;

/**
 *
 * @param {"gift" | "pack"} type
 * @param {Record<any, any>} [assign={}]
 * @returns
 */
export function generateGift(type = "gift", assign = {}) {
  if (type === "pack") {
    return generateGiftPack();
  }
  const i = {
    name: "Gift",
    icon: "🎁",
    flavorText:
      "This is a gift item, this item might grant you something. It's not guaranteed enough, you can use this using inventory command, if you know..",
    sellPrice: 100,
    type: "treasure",
    treasureKey: "generic",
    key: "gift",
  };
  Object.assign(i, assign);
  return i;
}
export function generateGiftPack() {
  return {
    name: "Gift Pack",
    icon: "🎁🎴",
    flavorText:
      "This is a gift item, this item might grant you something. It's not guaranteed enough, you can use this using inventory command, if you know..",
    sellPrice: 100,
    type: "roulette_pack",
    treasureKey: "generic",
    key: "giftPack",
  };
}
export function generateTrash() {
  const types = ["dog", "cat", "dragon", "anypet"];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    name: `***${String(type).toUpperCase()}*** Canned Food `,
    icon: "🥫",
    flavorText: `This is a canned food item, it's not very edible but it's a good product.`,
    sellPrice: 100,
    type: `${type}_food`,
    saturation: (Math.floor(Math.random() * 27) + 5) * 60 * 1000,
    key: `${type}Can`,
    prob: (70 + Math.floor(Math.random() * 100) - 70) / 100,
    group: [
      "generic",
      "unlucky",
      "foodpack",
      ...(type === "anypet" ? [] : ["curse"]),
    ],
    isTrash: true,
  };
}

export function generateChequeGift(amount = 100, groups = []) {
  return {
    key: `cheque_${amount}`,
    icon: "💵",
    name: `Cheque of $${amount}`,
    flavorText: `A cheque worth $${amount} that is found from a gift. Cash it to add the amount to your balance.`,
    chequeAmount: amount,
    sellPrice: Math.floor(amount * 0.75),
    type: "cheque",
    cannotToss: false,
    prob: Math.min(Math.pow(1 / amount, 0.3), 1),
    group: groups.length > 0 ? groups : ["generic", "money"],
  };
}

export function generateTrashOld() {
  const types = ["dog", "cat", "dragon"];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    name: "Trash",
    icon: "🗞️",
    flavorText: `A not-so-useless pile of newspapers, and might be a food for your ${type}.`,
    sellPrice: 20,
    type: `${type}_food`,
    saturation: (Math.floor(Math.random() * 27) + 5) * 60 * 1000,
    key: "trash",
    isTrash: true,
    prob: (70 + Math.floor(Math.random() * 100) - 70) / 100,
    picky: true,
    group: ["generic", "unlucky", "curse"],
  };
}

const rarePets = [
  {
    name: "Unicorn",
    key: "unicorn",
    flavorText:
      "A mythical horse with a single horn. Radiates purity and magic.",
    icon: "🦄",
    type: "pet",
    sellPrice: 2000,
    group: ["pets", "petsII"],
    prob: 1,
  },
  {
    name: "Yeti",
    key: "yeti",
    flavorText:
      "A legendary creature from snowy mountains. Mysterious and elusive.",
    icon: "🏔️",
    type: "pet",
    sellPrice: 1800,
    group: ["pets", "petsII"],
    prob: 1,
  },
  {
    name: "Leviathan",
    key: "leviathan",
    flavorText: "A massive sea serpent with power to stir the oceans.",
    icon: "🌊",
    type: "pet",
    sellPrice: 2400,
    group: ["pets", "petsII"],
    prob: 1,
  },
  {
    name: "Cerberus",
    key: "cerberus",
    flavorText: "A three-headed guardian of the underworld. Fear incarnate.",
    icon: "🐕‍🦺",
    type: "pet",
    sellPrice: 3000,
    group: ["pets", "petsII"],
    prob: 1,
  },
  {
    name: "Sphinx",
    key: "sphinx",
    flavorText:
      "A mythical creature with the body of a lion and the head of a human.",
    icon: "🦁🗿",
    type: "pet",
    sellPrice: 2000,
    group: ["pets", "petsIII"],
    prob: 1,
  },
  {
    name: "Griffin",
    key: "griffin",
    flavorText:
      "A majestic creature with the body of a lion and wings of an eagle.",
    icon: "🦁🦅",
    type: "pet",
    sellPrice: 3000,
    group: ["pets", "petsIII"],
    prob: 1,
  },
  {
    name: "Pegasus",
    key: "pegasus",
    flavorText: "A divine winged horse. Swift and graceful in flight.",
    icon: "🐎✨",
    type: "pet",
    sellPrice: 4000,
    group: ["pets", "petsIII"],
    prob: 1,
  },
  {
    name: "Kraken",
    key: "kraken",
    flavorText: "A legendary sea monster with immense power and tentacles.",
    icon: "🐙",
    type: "pet",
    sellPrice: 4500,
    group: ["pets", "petsIII"],
    prob: 1,
  },
  {
    name: "Panda",
    key: "panda",
    flavorText:
      "A cute creature with a natural talent of balancing the power of the Yin and Yang.",
    icon: "🐼",
    type: "pet",
    sellPrice: 1400,
    group: ["pets", "petsII"],
    prob: 0.5,
    cannotToss: false,
  },
];

export const treasures = [
  {
    name: "HighRoll Pass",
    key: "highRollPass",
    flavorText:
      "A pass won by achieving a 7-win streak in slots. This pass allows you to place slot bets over 100000, unlocking bigger wins and higher stakes. Remember, with great risk comes great reward. Surprisingly easy to toss away like a normal item!",
    icon: "🃏",
    sellPrice: 2500000,
    type: "armor",
    def: 15,
    prob: 0.005,
    group: ["generic", "cards", "pass"],
  },
  {
    name: "Shadow Coin",
    key: "shadowCoin",
    flavorText:
      "A coin rumored to have been forged in the depths of a forgotten realm, carrying with it the clandestine power to transfer fortunes unseen.",
    icon: "🌒",
    type: "food",
    heal: 120,
    sellPrice: 500,
    healParty: true,
    prob: 0.2,
    group: ["generic", "banking", "foodpack"],
  },
  {
    name: "Lotto Ticket",
    key: "lottoTicket",
    flavorText:
      "A mysterious ticket purchased from the Meow Shop. Its purpose remains unclear, but it brims with potential.",
    icon: "🔖",
    type: "key",
    sellPrice: 5,
    prob: 0.35,
    group: ["generic", "banking"],
  },
  {
    key: "tilesBomb",
    name: "Tiles Bomb",
    flavorText:
      "These are leftover bombs from the tiles game, you need to get rid of these ASAP.",
    icon: "💣",
    sellPrice: 500,
    type: "weapon",
    atk: 5,
    def: 1,
    prob: 0.6,
    group: ["generic", "tiles", "unlucky", "curse", "weaponpack"],
  },
  {
    name: "Dog Tag",
    key: "dogTag",
    flavorText: "Changes the name of the pet.",
    icon: "🏷️",
    type: "utility",
    sellPrice: 300,
    prob: 0.1,
    group: ["generic", "octoshop", "customize"],
  },
  {
    name: "Cosmic Crunch 𝔼𝕏 ✦",
    icon: "☄️",
    key: "cosmicCrunchEX",
    sellPrice: 500,
    type: "dragon_food",
    saturation: 250 * 60 * 1000,
    flavorText:
      "Tasty cosmic treats for your cosmic dragon.. or normal dragon.",
    picky: true,
    prob: 0.3,
    group: ["generic", "petfoods", "dragonhelp"],
  },
  {
    name: "Cosmic Punch 𝔼𝕏 ✦",
    icon: "🥊",
    key: "cosmicPunchEX",
    sellPrice: 500,
    type: "food",
    heal: 250,
    flavorText:
      "Punchy cosmic treats for your cosmic dragon, normal dragon.. or almost everyone",
    picky: true,
    prob: 0.35,
    group: ["generic", "petfoods", "dragonhelp", "punch"],
  },
  {
    name: "Endless Battle",
    icon: "🔱",
    flavorText:
      "War has never ceased in the Land of Dawn: the Endless War, the unification of the Moniyan Empire, the Conflicts in the North... The artifact has witness every struggle for survival for centuries.",
    key: "endlessBattle",
    group: ["generic", "legends", "weaponpack"],
    prob: 0.1,
    type: "weapon",
    atk: 65,
    def: -45,
    sellPrice: 500000,
  },
  {
    name: "Bad Apple",
    key: "badApple",
    flavorText: "Definitely not touhou.",
    icon: "🍏",
    type: "anypet_food",
    saturation: -2000000,
    sellPrice: -100,
    cannotToss: true,
    cannotBox: true,
    cannotSend: true,
    prob: 0.2,
    group: ["generic", "petfoods", "unlucky", "bad", "curse", "foodpack"],
  },
  {
    name: "Good Apple",
    key: "goodApple",
    flavorText: "Reverses the debuff of Bad Apple",
    icon: "🍎",
    type: "anypet_food",
    saturation: 2000000,
    sellPrice: 300,
    prob: 0.2,
    group: ["generic", "petfoods", "counter", "foodpack"],
  },

  {
    name: "Cursed Sword",
    key: "cursedSword",
    flavorText:
      "A sword delicately developed by the witches using the special ore's and special cursed magic, this sword allows you to get 20% atk damage to the enemies.",
    icon: "🗡️",
    type: "weapon",
    def: 4,
    atk: 20,
    sellPrice: 3000,
    prob: 0.1,
    group: ["generic", "gears", "weaponpack"],
  },
  {
    name: "Assassin's Pick",
    key: "assassinPick",
    flavorText:
      "Best weapon in terms of damage, but this weapon hurts anyone who equip it, reducing the defense.",
    icon: "⛏️",
    type: "weapon",
    def: -20,
    atk: 49,
    magic: -400,
    sellPrice: 10000,
    cannotToss: false,
    prob: 0.1,
    group: ["generic", "armor", "weaponpack"],
  },
  {
    name: "Phoenix Ember 𝔼𝕏 ✦",
    key: "phoenixEmberEX",
    flavorText:
      "A mystical ember known for its transformative properties. When consumed, it imbues the Phoenix with renewed vitality, enhancing its fiery aura and majestic presence.",
    icon: "🔥",
    type: "phoenix_food",
    saturation: 400 * 60 * 1000,
    sellPrice: 500,
    prob: 0.3,
    picky: true,
    group: ["generic", "petfoods", "phoenixhelp", "foodpack"],
  },
  {
    name: "Majestic Meals 𝔼𝕏 ✦",
    key: "majesticMealsEX",
    flavorText: "A medley of wild game for your tiger.",
    icon: "🦌",
    type: "tiger_food",
    sellPrice: 500,
    saturation: 120 * 60 * 1000,
    prob: 0.3,
    picky: true,
    group: ["generic", "petfoods", "tigerhelp", "foodpack"],
  },

  {
    name: "Dog",
    key: "dog",
    flavorText: "A loyal pet from the Pet Shop. Always there for you.",
    icon: "🐕",
    type: "pet",
    sellPrice: 250,
    group: ["pets", "petsI"],
    prob: 1,
  },
  {
    name: "Deer",
    key: "deer",
    flavorText: "A gentle pet from the Pet Shop. Moves with grace.",
    icon: "🦌",
    type: "pet",
    sellPrice: 350,
    group: ["pets", "petsI"],
    prob: 1,
  },
  {
    name: "Tiger",
    key: "tiger",
    flavorText: "A majestic pet from the Pet Shop. Commands respect.",
    icon: "🐅",
    type: "pet",
    sellPrice: 750,
    group: ["pets", "petsI"],
    prob: 1,
  },
  {
    name: "Snake",
    key: "snake",
    flavorText: "A mysterious pet from the Pet Shop. Intriguing to watch.",
    icon: "🐍",
    type: "pet",
    sellPrice: 500,
    group: ["pets", "petsI"],
    prob: 1,
  },
  {
    name: "Dragon",
    key: "dragon",
    flavorText: "A legendary pet from the Pet Shop. A symbol of power.",
    icon: "🐉",
    type: "pet",
    sellPrice: 1200,
    group: ["pets", "petsI"],
    prob: 1,
  },
  ...rarePets,
  generateChequeGift(1_000_000),
  generateChequeGift(10_000_000),
  generateChequeGift(100_000),
  generateChequeGift(50_000),
  generateChequeGift(69_000),
  // generateChequeGift(10_000),
  // generateChequeGift(10_000),
  // generateChequeGift(10_000),
  generateGift(),
  generateGift(),
  generateGift(),
  generateGift(),
];

const treasuresCopy = [...treasures];

/**
 * @param {CommandContext} obj
 */
export async function use(obj) {
  const commandLoots = Cassidy.multiCommands
    .toUnique((i) => i.meta?.name)
    .values()
    .reduce((arr, val) => {
      const { treasuresTable = [] } = val;
      if (Array.isArray(treasuresTable)) {
        arr.push(...treasuresTable);
      }
      return arr;
    }, []);
  const treasures = [
    ...treasuresCopy,
    generateTrashOld(),
    generateTrash(),
    generateTrash(),
    generateTrash(),
    generateTrash(),
    ...commandLoots,
  ];
  /**
   *
   * @param {Record<string, UserData>} usersData
   * @returns
   */
  obj.getInflationRate = async function (usersData) {
    usersData ??= await obj.money.getAllCache();
    return calculateInflation(usersData);
  };
  function randomWithProb(treasures) {
    // Step 1: Shuffle the treasures array to ensure random order for same probability items
    treasures = treasures.sort(() => Math.random() - 0.5);

    // Step 2: Calculate cumulative probabilities
    let cumulativeProbs = [];
    let cumulativeSum = 0;
    for (let i = 0; i < treasures.length; i++) {
      cumulativeSum += treasures[i].prob || 1; // Default probability to 1 if not provided
      cumulativeProbs.push(cumulativeSum);
    }

    // Step 3: Normalize cumulative probabilities to ensure they sum to 1
    let totalSum = cumulativeSum;
    cumulativeProbs = cumulativeProbs.map((prob) => prob / totalSum);

    // Step 4: Generate a random number between 0 and 1
    let random = Math.random();

    // Step 5: Find the corresponding treasure based on the random number
    for (let i = 0; i < cumulativeProbs.length; i++) {
      if (random < cumulativeProbs[i]) {
        const copy = JSON.parse(JSON.stringify(treasures[i]));
        return copy;
      }
    }
  }
  obj.randomWithProb = randomWithProb;
  obj.generateGift = generateGift;
  obj.generateTrash = generateTrash;
  const treasures2 = treasures;

  obj.generateTreasure = function (treasureKey) {
    let treasures = JSON.parse(JSON.stringify(treasures2)).map((i) => {
      i ??= {};
      i.name = `${i.name}`;
      i.isGift = true;
      i.group ??= [];
      i.prob ??= 1;
      return i;
    });

    treasureKey ??= "generic";
    let [type, ...args] = treasureKey.split("_");
    const excluded = [];
    for (const arg of args) {
      const [type, ...keys] = String(arg).split("=>");
      if (type === "exclude") {
        excluded.push(...keys);
      }
    }
    treasures = treasures.filter((i) => {
      i.group ??= [];
      return !i.group.some((g) => excluded.includes(g));
    });

    if (type === "randomInd") {
      return treasures[
        args.filter((key) => treasures.some((i) => i?.key === key))[
          Math.floor(Math.random() * args.length)
        ]
      ];
    }

    if (type === "specific") {
      return treasures.find((i) => i?.key === args[0]);
    }

    if (type === "fullRandom") {
      return randomWithProb(treasures);
    }

    if (type === "randomGrouped") {
      const items = treasures.filter((i) => i?.group?.includes(args[0]));
      return randomWithProb(items);
    }
    if (type === "randomGroupedMultiple") {
      const items = args
        .map((a) => treasures.filter((i) => i?.group?.includes(a)))
        .flat();
      return randomWithProb(items);
    }
    if (type === "randomGroupedBiasFirst") {
      const result = [];
      let divisor = 1;
      for (const arg of args) {
        const items = treasures.filter((i) => i?.group?.includes(arg));
        result.push(
          ...items.map((i) => {
            return {
              ...i,
              prob: (i.prob || 1) / divisor,
            };
          })
        );
        divisor++;
      }

      return randomWithProb(result);
    }

    if (type === "rare") {
      const items = treasures.filter((i) => i?.rarity === "rare");
      return randomWithProb(items);
    }

    if (type === "legendary") {
      const items = treasures.filter((i) => i?.rarity === "legendary");
      return randomWithProb(items);
    }

    if (type === "customSearch") {
      const items = treasures.filter((i) => i[args[0]] === args[1]);
      return randomWithProb(items);
    }

    const items = treasures.filter((i) => i?.group?.includes("generic"));
    return randomWithProb(items);
  };

  function petPlayerMaps(data) {
    const { GearsManage, Inventory, PetPlayer } = obj;
    const gearsManage = new GearsManage(data.gearsData);
    const petsData = new Inventory(data.petsData);
    const playersMap = new Map();
    for (const pet of petsData) {
      const gear = gearsManage.getGearData(pet.key);
      // @ts-ignore
      const player = new PetPlayer(pet, gear);
      playersMap.set(pet.key, player);
    }
    return {
      gearsManage,
      petsData,
      playersMap,
    };
  }
  obj.Collectibles = Collectibles;
  obj.treasures = new Inventory(treasures, 10000000);

  obj.petPlayerMaps = petPlayerMaps;

  obj.UTShop = UTShop;
  obj.Inventory = Inventory;
  obj.CassEXP = CassEXP;
  obj.generateChequeGift = generateChequeGift;
  obj.generateTrashOld = generateTrashOld;
  obj.next();
}

export const treasureInv = new Inventory(treasures, Infinity);

/**
 * @typedef {Map<string, Map<string, number>>} StockData
 */
export class UTShop {
  /**
   * @type {import("@cass-modules/GardenBalancer").ShopItem[]}
   */
  itemData;
  /**
   * @type {Map<string, StockData>}
   */
  static stocksData = new Map();

  static analyticsKey = "UTShop_Analytics";

  /**
   * @type {Map<string, number>}
   */
  static stockTS = new Map();
  constructor({
    itemData = [],
    sellTexts = [],
    talkTexts = [],
    buyTexts = ["Which item do you want to buy?"],
    welcomeTexts = ["Welcome to the shop."],
    goBackTexts = ["Take your time."],
    askTalkTexts = ["What do you want to talk about?"],
    thankTexts = ["Thank you for your purchase!"],
    notScaredGeno = true,
    genoNote = null,
    allowSell = false,
    askSellTexts = [],
    sellDisallowed = [],
    onSell = async () => {},
    tradeRefuses = [],
    allowTrade = false,
    tradeData = [],
    style = null,
    key = "x",
    stockInterval = 5 * 60 * 1000,
  }) {
    this.key = key;
    this.allowTrade = allowTrade;
    this.tradeData = tradeData;
    this.onSell = onSell;
    this.style = style;
    this.sellDisallowed = sellDisallowed;
    this.tradeRefuses = tradeRefuses;
    this.allowSell = !!allowSell;

    this.itemData = this.mapItemData(itemData);
    this.notScaredGeno = notScaredGeno;
    this.genoNote =
      genoNote ?? "Take whatever you want, but please don't hurt my family.";
    this.sellTexts = sellTexts || [
      "I would be in bankrupt if I started buying these",
      "Don't expect me to give you money.",
      "I'm not a bank, I'm a shop!",
      "Go find other shopkeeper that will buy your stuff.",
    ];
    this.askSellTexts = askSellTexts;
    this.talkTexts = this.mapTalkTexts(talkTexts);
    this.buyTexts = buyTexts || ["Which do you want?"];
    this.welcomeTexts = welcomeTexts || ["Welcome to the shop!"];
    this.goBackTexts = goBackTexts || ["Oh it's okay, what do you want?"];
    this.askTalkTexts = askTalkTexts || ["What do you want to talk about?"];
    this.thankTexts = thankTexts || ["Thanks for buying!"];
    this.playerRoute = "Neutral";
    this.stockInterval = stockInterval;
  }

  resetAllStock() {
    UTShop.stocksData.set(this.key, new Map());
    UTShop.stockTS.delete(this.key);
  }

  /**
   * Ensures stock data and resets it if expired.
   * Always sets correct stock value based on `stockLimit`.
   *
   * @param {string} userID
   * @param {string} stockID
   */
  ensureStock(userID, stockID) {
    const now = Date.now();

    if (!(UTShop.stocksData.get(this.key) instanceof Map)) {
      UTShop.stocksData.set(this.key, new Map());
    }
    const shopMap = UTShop.stocksData.get(this.key);

    if (!(shopMap.get(userID) instanceof Map)) {
      shopMap.set(userID, new Map());
    }
    const userStockMap = shopMap.get(userID);

    const item = this.itemData.find((i) => i?.key === stockID);
    const stockLimit =
      typeof item?.stockLimit === "number" ? item.stockLimit : Infinity;

    const lastReset = UTShop.stockTS.get(this.key);
    const interval = this.stockInterval;
    const shouldReset =
      typeof lastReset !== "number" || now - lastReset >= interval;

    if (shouldReset && Number.isFinite(stockLimit)) {
      UTShop.stockTS.set(this.key, now);
      userStockMap.set(stockID, stockLimit);
    }

    if (!userStockMap.has(stockID)) {
      userStockMap.set(stockID, stockLimit);
    }
  }

  /**
   * Sets or updates the stock timestamp (stockTS) for this shop.
   *
   * @param {number} [time] Optional timestamp to set; defaults to Date.now()
   * @returns {number} The timestamp set for the stock
   */
  setStamp(time) {
    const now = typeof time === "number" ? time : Date.now();
    UTShop.stockTS.set(this.key, now);
    return now;
  }

  /**
   * Decreases the stock for a given user and stock item.
   * Depends on `getStock` to handle reset and initialization.
   *
   * @param {string} userID
   * @param {string} stockID
   * @returns {boolean}
   */
  decreaseStock(userID, stockID) {
    const currentStock = this.getStock(userID, stockID);

    if (currentStock <= 0) {
      return false;
    }

    const map = UTShop.stocksData.get(this.key);
    const userMap = map.get(userID);

    userMap.set(stockID, currentStock - 1);
    return true;
  }

  /**
   * Returns current stock value for a user and stock item.
   * Handles resets and ensures data.
   *
   * @param {string} userID
   * @param {string} stockID
   * @returns {number}
   */
  getStock(userID, stockID) {
    this.ensureStock(userID, stockID);

    const shopMap = UTShop.stocksData.get(this.key);
    const userStockMap = shopMap.get(userID);

    return userStockMap.get(stockID) ?? 0;
  }

  /**
   *
   * @param  {string[]} keys
   * @returns
   */
  resetStocks(...keys) {
    const shopMap = UTShop.stocksData.get(this.key);
    if (!(shopMap instanceof Map)) return;

    for (const userStockMap of shopMap.values()) {
      if (!(userStockMap instanceof Map)) continue;

      for (const stockID of keys) {
        userStockMap.delete(stockID);
      }
    }
  }

  mapItemData(itemData) {
    const result = itemData.map((item, index) => {
      const {
        price = 0,
        flavorText = "What does this do?",
        name = "Unknown Item",
        icon = "❓",
        onPurchase = () => {},
        atk = null,
        def = null,
        heal = null,
        key,
      } = item;
      return {
        ...item,
        price,
        flavorText,
        name,
        icon,
        atk,
        def,
        heal,
        onPurchase,
        num: index + 1,
        key,
      };
    });
    return result;
  }
  mapTalkTexts(talkTexts) {
    const result = talkTexts.map((text, index) => {
      const { name = "Unknown Topic", responses = [], icon = "🤍" } = text;
      return {
        name,
        icon,
        responses,
        num: index + 1,
      };
    });
    return result;
  }
  stringTalkTexts() {
    const result = this.talkTexts
      .map((text) => {
        return `**${text.num}.** ${text.icon} ${text.name}`;
      })
      .join("\n");
    return result;
  }
  stringSellData(inventory) {
    const result = inventory
      .map(
        (item) =>
          `${item.index + 1}. **${item.icon} ${item.name}** - **${
            item.shopDisallowed ? `🚫` : `${pCy(item.sellPrice || 0)}$`
          }**\n${UNISpectra.charm} 💬 ${item.flavorText}`
      )
      .join("\n\n");
    return result;
  }
  /**
   * @param {string} t
   */
  isCll(t) {
    t ??= "money";
    const state = !["money"].includes(t) && `${t}`.startsWith("cll:");
    return {
      state,
      cllKey: state ? `${t}`.replaceAll("cll:", "") : t,
    };
  }
  /**
   * @param {string} t
   * @param {UserData} userData
   */
  getUserHas(userData, t) {
    t ??= "money";
    if (t === "money") return userData.money ?? 0;

    if (this.isCll(t)) {
      const cll = new Collectibles(userData.collectibles ?? []);
      const k = `${t}`.replace("cll:", "");
      return cll.has(k) ? cll.getAmount(k) : 0;
    }
    return null;
  }

  get pageLimit() {
    return 4;
  }

  getPageSlicer() {
    return new Slicer(this.itemData, this.pageLimit);
  }

  /**
   *
   * @param {{ inventory: Inventory; boxInventory: Inventory; userMoney: number; playersMap: Map<string, PetPlayer>; userData: UserData, page: number }} param0
   * @returns
   */
  async stringItemData({
    inventory,
    boxInventory,
    userMoney: _money = 0,
    playersMap,
    userData,
    page,
  }) {
    const { analytics = [] } = await Cassidy.databases.globalDB.getCache(
      UTShop.analyticsKey
    );
    const analyMap = new Map(analytics);
    const collectibles = new Collectibles(userData.collectibles ?? []);

    const slicer = this.getPageSlicer();
    const data = slicer.getPage(page);

    let result;
    const itemHeight = 128;
    const width = 480;
    const spacing = 15;
    const header = CanvCass.createRect({
      width: width - spacing * 2,
      left: spacing,
      height: 64,
      top: spacing,
    });
    const itemWidth = width - spacing * 2;
    const height =
      itemHeight * data.length +
      spacing * (data.length + 1) +
      header.height +
      spacing * 2;
    const canv = new CanvCass(width, height);
    await canv.drawBackground();
    const mainFSize = 20;
    const lineDiff = 5;

    canv.drawText(`👤 ${userData.name ?? "Unregistered"}`, {
      x: header.left,
      y: header.top + mainFSize / 2,
      align: "left",
      baseline: "middle",
      fontType: "cbold",
      size: mainFSize,
      fill: "white",
    });
    canv.drawText(`📃 Page ${page} of ${this.getPageSlicer().pagesLength}`, {
      x: header.left,
      y: header.top + mainFSize / 2 + mainFSize + lineDiff,
      align: "left",
      baseline: "middle",
      fontType: "cbold",
      size: mainFSize,
      fill: "white",
    });
    canv.drawText(`🧰 ${inventory.size()}/${inventory.limit}`, {
      x: header.right,
      y: header.top + mainFSize / 2 + mainFSize + lineDiff,
      align: "right",
      baseline: "middle",
      fontType: "cbold",
      size: mainFSize,
      fill: "white",
    });
    canv.drawText(`$${abbreviateNumber(userData.money, 4)} 💵`, {
      x: header.right,
      y: header.top + mainFSize / 2,
      align: "right",
      baseline: "middle",
      fontType: "cbold",
      size: mainFSize,
      fill: "white",
    });
    if (data.length === 0) {
      result = `🧹 No items available!`;
      canv.drawText(result, {
        align: "center",
        x: canv.centerX,
        y: canv.centerY,
        fill: "white",
        fontType: "cbold",
        size: 50,
      });
    } else {
      /**
       * @type {Array<import("@cass-modules/cassidyUser").CollectibleItem>}
       */
      let allCll = [];
      result = data
        .map((item, index) => {
          const top =
            itemHeight * index + spacing * (index + 1) + header.height;
          const containerCan = CanvCass.createRect({
            centerX: canv.centerX,
            top,
            height: itemHeight,
            width: itemWidth,
          });
          const boughts = Number(analyMap.get(item.key)) || 0;

          const priceInfo = this.isCll(item.priceType);
          const currentAmount = this.getUserHas(userData, item.priceType);
          /**
           * @type {import("@cass-modules/cassidyUser").CollectibleItem["metadata"]}
           */
          const cllItem =
            priceInfo.state && collectibles.has(priceInfo.cllKey)
              ? collectibles.getMeta(priceInfo.cllKey)
              : {
                  icon: "❓",
                  name: "Unknown Item",
                  key: priceInfo.cllKey,
                  type: "unknown",
                };

          if (
            !allCll.some((i) => i?.metadata?.key === cllItem.key) &&
            cllItem.key !== "money"
          ) {
            allCll.push({
              amount: currentAmount,
              metadata: cllItem,
            });
          }

          const stocks = this.getStock(userData.userID, item.key);
          const invAmount = inventory.getAmount(item.key);
          const boxAmount = boxInventory.getAmount(item.key);
          const ndrive = new Inventory(userData.ndrive?.items ?? [], Infinity);
          const bank = new Inventory(userData.bankData?.items ?? [], Infinity);
          const bag = new Inventory(userData.bagData?.items ?? [], Infinity);
          const ndriveAmount = ndrive.getAmount(item.key);
          const bankAmount = bank.getAmount(item.key);
          const bagAmount = bag.getAmount(item.key);
          let isAffordable = currentAmount >= Number(item.price ?? 0);
          let isSellable = true;
          if (item.cannotBuy === true) {
            isSellable = false;
          }
          if (stocks <= 0) {
            isSellable = false;
          }
          let hasInv = Boolean(
            invAmount || boxAmount || ndriveAmount || bankAmount || bagAmount
          );
          let result = ``;
          result += `${UNISpectra.standardLine}\n`;

          if (isSellable) {
            result += `${item.num}. **${item.icon} ${item.name}**\n`;
          } else {
            result += `${item.num}. ${item.icon} ${item.name}\n`;
          }
          const iconW = containerCan.height - spacing * 2;
          const iconBox = CanvCass.createRect({
            left: containerCan.left + spacing,
            centerY: containerCan.centerY,
            width: iconW,
            height: iconW,
          });
          canv.drawBox({
            rect: containerCan,
            fill: isSellable ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
          });
          canv.drawBox({
            rect: iconBox,
            fill: isSellable ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
          });
          const iconLen = countEmojis(item.icon);
          canv.drawText(`${item.icon}`, {
            x: iconBox.centerX,
            y: iconBox.centerY,
            align: "center",
            baseline: "middle",
            fontType: "cnormal",
            fill: isSellable ? "white" : "rgba(255, 255, 255, 0.7)",

            size: iconW / iconLen - spacing * 2,
          });
          canv.drawText(`#${item.num}`, {
            x: iconBox.right,
            y: iconBox.bottom - mainFSize / 2,
            align: "right",
            baseline: "middle",
            fontType: "cbold",
            size: mainFSize,
            fill: "white",
          });
          canv.drawText(`${item.name}`, {
            x: iconBox.right + spacing,
            y: iconBox.top + mainFSize / 2,
            align: "left",
            baseline: "middle",
            fontType: "cbold",
            size: mainFSize,
            fill: isSellable ? "white" : "rgba(255, 255, 255, 0.7)",
          });
          canv.drawText(
            `${
              isSellable
                ? stocks !== Infinity && typeof item.stockLimit === "number"
                  ? `x${stocks} STOCK`
                  : ""
                : `NO STOCK`
            }`,
            {
              x: iconBox.right + spacing,
              y: iconBox.top + mainFSize / 2 + mainFSize + lineDiff,
              align: "left",
              baseline: "middle",
              fontType: "cbold",
              size: mainFSize,
              fill: isSellable ? "rgba(255, 255, 255, 0.7)" : "red",
            }
          );
          if (boughts > 0) {
            canv.drawText(`x${abbreviateNumber(boughts)} Sold 🛍️`, {
              x: containerCan.right - spacing,
              y: iconBox.top + mainFSize / 2,
              align: "right",
              baseline: "middle",
              fontType: "cbold",
              size: mainFSize,
              fill: "rgba(255, 255, 255, 0.5)",
            });
          }
          canv.drawText(
            `${
              priceInfo.state
                ? `${cllItem.icon}${abbreviateNumber(item.price, 4)}`
                : `$${abbreviateNumber(item.price, 4)}`
            } ${
              isSellable ? (isAffordable ? (hasInv ? "✅" : "💰") : "❌") : "🚫"
            }`,
            {
              x: containerCan.right - spacing,
              y: iconBox.bottom - mainFSize / 2,
              align: "right",
              baseline: "middle",
              fontType: "cbold",
              size: mainFSize,
              fill: isSellable
                ? isAffordable
                  ? hasInv
                    ? "white"
                    : "lime"
                  : "orange"
                : "red",
            }
          );

          canv.drawText(`Price:`, {
            x: iconBox.right + spacing,
            y: iconBox.bottom - mainFSize / 2 - mainFSize - lineDiff,
            align: "left",
            baseline: "middle",
            fontType: "cnormal",
            size: mainFSize,
            fill: "rgba(255, 255, 255, 0.7)",
          });
          canv.drawText(
            `${
              priceInfo.state ? `${cllItem.icon} ${cllItem.name}` : `💵 Money`
            }`,
            {
              x: iconBox.right + spacing,
              y: iconBox.bottom - mainFSize / 2,
              align: "left",
              baseline: "middle",
              fontType: "cbold",
              size: mainFSize,
              fill: "white",
            }
          );

          result +=
            `- ${
              isSellable
                ? `${
                    priceInfo.state
                      ? `**${formatValue(item.price ?? 0, cllItem.icon)}** ${
                          cllItem.name
                        } [${cllItem.key}]\n`
                      : `**${formatCash(
                          Number(this.isGenoR() ? 0 : item.price ?? 0)
                        )}**`
                  } ${
                    isSellable
                      ? isAffordable
                        ? hasInv
                          ? "✅"
                          : "💰"
                        : "❌"
                      : "🚫"
                  }${
                    stocks !== Infinity && typeof item.stockLimit === "number"
                      ? ` 「 **${stocks}**/${item.stockLimit ?? 5} 」`
                      : ""
                  }`
                : "🚫 No Stock"
            } ${invAmount ? ` 🧰 **x${invAmount}**` : ""}${
              boxAmount ? ` 🗃️ **x${boxAmount}**` : ""
            }${ndriveAmount ? ` 💾 **x${ndriveAmount}**` : ""}${
              bankAmount ? ` 🏦 **x${bankAmount}**` : ""
            }${bagAmount ? ` 🎒 **x${bagAmount}**` : ""}${
              item.inflation
                ? ` [ 📈 **+${abbreviateNumber(
                    Number(item.inflation ?? 0) || 0
                  )}$** ]`
                : ""
            }`.trim() +
            (item.flavorText || (!isSellable && item.cannotBuyFlavor)
              ? "\n"
              : "");
          if (!(playersMap instanceof Map)) {
            throw new Error(`playersMap must be a Map`);
          }
          if (
            playersMap &&
            playersMap instanceof Map &&
            (item.type === "weapon" || item.type === "armor")
          ) {
            let hasLine = false;
            for (const [, petPlayer] of playersMap) {
              const clone = petPlayer.clone();
              let isHead = false;
              const applyHead = () => {
                if (!isHead) {
                  result += `☆ ${petPlayer.petIcon} `;
                  isHead = true;
                  hasLine = true;
                }
              };
              if (item.type === "weapon") {
                clone.weapon[0] = JSON.parse(JSON.stringify(item));
                const diff = clone.ATK - petPlayer.ATK;
                const defDiff = clone.DF - petPlayer.DF;
                if (diff !== 0) {
                  let i = diff > 0;
                  let b = i ? "**" : "";
                  applyHead();
                  result += `**${diff > 0 ? "+" : ""}${diff}** ${b}ATK${b}, `;
                }
                if (defDiff !== 0) {
                  let i = defDiff > 0;
                  let b = i ? "**" : "";
                  applyHead();
                  result += `**${
                    defDiff > 0 ? "+" : ""
                  }${defDiff}** ${b}DEF${b}, `;
                }
              } else if (item.type === "armor") {
                if (clone.armors[0] && clone.armors[0].def > Number(item.def)) {
                  clone.armors[1] = JSON.parse(JSON.stringify(item));
                } else {
                  clone.armors[0] = JSON.parse(JSON.stringify(item));
                }

                const diff = clone.DF - petPlayer.DF;
                const atkDiff = clone.ATK - petPlayer.ATK;
                if (diff !== 0) {
                  applyHead();
                  let i = diff > 0;
                  let b = i ? "**" : "";
                  result += `**${diff > 0 ? "+" : ""}${diff}** ${b}DEF${b}, `;
                }
                if (atkDiff !== 0) {
                  let i = atkDiff > 0;
                  let b = i ? "**" : "";
                  applyHead();
                  result += `**${
                    atkDiff > 0 ? "+" : ""
                  }${atkDiff}** ${b}ATK${b}, `;
                }
              }
              if (isHead) {
                result += `\n`;
              }
            }
            if (hasLine) {
              result += `\n`;
            }
          }

          if (item.flavorText || (!isSellable && item.cannotBuyFlavor)) {
            result += `${UNISpectra.charm} ${
              isSellable
                ? item.flavorText
                : item.cannotBuyFlavor ?? item.flavorText
            }`;
          }
          return result;
        })
        .join("\n");
      if (page !== this.getPageSlicer().pagesLength) {
        result += `\n${
          UNISpectra.standardLine
        }\n📃 **MORE ITEMS**: Reply with **page ${
          page + 1
        }** to see the next page!`;
      }
      if (allCll.length > 0) {
        result += `\n\n${UNISpectra.charm} 🏆 **Your Collectibles**:\n${allCll
          .map(
            (i) =>
              `${formatValue(i.amount, i.metadata?.icon, true)} ${
                i.metadata?.name
              } [${i.metadata.key}]`
          )
          .join("\n")}`;
      }
    }

    return { str: result, canv };
  }
  rand(arr) {
    if (arr.length === 1) {
      return arr[0];
    }
    if (arr.length === 2) {
      return Math.random() < 0.5 ? arr[0] : arr[1];
    }
    return arr[Math.floor(Math.random() * arr.length)];
  }
  isGenoR() {
    return false;
    return this.playerRoute.toLowerCase() === "genocide" && !this.notScaredGeno;
  }

  optionText() {
    return (
      `      💵        💬 \n` +
      `     **Buy**     **Talk**\n` +
      `\n💌 ***Reply with an option without a prefix.***`
    );
  }
  optionTextOld2() {
    return (
      `      💵        💰         ⚒ \n` +
      `     **Buy**     **Sell**     **Trade**\n` +
      `\n` +
      `            💬         🏠\n` +
      `          **Talk**     **Leave**\n` +
      `\n***Reply with an option***`
    );
  }
  optionTextOld() {
    if (this.isGenoR()) {
      return `🗃️ **Steal**\n💰 **Take**\n📄 **Read**\n🏠 **Leave**`;
    }
    //return `💵 **Buy**\n💰 **Sell**\n⚒️ **Trade**\n💬 **Talk**\n🏠 **Leave**`;
    return `      💵        💰         ⚒ 
     **Buy**     **Sell**     **Trade**

            💬         🏠 
          **Talk**     **Leave**\n\n***Reply with an option***`;
  }
  /**
   *
   * @param {CommandContext} context
   * @returns
   */
  async onPlay(context) {
    if (!context) {
      throw new TypeError(
        "No context provided! Please update your SHOP FILE to include the entire CommandContext as first argument of onPlay. DO NOT PUT INCOMPLETE CONTEXT"
      );
    }
    let author = context.input.senderID;
    const self = this;

    const stateShop = {
      author,
      command: context.command,
      isItemChoose: false,
      isTalkChoose: false,
      isTalkNext: false,
      talkIndex: 0,
      page: 1,
      targetTalk: null,
      detectID: "",
    };

    try {
      const { invLimit } = global.Cassidy;

      const inventoryLimit = invLimit;
      const { input, output, money, getInflationRate } = context;
      author = input.senderID;
      this.style ??= context.command?.style;

      if (context.command?.style) {
        output.setStyle(context.command.style);
      }
      if (this.style) {
        output.setStyle(this.style);
      }

      const { analytics = [] } = await Cassidy.databases.globalDB.getCache(
        UTShop.analyticsKey
      );
      const analyMap = new Map(analytics);
      this.itemData = [...this.itemData].sort(
        (a, b) =>
          (Number(analyMap.get(b.key)) || 0) -
          (Number(analyMap.get(a.key)) || 0)
      );

      const inflationRate = await getInflationRate();
      this.itemData = this.itemData.map((item) => {
        if (item.priceType !== "money" && item.priceType) {
          return {
            ...item,
            inflation: 0,
            originalPrice: item.price,
            price: item.price,
          };
        }
        const originalPrice = Number(item.price ?? 0);
        const inflation = Math.round(inflationRate * originalPrice);
        const newPrice = originalPrice + inflation;
        return {
          ...item,
          price: newPrice,
          originalPrice,
          inflation,
        };
      });

      this.itemData.forEach((i) => this.ensureStock(input.senderID, i.key));

      const jumpToReply = () => {
        onReply({ ...context });
      };

      if (input.args.at(-1)?.toLowerCase() === "buy") {
        stateShop.isItemChoose = true;
        jumpToReply();
        return;
      }
      if (input.args.at(-1)?.toLowerCase() === "talk") {
        stateShop.isTalkChoose = true;
        jumpToReply();
        return;
      }

      const { money: cash, inventory = [] } = await money.getItem(
        input.senderID
      );

      const i = await output.reply(`${UNISpectra.charm} 💬 ${
        this.isGenoR() ? `But nobody came.` : this.rand(this.welcomeTexts)
      }

${this.optionText()}

**${formatCash(cash)}** 🧰 **${inventory.length}/${inventoryLimit}**`);
      input.setReply(i.messageID, {
        key: context.commandName,
        author: input.senderID,
        callback(c) {
          return onReply(c);
        },
        detectID: i.messageID,
        command: context.command,
      });
    } catch (error) {
      console.error(error);
      context.output?.error?.(error);
    }

    /**
     * @type {(context: CommandContext & { repObj?: Record<string, any> }) => Promise<any>}
     */
    async function onReply(context) {
      try {
        const { invLimit } = global.Cassidy;

        const { input, output, money } = context;
        if (stateShop.command?.style) {
          output.setStyle(stateShop.command.style);
        }
        if (self.style) {
          output.setStyle(self.style);
        }
        const { author } = stateShop;
        const inventoryLimit = invLimit;
        if (input.senderID !== author) {
          return;
        }
        let [option] = input.splitBody(" ");
        option = option.toLowerCase();
        if (stateShop.isItemChoose) {
          return handleBuyItem();
        }
        if (stateShop.isTalkChoose) {
          return handleTalkChoices();
        }

        if (stateShop.isTalkNext && (option === "next" || option === "back")) {
          return handleTalkChoices();
        }

        switch (option) {
          case "buy":
            return handleBuy();
          case "talk":
            return handleTalk();
          case "back":
            return handleGoBack();
          default:
            break;
        }

        /**
         *
         * @param {string} id
         * @param {Partial<typeof stateShop>} param1
         */
        async function handleEnd(id, { ...additional } = {}) {
          try {
            input.delReply(context.repObj?.detectID);
          } catch (error) {}
          Object.assign(stateShop, additional);
          input.setReply(id, {
            key: context.commandName,
            author,
            callback(c) {
              return onReply(c);
            },
            detectID: id,
          });
        }

        async function handleBuy() {
          const userInfo = await money.getItem(input.senderID);
          const { money: cash, inventory = [], boxItems = [] } = userInfo;
          const { playersMap } = context.petPlayerMaps(userInfo);
          const { str: items, canv } = await self.stringItemData({
            userMoney: cash,
            inventory: new Inventory(inventory),
            boxInventory: new Inventory(boxItems, 100),
            playersMap,
            userData: userInfo,
            page: stateShop.page,
          });
          const dialogue = self.rand(self.buyTexts);
          const i = await output.reply({
            body: `📃 **Page ${stateShop.page}** of ${
              self.getPageSlicer().pagesLength
            }\n🔎 Reply with **<num> <quantity>** to purchase.\n📁 Reply with **page <num>** to switch pages.\n\n${
              UNISpectra.charm
            } 💬 ${dialogue}\n\n${items}\n\n**${formatCash(cash)}** 🧰 **${
              inventory.length
            }/${inventoryLimit}**`,
            attachment: await canv.toStream(),
          });
          handleEnd(i.messageID, {
            isItemChoose: true,
          });
        }

        async function handleTalk() {
          stateShop.isTalkNext = false;
          stateShop.talkIndex = 0;
          if (self.talkTexts.length === 0) {
            return output.reply(`${UNISpectra.charm} 💬 No topics available.`);
          }
          const talks = self.stringTalkTexts();
          const i = await output.reply(
            `${UNISpectra.charm} 💬 ${self.rand(
              self.askTalkTexts
            )}\n\n${talks}\n💌 ***Reply with a topic number***.`
          );
          handleEnd(i.messageID, {
            isTalkChoose: true,
          });
        }

        async function handleBuyItem() {
          if (input.words.at(0)?.toLowerCase() === "page") {
            const newPage = Math.floor(
              Math.max(
                1,
                Math.min(
                  Number(input.words[1]) || 1,
                  self.getPageSlicer().pagesLength
                )
              )
            );
            stateShop.page = newPage;
            return handleBuy();
          }
          const { petPlayerMaps } = context;
          const userInfo = await money.getItem(input.senderID);
          const {
            money: cash = 0,
            inventory = [],
            boxItems: boxInventory = [],

            cassEXP: cxp,
          } = userInfo;

          const collectibles = new Collectibles(userInfo.collectibles ?? []);
          const cassEXP = new CassEXP(cxp);

          let { playersMap } = petPlayerMaps(userInfo);

          // let { str: items, canv } = await self.stringItemData({
          //   userMoney: cash,
          //   inventory: new Inventory(inventory),
          //   boxInventory: new Inventory(boxInventory, 100),
          //   playersMap,
          //   userData: userInfo,
          //   page: stateShop.page,
          // });
          const num = parseInt(input.words[0]);

          if (String(input.words[0]).toLowerCase() === "back") {
            return handleGoBack();
          }

          const targetItem = self.itemData.find(
            (item) => String(item.num) === String(num)
          );
          if (isNaN(num) || !targetItem) {
            return output.reply(
              `❗ **Invalid input:** Please reply with a valid number (1st argument) shown to the **left of the item name**.`
            );
          }

          let { price = 0, onPurchase } = targetItem;
          targetItem.priceType ??= "money";
          const priceInfo = self.isCll(targetItem.priceType);
          const currentAmount = self.getUserHas(userInfo, targetItem.priceType);
          const stocks = self.getStock(input.senderID, targetItem.key);
          /**
           * @type {import("@cass-modules/cassidyUser").CollectibleItem["metadata"]}
           */
          const cllItem =
            priceInfo.state && collectibles.has(priceInfo.cllKey)
              ? collectibles.getMeta(priceInfo.cllKey)
              : {
                  icon: "❓",
                  name: "Unknown Item",
                  key: priceInfo.cllKey,
                  type: "unknown",
                };

          let amount =
            parseBet(
              input.words[1],
              isFinite(stocks) ? stocks : invLimit - inventory.length
            ) || 1;
          if (isNaN(amount) || amount <= 0) {
            amount = 1;
          }
          if (amount > inventoryLimit - inventory.length) {
            amount = inventoryLimit - inventory.length;
          }

          if (amount >= stocks) {
            amount = stocks;
          }
          if (targetItem.cannotBuy || stocks <= 0) {
            return output.reply(
              `🚫 **OUT OF STOCK:** You can't buy this item at the moment.`
            );
          }
          if (inventory.length >= inventoryLimit) {
            return output.reply(
              `📦 **Inventory full:** You have **${inventory.length}/${inventoryLimit}** items.\nPlease free up space before buying more.`
            );
          }

          if (amount <= 0) {
            return output.reply(
              `💌 **Invalid amount:** The number you entered (2nd argument) is **not valid**.`
            );
          }

          price = amount * price;
          if (currentAmount < price) {
            return output.reply(
              `💸 **Insufficient funds:** You have ${
                priceInfo.state
                  ? `${formatValue(currentAmount, cllItem.icon)} ${
                      cllItem.name
                    }`
                  : formatCash(currentAmount, true)
              }, but need ${
                priceInfo.state
                  ? `${formatValue(price, cllItem.icon)} ${cllItem.name}`
                  : formatCash(price, true)
              }.\nPlease choose a valid option or type **back**.`
            );
          }

          cassEXP.expControls.raise(
            targetItem.expReward ??
              clamp(0, targetItem.price / 500000, 10) * amount
          );
          /**
           * @type {Partial<UserData>}
           */
          const argu = {
            inventory,
            cassEXP: cassEXP.raw(),
            boxInventory,
          };
          const newCtx = {
            ...context,
            moneySet: argu,
          };
          if (!priceInfo.state && targetItem.priceType === "money") {
            argu.money = cash - price;
            userInfo.money = argu.money;
          }
          if (priceInfo.state && cllItem) {
            collectibles.raise(priceInfo.cllKey, -price);
            argu.collectibles = Array.from(collectibles);
            userInfo.collectibles = argu.collectibles;
          }

          const { analytics = [] } = await Cassidy.databases.globalDB.getCache(
            UTShop.analyticsKey
          );
          const analyMap = new Map(analytics);
          const invCache = [...inventory];
          for (let i = 0; i < amount; i++) {
            try {
              // @ts-ignore
              await onPurchase(newCtx);
              self.decreaseStock(input.senderID, targetItem.key);
              const b = Number(analyMap.get(targetItem.key)) || 0;
              analyMap.set(targetItem.key, b + 1);
            } catch (error) {
              console.error(error);
              output.error(error);
            }
          }

          const added = argu.inventory.filter((i) => !invCache.includes(i));
          const firstAdded = added[0];
          await money.setItem(input.senderID, {
            ...argu,
            inventory: new Inventory(argu.inventory).raw(),
          });
          await Cassidy.databases.globalDB.setItem(UTShop.analyticsKey, {
            analytics: [...analyMap],
          });
          let { str: items, canv } = await self.stringItemData({
            userMoney:
              !priceInfo.state && targetItem.priceType === "money"
                ? cash - price
                : cash,
            inventory: new Inventory(inventory),
            boxInventory: new Inventory(boxInventory, 100),
            playersMap,
            userData: userInfo,
            page: stateShop.page,
          });

          const dialogue = self.rand(self.thankTexts);
          const header = `📃 **Page ${stateShop.page}** of ${
            self.getPageSlicer().pagesLength
          }\n\n✅ Added **x${amount} ${firstAdded.icon} ${firstAdded.name}** (${
            firstAdded.key
          }) for ${
            priceInfo.state
              ? `${formatValue(price, cllItem.icon)} ${cllItem.name}`
              : formatCash(price, true)
          }`;

          const i = await output.reply({
            body: `${header}\n\n${
              UNISpectra.charm
            } 💬 ${dialogue}\n\n${items}\n\n**${formatCash(
              !priceInfo.state && targetItem.priceType === "money"
                ? cash - price
                : cash
            )}** 🧰 **${inventory.length}/${inventoryLimit}**`,
            attachment: await canv.toStream(),
          });
          handleEnd(i.messageID, {
            isItemChoose: true,
          });
        }

        async function handleTalkChoices() {
          if (input.words[0] === "back") {
            if (!stateShop.isTalkNext) {
              return handleBack();
            }
            return handleTalk();
          }
          const num = parseInt(input.words[0]);
          const targetTalk =
            stateShop.targetTalk ??
            self.talkTexts.find((talk) => String(talk.num) === String(num));
          if ((!stateShop.isTalkNext && isNaN(num)) || !targetTalk) {
            return output.reply(
              `(Go back and reply with a valid number that you can see at the left side of the choice name.)`
            );
          }
          const { responses } = targetTalk;
          const index = stateShop.talkIndex ?? 0;
          const text = responses[index];
          stateShop.isTalkChoose = false;
          if (text) {
            const i = await output.reply(
              `${UNISpectra.charm} 💬 ${text}\n\n**Next**\n**Back**`
            );
            handleEnd(i.messageID, {
              isTalkNext: true,
              talkIndex: index + 1,
              targetTalk,
            });
          } else {
            stateShop.isTalkNext = false;
            stateShop.talkIndex = 0;
            stateShop.targetTalk = null;
            return handleTalk();
          }
        }
        async function handleBack() {
          return handleGoBack();
        }
        async function handleGoBack() {
          const { money: cash, inventory = [] } = await money.getItem(
            input.senderID
          );

          const i = await output.reply(`${UNISpectra.charm} 💬 ${
            self.isGenoR() ? `Nobody is here.` : self.rand(self.goBackTexts)
          }

${self.optionText()}

**${formatCash(cash)}**$ 🧰 **${inventory.length}/${inventoryLimit}**`);
          handleEnd(i.messageID);
        }
      } catch (error) {
        console.error(error);
        context.output?.error?.(error);
      }
    }
  }
}
