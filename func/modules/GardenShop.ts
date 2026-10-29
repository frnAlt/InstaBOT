import { CROP_CONFIG } from "@cass-modules/GardenConfig";
import { GardenItem, GardenSeed } from "@cass-modules/GardenTypes";
import { ShopItem } from "./GardenBalancer";
import { UNISpectra } from "./unisym";
import { OutputResult } from "@cass-plugins/output";
import { InventoryItem } from "./cassidyUser";

export namespace gardenShop {
  export type GardenShopItem = Omit<ShopItem, "onPurchase"> & {
    icon: string;
    name: string;
    key: string;
    flavorText: string;
    price: number;
    rarity: GardenRarity;
    stockLimitOfficial?: number;
    inStock: boolean;
    isEventItem?: boolean;
    stockChance: number;
    stockLimit?: number;
    minStock: number;
    maxStock: number;
    pack?: string;
    packChance?: number;
    isOfficialStock?: boolean;
    onPurchase: ({
      moneySet,
    }: {
      moneySet: { inventory: GardenItem[] };
    }) => void;
  };
  export let honeyShop: GardenShopItem[] = [
    {
      icon: "🎴🪻",
      name: "Flower Seed Pack",
      key: "pFlowerSeed",
      flavorText: "A seed pack contaning many types of flower seeds.",
      price: 10,
      rarity: "Uncommon",
      inStock: true,
      priceType: "cll:honey",
      stockLimit: 2,
      minStock: 1,
      maxStock: 5,
      stockChance: 1,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "pFlowerSeed",
          name: "Flower Seed Pack",
          flavorText: "A seed pack contaning many types of flower seeds.",
          icon: "🎴🪻",
          type: "roulette_pack",
          sellPrice: 1,
          treasureKey: "randomGrouped_pFlowers",
        });
      },
    },
    {
      icon: "💜🌿",
      name: "Lavender Seed",
      key: "gsLavender",
      flavorText:
        "A calming herb with a rich scent, known for its vibrant purple hue.",
      price: 3,
      rarity: "Uncommon",
      inStock: true,
      priceType: "cll:honey",
      stockLimit: 3,
      minStock: 3,
      maxStock: 4,
      stockChance: 1,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsLavender",
          name: "Lavender Seed",
          flavorText:
            "A calming herb with a rich scent, known for its vibrant purple hue.",
          icon: "💜🌿",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 22_563,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5.2,
            harvests: 1,
            yields: 1,
            baseKG: 0,
          },
        });
      },
    },
    {
      icon: "🍯🍄",
      name: "Nectarshade Seed",
      key: "gsNectarshade",
      flavorText:
        "A rare mushroom with a dripping honeycap and an eerie golden glow.",
      price: 5,
      rarity: "Rare",
      inStock: true,
      priceType: "cll:honey",
      stockLimit: 2,
      minStock: 1,
      maxStock: 3,
      stockChance: 1,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsNectarshade",
          name: "Nectarshade Seed",
          flavorText:
            "A rare mushroom with a dripping honeycap and an eerie golden glow.",
          icon: "🍯🍄",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 43_125,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5.4,
            harvests: 1,
            yields: 1,
            baseKG: 0,
          },
        });
      },
    },
    {
      icon: "🌴🍑",
      name: "Nectarine Seed",
      key: "gsNectarine",
      flavorText:
        "A small yet bountiful tree with lush fronds and nectar-rich fruit.",
      price: 25,
      rarity: "Mythical",
      inStock: true,
      priceType: "cll:honey",
      stockLimit: 1,
      minStock: 1,
      maxStock: 1,
      stockChance: 1,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsNectarine",
          name: "Nectarine Seed",
          flavorText:
            "A small yet bountiful tree with lush fronds and nectar-rich fruit.",
          icon: "🌴🍑",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 36_100,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5.2,
            harvests: 90,
            yields: 10,
            baseKG: 10,
          },
        });
      },
    },
    {
      icon: "🍑🐝",
      name: "Hive Fruit Seed",
      key: "gsHiveFruit",
      flavorText:
        "A divine seed that grows into a wide, branchy tree bearing golden hive fruit.",
      price: 40,
      rarity: "Divine",
      inStock: true,
      priceType: "cll:honey",
      stockLimit: 1,
      minStock: 1,
      maxStock: 1,
      stockChance: 1,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsHiveFruit",
          name: "Hive Fruit Seed",
          flavorText:
            "A divine seed that grows into a wide, branchy tree bearing golden hive fruit.",
          icon: "🍑🐝",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 55_950,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5.4,
            harvests: 100,
            yields: 9,
          },
        });
      },
    },
    {
      icon: "🌹",
      name: "Rose Seed",
      key: "gsRose",
      flavorText:
        "A thorny yet elegant flower, blooming in deep maroon from angular petals.",
      price: 0,
      rarity: "Uncommon",
      inStock: false,
      priceType: "cll:honey",
      stockLimit: 0,
      minStock: 0,
      pack: "pFlowerSeed",
      packChance: 0.4,
      maxStock: 0,
      stockChance: 0,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsRose",
          name: "Rose Seed",
          flavorText:
            "A thorny yet elegant flower, blooming in deep maroon from angular petals.",
          icon: "🌹",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 4_513,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5.2,
            harvests: 60,
            yields: 3,
          },
        });
      },
    },
    {
      icon: "🧪🌸",
      name: "Foxglove Seed",
      key: "gsFoxglove",
      flavorText:
        "A spire of tubular blooms, each flower a purple-pink bell tipped with a witch's hat.",
      price: 0,
      rarity: "Rare",
      inStock: false,
      priceType: "cll:honey",
      stockLimit: 0,
      minStock: 0,
      pack: "pFlowerSeed",
      packChance: 0.25,
      maxStock: 0,
      stockChance: 0,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsFoxglove",
          name: "Foxglove Seed",
          flavorText:
            "A spire of tubular blooms, each flower a purple-pink bell tipped with a witch's hat.",
          icon: "🧪🌸",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 18_050,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5.1,
            harvests: 70,
            yields: 4,
          },
        });
      },
    },
    {
      icon: "💮🌿",
      name: "Lilac Seed",
      key: "gsLilac",
      flavorText:
        "Elegant pink blossoms spiral up a long green stem, flourishing with legendary charm.",
      price: 0,
      rarity: "Legendary",
      inStock: false,
      priceType: "cll:honey",
      stockLimit: 0,
      minStock: 0,
      pack: "pFlowerSeed",
      packChance: 0.2,
      maxStock: 0,
      stockChance: 0,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsLilac",
          name: "Lilac Seed",
          flavorText:
            "Elegant pink blossoms spiral up a long green stem, flourishing with legendary charm.",
          icon: "💮🌿",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 31_588,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5.25,
            harvests: 80,
            yields: 6,
          },
        });
      },
    },
    {
      icon: "🌸🌿",
      name: "Pink Lily Seed",
      key: "gsPinkLily",
      flavorText:
        "A tall flower with delicate pink petals, crowned atop a dark green stem resembling robust corn stalks.",
      price: 0,
      rarity: "Mythical",
      inStock: false,
      priceType: "cll:honey",
      stockLimit: 0,
      minStock: 0,
      pack: "pFlowerSeed",
      packChance: 0.1,
      maxStock: 0,
      stockChance: 0,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsPinkLily",
          name: "Pink Lily Seed",
          flavorText:
            "A tall flower with delicate pink petals, crowned atop a dark green stem resembling robust corn stalks.",
          icon: "🌸🌿",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 58_663,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5.3,
            harvests: 85,
            yields: 7,
          },
        });
      },
    },
    {
      icon: "💠🌺",
      name: "Purple Dahlia Seed",
      key: "gsPurpleDahlia",
      flavorText:
        "A dazzling layered bloom with a mythical shimmer, standing tall with petals deep as amethyst light.",
      price: 0,
      rarity: "Mythical",
      inStock: false,
      priceType: "cll:honey",
      stockLimit: 0,
      minStock: 0,
      pack: "pFlowerSeed",
      packChance: 0.45,
      maxStock: 0,
      stockChance: 0,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsPurpleDahlia",
          name: "Purple Dahlia Seed",
          flavorText:
            "A dazzling layered bloom with a mythical shimmer, standing tall with petals deep as amethyst light.",
          icon: "💠🌺",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 67_469,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5.35,
            harvests: 90,
            yields: 8,
            baseKG: 5,
          },
        });
      },
    },
    {
      icon: "🌻🌞",
      name: "Sunflower Seed",
      key: "gsSunflower",
      flavorText:
        "A divine bloom that follows the sun's gaze, radiating unmatched brilliance with every harvest.",
      price: 0,
      rarity: "Divine",
      inStock: false,
      priceType: "cll:honey",
      stockLimit: 0,
      minStock: 0,
      pack: "pFlowerSeed",
      packChance: 0.05,
      maxStock: 0,
      stockChance: 0,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsSunflower",
          name: "Sunflower Seed",
          flavorText:
            "A divine bloom that follows the sun's gaze, radiating unmatched brilliance with every harvest.",
          icon: "🌻🌞",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 144_400,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.8,
            harvests: 240,
            yields: 10,
            baseKG: 25,
          },
        });
      },
    },
  ];
  export type GardenRarity =
    | "Common"
    | "Uncommon"
    | "Rare"
    | "Legendary"
    | "Mythical"
    | "Divine"
    | "Prismatic"
    | "Premium";
  export let key = "gardenShop";
  export let lastRestock = 0;
  export const stockRefreshInterval = 5 * 60 * 1000;
  export const stockInterval = stockRefreshInterval;
  export let itemData: GardenShopItem[] = [
    {
      icon: "🍇💎",
      name: "Cassidy Gemfruity Seed",
      key: "gsGemfruity",
      flavorText:
        "A fruit studded with shimmering gems, ripe with crystalline wealth.",
      price: 20,
      rarity: "Premium",
      inStock: true,
      priceType: "cll:gems",
      stockLimit: 2,
      minStock: 3,
      maxStock: 8,
      stockChance: 1,
      isEventItem: false,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsGemfruity",
          name: "Gemfruity Seed",
          flavorText:
            "A fruit studded with shimmering gems, ripe with crystalline wealth.",
          icon: "🍇💎",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 5_500,
            growthTime: CROP_CONFIG.GROWTH_BASE * 8.8,
            harvests: 80,
            yields: 10,
          },
        } satisfies GardenSeed);
      },
    },
    {
      icon: "🥕",
      name: "Carrot Seed",
      key: "gsCarrot",
      flavorText: "A basic crop for quick profits.",
      price: 10,
      rarity: "Common",
      stockLimitOfficial: 20,
      inStock: true,
      isEventItem: false,
      stockChance: 1.0,
      stockLimit: 20,
      minStock: 5,
      maxStock: 25,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCarrot",
          name: "Carrot Seed",
          flavorText: "A basic crop for quick profits.",
          icon: "🥕",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 18,
            growthTime: CROP_CONFIG.GROWTH_BASE,
            harvests: 1,
            yields: 1,
          },
        });
      },
    },
    {
      icon: "🍓",
      name: "Strawberry Seed",
      key: "gsStrawberry",
      flavorText: "Sweet berries with multiple harvests.",
      price: 50,
      rarity: "Common",
      isOfficialStock: false,
      inStock: true,
      stockLimit: 4,
      minStock: 1,
      maxStock: 6,
      stockChance: 1.0,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsStrawberry",
          name: "Strawberry Seed",
          flavorText: "Sweet berries with multiple harvests.",
          icon: "🍓",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 14,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2,
            harvests: 6,
            yields: 4,
          },
        });
      },
    },
    {
      icon: "🫐",
      name: "Blueberry Seed",
      key: "gsBlueberry",
      flavorText: "Tasty berries with multiple harvests.",
      price: 400,
      rarity: "Uncommon",
      inStock: true,
      stockLimit: 4,
      stockChance: 1,
      minStock: 1,
      maxStock: 5,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsBlueberry",
          name: "Blueberry Seed",
          flavorText: "Tasty berries with multiple harvests.",
          icon: "🫐",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 18,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2.5,
            harvests: 30,
            yields: 8,
          },
        });
      },
    },
    {
      icon: "🌷",
      name: "Orange Tulip Seed",
      key: "gsOrangeTulip",
      flavorText: "Bright and delicate flower crop.",
      price: 600,
      rarity: "Uncommon",
      inStock: true,
      stockLimit: 12,
      minStock: 5,
      maxStock: 25,
      stockChance: 0.34,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsOrangeTulip",
          name: "Orange Tulip Seed",
          flavorText: "Bright and delicate flower crop.",
          icon: "🌷",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 767,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3,
            harvests: 1,
            yields: 1,
          },
        });
      },
    },
    {
      icon: "🍅",
      name: "Tomato Seed",
      key: "gsTomato",
      flavorText: "Juicy tomatoes for big profits.",
      price: 800,
      rarity: "Rare",
      inStock: true,
      stockLimit: 2,
      minStock: 1,
      maxStock: 3,
      stockChance: 1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsTomato",
          name: "Tomato Seed",
          flavorText: "Juicy tomatoes for big profits.",
          icon: "🍅",
          type: "gardenSeed",
          sellPrice: 800,
          cropData: {
            baseValue: 27,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 40,
            yields: 5,
          },
        });
      },
    },
    {
      icon: "🌽",
      name: "Corn Seed",
      key: "gsCorn",
      flavorText: "Golden grain with steady yield.",
      price: 1300,
      stockLimit: 3,
      rarity: "Rare",
      inStock: true,
      stockChance: 0.17,
      minStock: 1,
      maxStock: 4,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCorn",
          name: "Corn Seed",
          flavorText: "Golden grain with steady yield.",
          icon: "🌽",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 36,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3,
            harvests: 50,
            yields: 1,
          },
        });
      },
    },
    {
      icon: "🌼",
      name: "Daffodil Seed",
      key: "gsDaffodil",
      flavorText: "Cheerful flower with fair value.",
      price: 1000,
      stockLimit: 4,
      rarity: "Rare",
      inStock: true,
      stockChance: 0.145,
      minStock: 1,
      maxStock: 6,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsDaffodil",
          name: "Daffodil Seed",
          flavorText: "Cheerful flower with fair value.",
          icon: "🌼",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 903,
            growthTime: CROP_CONFIG.GROWTH_BASE * 1.5,
            harvests: 1,
            yields: 1,
          },
        });
      },
    },
    {
      icon: "🍉",
      name: "Watermelon Seed",
      key: "gsWatermelon",
      flavorText: "Large fruit with high value.",
      price: 2500,
      rarity: "Legendary",
      inStock: true,
      stockLimit: 5,
      stockChance: 0.14,
      minStock: 1,
      maxStock: 6,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsWatermelon",
          name: "Watermelon Seed",
          flavorText: "Large fruit with high value.",
          icon: "🍉",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 2708,
            growthTime: CROP_CONFIG.GROWTH_BASE * 10,
            harvests: 1,
            yields: 1,
            baseKG: 5,
          },
        });
      },
    },
    {
      icon: "🎃",
      name: "Pumpkin Seed",
      key: "gsPumpkin",
      flavorText: "A seasonal giant with huge value.",
      price: 3000,
      minStock: 1,
      maxStock: 4,
      rarity: "Legendary",
      inStock: true,
      stockLimit: 3,
      stockChance: 0.1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsPumpkin",
          name: "Pumpkin Seed",
          flavorText: "A seasonal giant with huge value.",
          icon: "🎃",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 3700,
            growthTime: CROP_CONFIG.GROWTH_BASE * 10,
            harvests: 1,
            yields: 1,
            baseKG: 5,
          },
        });
      },
    },
    {
      icon: "🍎",
      name: "Apple Seed",
      key: "gsApple",
      flavorText: "A classic fruit for every season.",
      price: 3250,
      stockLimit: 2,
      minStock: 1,
      maxStock: 3,
      rarity: "Legendary",
      inStock: true,
      stockChance: 0.07,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsApple",
          name: "Apple Seed",
          flavorText: "A classic fruit for every season.",
          icon: "🍎",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 248,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 16,
            yields: 6,
          },
        });
      },
    },
    {
      icon: "🎍",
      name: "Bamboo Seed",
      key: "gsBamboo",
      flavorText: "Fast-growing and sturdy.",
      price: 4000,
      stockLimit: 15,
      rarity: "Legendary",
      inStock: true,
      stockChance: 0.3,
      minStock: 10,
      maxStock: 20,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsBamboo",
          name: "Bamboo Seed",
          flavorText: "Fast-growing and sturdy.",
          icon: "🎍",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 3610,
            growthTime: CROP_CONFIG.GROWTH_BASE * 10,
            harvests: 1,
            yields: 1,
            baseKG: 5,
          },
        });
      },
    },
    {
      icon: "🥥",
      name: "Coconut Seed",
      key: "gsCoconut",
      flavorText: "Tropical and rich in value.",
      price: 6000,
      stockLimit: 2,
      rarity: "Mythical",
      inStock: true,
      stockChance: 0.05,
      minStock: 1,
      maxStock: 2,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCoconut",
          name: "Coconut Seed",
          flavorText: "Tropical and rich in value.",
          icon: "🥥",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 361,
            growthTime: CROP_CONFIG.GROWTH_BASE * 4,
            harvests: 20,
            yields: 12,
            baseKG: 8,
          },
        });
      },
    },
    {
      icon: "🌵",
      name: "Cactus Seed",
      key: "gsCactus",
      flavorText: "Tough crop for extreme climates.",
      price: 15_000,
      stockLimit: 3,
      rarity: "Mythical",
      inStock: true,
      minStock: 1,
      maxStock: 5,
      stockChance: 0.03,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCactus",
          name: "Cactus Seed",
          flavorText: "Tough crop for extreme climates.",
          icon: "🌵",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 3068,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 7,
            yields: 3,
          },
        });
      },
    },

    {
      icon: "🐉🍉",
      name: "Dragon Fruit Seed",
      key: "gsDragonFruit",
      flavorText: "Exotic and magical fruit.",
      price: 50_000,
      rarity: "Mythical",
      stockLimit: 2,
      inStock: true,
      minStock: 1,
      maxStock: 4,
      stockChance: 0.022,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsDragonFruit",
          name: "Dragon Fruit Seed",
          flavorText: "Exotic and magical fruit.",
          icon: "🐉🍉",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 4287,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5,
            harvests: 17,
            yields: 6,
            baseKG: 3,
          },
        });
      },
    },
    {
      icon: "🥭",
      name: "Mango Seed",
      key: "gsMango",
      flavorText: "Sweet tropical fruit with great flavor.",
      price: 100_000,
      rarity: "Mythical",
      inStock: true,
      stockLimit: 2,
      minStock: 1,
      maxStock: 3,
      stockChance: 0.013,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsMango",
          name: "Mango Seed",
          flavorText: "Sweet tropical fruit with great flavor.",
          icon: "🥭",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 5_866,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 25,
            yields: 4,
            baseKG: 2,
          },
        });
      },
    },

    {
      icon: "🍇",
      name: "Grape Seed",
      key: "gsGrape",
      stockLimit: 1,
      flavorText: "Sweet clusters perfect for wine.",
      price: 850_000,
      rarity: "Divine",
      inStock: true,
      stockChance: 0.01,
      minStock: 1,
      maxStock: 1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsGrape",
          name: "Grape Seed",
          flavorText: "Sweet clusters perfect for wine.",
          icon: "🍇",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 7_085,
            growthTime: CROP_CONFIG.GROWTH_BASE * 1.5,
            harvests: 140,
            yields: 12,
            baseKG: 3,
          },
        });
      },
    },
    {
      icon: "🍄",
      name: "Mushroom Seed",
      key: "gsMushroom",
      flavorText: "Fungi with earthy flavor and value.",
      price: 150_000,
      stockLimit: 12,
      rarity: "Divine",
      inStock: true,
      minStock: 1,
      maxStock: 25,
      stockChance: 0.09,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsMushroom",
          name: "Mushroom Seed",
          flavorText: "Fungi with earthy flavor and value.",
          icon: "🍄",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 136_278,
            growthTime: CROP_CONFIG.GROWTH_BASE * 13.5,
            harvests: 1,
            yields: 1,
            baseKG: 5,
          },
        });
      },
    },
    {
      icon: "🌶️",
      name: "Pepper Seed",
      key: "gsPepper",
      stockLimit: 12,
      flavorText: "Spicy crop that adds heat to dishes.",
      price: 1_000_000,
      rarity: "Divine",
      inStock: true,
      stockChance: 0.06,
      minStock: 1,
      maxStock: 1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsPepper",
          name: "Pepper Seed",
          flavorText: "Spicy crop that adds heat to dishes.",
          icon: "🌶️",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 7_220,
            growthTime: CROP_CONFIG.GROWTH_BASE * 1.5,
            harvests: 200,
            yields: 12,
            baseKG: 3,
          },
        });
      },
    },
    {
      icon: "🍫",
      name: "Cacao Seed",
      key: "gsCacao",
      flavorText: "Bean for rich chocolate production.",
      price: 2_500_000,
      stockLimit: 1,
      rarity: "Divine",
      inStock: true,
      stockChance: 0.01,
      minStock: 1,
      maxStock: 1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCacao",
          name: "Cacao Seed",
          flavorText: "Bean for rich chocolate production.",
          icon: "🍫",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 10_830,
            growthTime: CROP_CONFIG.GROWTH_BASE * 0.5,
            harvests: 280,
            yields: 12,
            baseKG: 5,
          },
        });
      },
    },

    {
      icon: "🫛",
      name: "Beanstalk Seed",
      key: "gsBeanstalk",
      flavorText: "Magical vine that reaches the skies.",
      price: 10_000_000,
      rarity: "Prismatic",
      inStock: true,
      stockLimit: 1,
      minStock: 1,
      maxStock: 1,
      stockChance: 0.03,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsBeanstalk",
          name: "Beanstalk Seed",
          flavorText: "Magical vine that reaches the skies.",
          icon: "🫛",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 25_270,
            growthTime: CROP_CONFIG.GROWTH_BASE * 0.3,
            harvests: 450,
            yields: 12,
            baseKG: 8,
          },
        });
      },
    },

    {
      icon: "🏵️",
      name: "Ember Lily",
      key: "gsEmberLily",
      flavorText: "A blazing bloom that thrives in heat and glows at dusk.",
      price: 15_000_000,
      rarity: "Prismatic",
      inStock: true,
      stockLimit: 1,
      minStock: 1,
      maxStock: 1,
      stockChance: 0.02,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsEmberLily",
          name: "Ember Lily",
          flavorText: "A blazing bloom that thrives in heat and glows at dusk.",
          icon: "🏵️",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 50_138,
            growthTime: CROP_CONFIG.GROWTH_BASE * 0.2,
            harvests: 400,
            yields: 24,
            baseKG: 12,
          },
        });
      },
    },
    {
      icon: "🍏",
      name: "Sugar Apple",
      key: "gsSugarApple",
      flavorText: "Do we still need flavor texts?",
      price: 25_000_000,
      rarity: "Prismatic",
      inStock: true,
      stockLimit: 1,
      minStock: 1,
      maxStock: 1,
      stockChance: 0.02,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsSugarApple",
          name: "Sugar Apple",
          flavorText: "Do we still need flavor texts?",
          icon: "🍏",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 43_320,
            growthTime: CROP_CONFIG.GROWTH_BASE * 0.3,
            harvests: 800,
            yields: 26,
            baseKG: 6,
          },
        });
      },
    },
  ];
  export let gnpShop: GardenShopItem[] = [
    // {
    //   icon: "🐶",
    //   name: "Dog",
    //   key: "gpDog",
    //   flavorText: "Caged pet. Uncage to dig up seeds!",
    //   price: 100000,
    //   rarity: "Common",
    //   inStock: true,
    //   stockLimit: 1,
    //   stockChance: 0.8,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gpDog",
    //       name: "Dog",
    //       flavorText: "Caged pet. Use uncage to release!",
    //       icon: "🐶",
    //       type: "gardenPetCage",
    //       sellPrice: 100000,
    //       petData: {
    //         name: "Dog",
    //         collectionRate: 0.05,
    //         seedTypes: ["gsCarrot", "gsStrawberry", "gsBlueberry", "gsTomato"],
    //       },
    //     });
    //   },
    // },
    // {
    //   icon: "💦",
    //   inStock: true,
    //   stockLimit: 1,
    //   name: "Sprinkler",
    //   key: "gtSprinkler",
    //   flavorText:
    //     "Boosts growth speed and Wet mutations. You only need one of these in your inventory to work.",
    //   price: 200_000,
    //   rarity: "Common",
    //   stockChance: 0.7,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gtSprinkler",
    //       name: "Sprinkler",
    //       flavorText: "Boosts growth speed and Wet mutations.",
    //       icon: "💦",
    //       type: "gardenTool",
    //       sellPrice: 20_000,
    //       toolData: { growthMultiplier: 1.2, mutationChance: { Wet: 0.2 } },
    //     });
    //   },
    // },
    // {
    //   stockLimit: 1,
    //   icon: "🌿",
    //   name: "Fertilizer",
    //   key: "gtFertilizer",
    //   flavorText:
    //     "Increases Gold and Disco mutations. You only need one of these in your inventory to work.",
    //   price: 500_000,
    //   inStock: true,
    //   rarity: "Uncommon",
    //   stockChance: 0.5,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gtFertilizer",
    //       name: "Fertilizer",
    //       flavorText: "Increases Gold and Disco mutations.",
    //       icon: "🌿",
    //       type: "gardenTool",
    //       sellPrice: 25_000,
    //       toolData: {
    //         growthMultiplier: 1,
    //         mutationChance: { Gold: 0.1, Disco: 0.05 },
    //       },
    //     });
    //   },
    // },
    // {
    //   icon: "⭐",
    //   name: "Favorite Tool",
    //   key: "gtFavorite",
    //   inStock: true,
    //   flavorText:
    //     "Allows favoriting crops to prevent selling. You only need one of these in your inventory to work.",
    //   price: 1000,
    //   rarity: "Rare",
    //   stockChance: 0.3,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gtFavorite",
    //       name: "Favorite Tool",
    //       flavorText: "Allows favoriting crops to prevent selling.",
    //       icon: "⭐",
    //       type: "gardenTool",
    //       sellPrice: 500,
    //       toolData: { favoriteEnabled: true },
    //     });
    //   },
    // },
  ];
  export const welcomeTexts = [
    // "🌱 Welcome to Shop! Start growing today!",
    // "🌱 Hey there! Ready to plant some crops?",
    // "🌱 Browse our seeds, pets, and gears to boost your farm!",
    "🌱 Here are the seeds that are in stock.",
  ];
  export const buyTexts = [
    "🌱 What do you want to buy today?",
    "🌱 Pick a seed, pet, or gear to grow your garden!",
    "🌱 Let me know what catches your eye!",
  ];
  export const thankTexts = [
    "🌱 Thanks for shopping! Happy planting!",
    "🌱 Your garden's gonna thrive with that!",
    "🌱 Come back soon for more goodies!",
  ];
}

export namespace gardenShop {
  export let eventItems: GardenShopItem[] = [];
}

export interface GardenChoiceConfig {
  title: string;
  choices: Array<{
    txt: string;
    callback(ctx: CommandContext): any;
  }>;
  style: CommandStyle;
}
export function GardenChoice(config: GardenChoiceConfig) {
  const choiceString =
    `${UNISpectra.charm} 💬 ${config.title}` +
    `\n\n${config.choices
      .map((i, j) => `#**${j + 1}.** ${i.txt}`)
      .join("\n")}` +
    `\n\n💌 ***Reply with the number of your desired option.***`;

  return async (
    ctx: CommandContext
  ): Promise<{
    info: OutputResult;
    target: GardenChoiceConfig["choices"][number];
  }> => {
    return new Promise(async (res) => {
      const info = await ctx.output.replyStyled(choiceString, config.style);
      info.atReply(async (rep) => {
        const num = Number(rep.input.words[0]);
        if (rep.uid !== ctx.uid) {
          return;
        }
        rep.output.setStyle(config.style);
        const target = config.choices.find((_, j) => num === j + 1);
        if (!target) {
          return rep.output.replyStyled(
            `💌 **Invalid Number**: Please go back and reply a valid number!`,
            config.style
          );
        }
        await target.callback(rep);
        res({
          info,
          target,
        });
      });
    });
  };
}
