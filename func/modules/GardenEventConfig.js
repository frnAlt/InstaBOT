"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RELAPSE_MINIGAMES = exports.MAX_X_PER_ENERGY = exports.EVENT_CONFIG = void 0;
exports.PlayRelapseMinigame = PlayRelapseMinigame;
exports.shuffleWord = shuffleWord;
const GardenConfig_1 = require("@cass-modules/GardenConfig");
const GardenShop_1 = require("./GardenShop");
const unitypes_1 = require("./unitypes");
const InventoryEnhanced_1 = require("./InventoryEnhanced");
const ArielUtils_1 = require("./ArielUtils");
const Datum_1 = require("./Datum");
function insertAfterEvenIndices(arr, valueToInsert) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(arr[i]);
        if (arr.length === 1 || i % 2 === 0) {
            result.push(valueToInsert);
        }
    }
    return result;
}
exports.EVENT_CONFIG = {
    get allItems() {
        const allItems = [
            ...GardenShop_1.gardenShop.itemData,
            ...exports.EVENT_CONFIG.ALL_EVENTS.map((i) => i.shopItems ?? []).flat(),
            ...exports.EVENT_CONFIG.EVENTS_CONSTRUCTION.map((i) => i.shopItems ?? []).flat(),
        ];
        return allItems;
    },
    WEEKLY_CYCLE: 7 * 24 * 60 * 60 * 1000,
    WEATHER_CYCLE: 20 * 60 * 1000,
    // LONG ASF
    WEATHER_CYCLE_NEW: 20 * 60 * 1000,
    get WEATHERS() {
        let weathers = [...exports.EVENT_CONFIG.WEATHERS_RAW];
        if (Array.isArray(exports.EVENT_CONFIG.CURRENT_EVENT.weathers)) {
            const ww = exports.EVENT_CONFIG.CURRENT_EVENT.weathers;
            weathers.unshift(...ww);
            weathers.push(...ww);
            for (const w of ww) {
                weathers = insertAfterEvenIndices(weathers, w);
            }
        }
        weathers = insertAfterEvenIndices(weathers, {
            name: "Normal",
            icon: "🌱",
            isNoEvent: true,
            growthMultiplier: 1,
            effects: [],
        });
        return weathers;
    },
    WEATHERS_RAW: [
        {
            name: "Rain",
            icon: "🌧️",
            growthMultiplier: 1.5,
            effects: [
                {
                    mutationChance: 0.5,
                    mutationType: "Wet",
                },
            ],
        },
        {
            name: "Thunderstorm",
            icon: "⛈️",
            growthMultiplier: 1.5,
            effects: [
                {
                    mutationChance: 0.1,
                    mutationType: "Shocked",
                },
                {
                    mutationChance: 0.5,
                    mutationType: "Wet",
                },
            ],
        },
        {
            name: "Frost",
            icon: "❄️",
            growthMultiplier: 1.5,
            effects: [
                {
                    mutationChance: 0.3,
                    mutationType: "Chilled",
                },
            ],
        },
        {
            name: "Night",
            icon: "🌙",
            growthMultiplier: 1,
            effects: [
                {
                    mutationChance: 0.3,
                    mutationType: "Moonlit",
                },
            ],
        },
    ],
    ALL_EVENTS: [
        {
            icon: "🍯🐝",
            shopName2: "Honey Trading",
            shopName: "beetrade",
            key: "bizzyBees",
            name: "Bizzy Bee Event",
            weathers: [
                {
                    name: "Bee Swarm",
                    icon: "🐝",
                    growthMultiplier: 1,
                    effects: [
                        {
                            mutationChance: 0.1,
                            mutationType: "Pollinated",
                        },
                    ],
                },
            ],
            shopItems: [...GardenShop_1.gardenShop.honeyShop],
        },
        {
            icon: "💔🧩",
            shopName2: "Repoints Vending Machine",
            shopName: "vending",
            key: "relapsed",
            name: "Relapsed & Resillence",
            weathers: [
                {
                    name: "Quiet Shuffle",
                    icon: "📻🎧",
                    growthMultiplier: 0.5,
                    effects: [
                        {
                            mutationChance: 0.1,
                            mutationType: "Skipped",
                        },
                        {
                            mutationChance: 0.1,
                            mutationType: "Muted",
                        },
                        {
                            mutationChance: 0.1,
                            mutationType: "Looped",
                        },
                        {
                            mutationChance: 0.5,
                            mutationType: "Relapsed",
                        },
                    ],
                },
                {
                    name: "Echo Dusk",
                    icon: "🌒🥀",
                    growthMultiplier: 0.6,
                    effects: [
                        {
                            mutationChance: 0.12,
                            mutationType: "Ghosted",
                        },
                        {
                            mutationChance: 0.08,
                            mutationType: "Desynced",
                        },
                        {
                            mutationChance: 0.01,
                            mutationType: "Wilted",
                        },
                    ],
                },
            ],
            shopItems: [
                {
                    icon: "🎴💭",
                    name: "Reverie Bloom Pack",
                    key: "pReverieBloom",
                    flavorText: "For those who plant with memories, not plans.",
                    price: 934,
                    rarity: "Uncommon",
                    maxStock: 5,
                    minStock: 1,
                    priceType: "cll:repoints",
                    stockLimit: 1,
                    inStock: true,
                    stockChance: 1,
                    isEventItem: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "pReverieBloom",
                            name: "Reverie Bloom Pack",
                            flavorText: "For those who plant with memories, not plans.",
                            icon: "🎴💭",
                            type: "roulette_pack",
                            sellPrice: 3,
                            treasureKey: "randomGrouped_pReverieBloom",
                        });
                    },
                },
                {
                    icon: "👻🌺",
                    name: "Multong Orchid Seed",
                    key: "gsMultongOrchid",
                    flavorText: "A spectral orchid with misty petals. Haunts the garden with fading memories.",
                    price: 0,
                    pack: "pReverieBloom",
                    rarity: "Rare",
                    inStock: false,
                    priceType: "cll:repoints",
                    stockLimit: 0,
                    minStock: 0,
                    maxStock: 0,
                    stockChance: 0,
                    packChance: 0.03,
                    isEventItem: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsMultongOrchid",
                            name: "Multong Orchid Seed",
                            flavorText: "A spectral orchid with misty petals. Haunts the garden with fading memories.",
                            icon: "👻🌺",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 99_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 5.1,
                                harvests: 60,
                                yields: 12,
                                baseKG: 0,
                            },
                        });
                    },
                },
                {
                    icon: "🍀✨",
                    name: "3bok Seed",
                    key: "gs3bok",
                    flavorText: "Sprouts to the rhythm of a distant heartbeat. Fragile, but steady.",
                    price: 0,
                    rarity: "Rare",
                    inStock: false,
                    priceType: "cll:repoints",
                    stockLimit: 0,
                    minStock: 0,
                    maxStock: 0,
                    stockChance: 0,
                    pack: "pReverieBloom",
                    packChance: 0.4,
                    isEventItem: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gs3bok",
                            name: "3bok Seed",
                            flavorText: "Sprouts to the rhythm of a distant heartbeat. Fragile, but steady.",
                            icon: "🍀✨",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 10_720,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 5.0,
                                harvests: 60,
                                yields: 1,
                                baseKG: 0,
                            },
                        });
                    },
                },
                {
                    icon: "🪻🪷",
                    name: "Isa Langvender Seed",
                    key: "gsIsaLangvender",
                    flavorText: "A unique lavender with a singular bloom. A tribute to fleeting affection.",
                    price: 0,
                    rarity: "Mythical",
                    inStock: false,
                    priceType: "cll:repoints",
                    stockLimit: 0,
                    minStock: 0,
                    maxStock: 0,
                    stockChance: 0,
                    packChance: 0.1,
                    pack: "pReverieBloom",
                    isEventItem: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsIsaLangvender",
                            name: "Isa Langvender Seed",
                            flavorText: "A unique lavender with a singular bloom. A tribute to fleeting affection.",
                            icon: "🪻🪷",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 136_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 10.3,
                                harvests: 1,
                                yields: 1,
                                baseKG: 0,
                            },
                        });
                    },
                },
                {
                    icon: "🏵️🥀",
                    name: "December Avenlily Seed",
                    key: "gsDecemberAvenlily",
                    flavorText: "A winter lily that grows best in silence. Blooms with a chill stillness.",
                    price: 0,
                    rarity: "Legendary",
                    inStock: false,
                    priceType: "cll:repoints",
                    stockLimit: 0,
                    minStock: 0,
                    maxStock: 0,
                    pack: "pReverieBloom",
                    packChance: 0.3,
                    stockChance: 0,
                    isEventItem: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsDecemberAvenlily",
                            name: "December Avenlily Seed",
                            flavorText: "A winter lily that grows best in silence. Blooms with a chill stillness.",
                            icon: "🏵️🥀",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 78_800,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3.2,
                                harvests: 60,
                                yields: 1,
                                baseKG: 0,
                            },
                        });
                    },
                },
                {
                    icon: "🎴👑🥫",
                    name: "A-queen Can-alang Seed Pack",
                    key: "pAqueenCan",
                    flavorText: "Ang dinarasal sa araw-araw.",
                    price: 0,
                    rarity: "Mythical",
                    maxStock: 0,
                    minStock: 0,
                    priceType: "cll:repoints",
                    stockLimit: 0,
                    inStock: false,
                    pack: "pReverieBloom",
                    packChance: 0.2,
                    stockChance: 0,
                    isEventItem: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "pAqueenCan",
                            name: "A-queen Can-alang Seed Pack",
                            flavorText: "Ang dinarasal sa araw-araw.",
                            icon: "🎴👑🥫",
                            type: "roulette_pack",
                            sellPrice: 3,
                            treasureKey: "randomGrouped_pAqueenCan",
                        });
                    },
                },
                {
                    icon: "🍂",
                    name: "Drymoss Seed",
                    key: "gsDrymoss",
                    flavorText: "A plain, fibrous plant with minimal value. Often used as compost.",
                    price: 0,
                    rarity: "Common",
                    inStock: false,
                    priceType: "cll:repoints",
                    stockLimit: 0,
                    minStock: 0,
                    maxStock: 0,
                    stockChance: 0,
                    pack: "pAqueenCan",
                    packChance: 0.7,
                    isEventItem: false,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsDrymoss",
                            name: "Drymoss Seed",
                            flavorText: "A plain, fibrous plant with minimal value. Often used as compost.",
                            icon: "🍂",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 2_300,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3.5,
                                harvests: 100,
                                yields: 5,
                                baseKG: 0,
                            },
                        });
                    },
                },
                {
                    icon: "🫐🎶",
                    name: "Di na Muliberry Seed",
                    key: "gsDinaMuliberry",
                    flavorText: "A fruit that ripens only once in its lifetime, known to stain deeply with memories of the past.",
                    price: 0,
                    rarity: "Legendary",
                    inStock: false,
                    priceType: "cll:repoints",
                    stockLimit: 0,
                    minStock: 0,
                    pack: "pAqueenCan",
                    packChance: 0.4,
                    maxStock: 0,
                    stockChance: 0,
                    isEventItem: false,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsDinaMuliberry",
                            name: "Di na Muliberry Seed",
                            flavorText: "A fruit that ripens only once in its lifetime, known to stain deeply with memories of the past.",
                            icon: "🫐🎶",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 66_400,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 5.4,
                                harvests: 1,
                                yields: 6,
                                baseKG: 6,
                            },
                        });
                    },
                },
                {
                    icon: "🌿🎤",
                    name: "Ben&Petal Seed",
                    key: "gsBenNPetal",
                    flavorText: "Two flowers always growing side-by-side, their petals harmonizing in color and rhythm.",
                    price: 0,
                    rarity: "Mythical",
                    inStock: false,
                    priceType: "cll:repoints",
                    stockLimit: 0,
                    minStock: 0,
                    pack: "pAqueenCan",
                    packChance: 0.3,
                    maxStock: 0,
                    stockChance: 0,
                    isEventItem: false,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsBenNPetal",
                            name: "Ben&Petal Seed",
                            flavorText: "Two flowers always growing side-by-side, their petals harmonizing in color and rhythm.",
                            icon: "🌿🎤",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 59_900,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 5.3,
                                harvests: 70,
                                yields: 7,
                                baseKG: 4,
                            },
                        });
                    },
                },
                {
                    icon: "🌱💔",
                    name: "Miss-stalk Seed",
                    key: "gsMissStalk",
                    flavorText: "A rare plant whose growth stutters but blooms unexpectedly, making each harvest precious.",
                    price: 0,
                    rarity: "Rare",
                    inStock: false,
                    priceType: "cll:repoints",
                    stockLimit: 0,
                    minStock: 0,
                    pack: "pAqueenCan",
                    packChance: 0.1,
                    maxStock: 0,
                    stockChance: 0,
                    isEventItem: false,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsMissStalk",
                            name: "Miss-stalk Seed",
                            flavorText: "A rare plant whose growth stutters but blooms unexpectedly, making each harvest precious.",
                            icon: "🌱💔",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 149_200,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 5.4,
                                harvests: 50,
                                yields: 5,
                                baseKG: 3,
                            },
                        });
                    },
                },
                {
                    icon: "🪴💔",
                    name: "Halaman na Walang Sagot",
                    key: "gsWalangSagot",
                    flavorText: "No matter how many times you speak, it never replies. Yet it grows as if it remembers.",
                    price: 200,
                    rarity: "Uncommon",
                    inStock: true,
                    priceType: "cll:repoints",
                    stockLimit: 5,
                    minStock: 1,
                    maxStock: 5,
                    stockChance: 1,
                    isEventItem: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsWalangSagot",
                            name: "Halaman na Walang Sagot",
                            flavorText: "No matter how many times you speak, it never replies. Yet it grows as if it remembers.",
                            icon: "🪴💔",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 3_900,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3.2,
                                harvests: 80,
                                yields: 1,
                                baseKG: 0,
                            },
                        });
                    },
                },
                {
                    icon: "🍃📼",
                    name: "Relapsflower Seed",
                    key: "gsRelapsflower",
                    flavorText: "It blossoms in cycles, each bloom forgetting the last. A loop in petal form.",
                    price: 170,
                    rarity: "Common",
                    inStock: true,
                    priceType: "cll:repoints",
                    stockLimit: 6,
                    minStock: 1,
                    maxStock: 6,
                    stockChance: 1,
                    isEventItem: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsRelapsflower",
                            name: "Relapsflower Seed",
                            flavorText: "It blossoms in cycles, each bloom forgetting the last. A loop in petal form.",
                            icon: "🍃📼",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 3_100,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3.4,
                                harvests: 60,
                                yields: 2,
                                baseKG: 0,
                            },
                        });
                    },
                },
                {
                    icon: "🌾🪞",
                    name: "Tanglad Lamang Seed",
                    key: "gsTangladLamang",
                    flavorText: "Sways gently, waiting for a gaze that never returns. Scents the wind with longing.",
                    price: 160,
                    rarity: "Common",
                    inStock: true,
                    priceType: "cll:repoints",
                    stockLimit: 5,
                    minStock: 1,
                    maxStock: 5,
                    stockChance: 1,
                    isEventItem: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsTangladLamang",
                            name: "Tanglad Lamang Seed",
                            flavorText: "Sways gently, waiting for a gaze that never returns. Scents the wind with longing.",
                            icon: "🌾🪞",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 3_400,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3.0,
                                harvests: 70,
                                yields: 2,
                                baseKG: 0,
                            },
                        });
                    },
                },
            ],
        },
    ],
    get CURRENT_EVENT() {
        if (process.env.G_EVENT) {
            return exports.EVENT_CONFIG.ALL_EVENTS.find((i) => i.key === process.env.G_EVENT);
        }
        const relapsed = exports.EVENT_CONFIG.ALL_EVENTS.find((i) => i.key === "relapsed");
        if (relapsed && (0, unitypes_1.isInTimeRange)("10pm", "3am")) {
            return relapsed;
        }
        const bees = exports.EVENT_CONFIG.ALL_EVENTS.find((i) => i.key === "bizzyBees");
        if (bees) {
            return bees;
        }
        return {
            name: "No Event",
            icon: "🌱",
            isNoEvent: true,
            effect: {
                mutationChance: 0.1,
                growthMultiplier: 1,
            },
            key: "noEvent",
            weathers: [],
            shopItems: [],
        };
    },
    EVENTS_CONSTRUCTION: [
        {
            name: "No Event",
            icon: "🌱",
            isNoEvent: true,
            effect: {
                mutationChance: 0.1,
                growthMultiplier: 1,
            },
            shopItems: [],
        },
        {
            name: "Cherry Blossom Event",
            icon: "🌸🩷",
            shopName: "Blossom Seed Shop",
            shopName2: "Cherry Market",
            shopAlias: ["cherryshop", "blossom"],
            effect: {
                mutationChance: 0.3,
                growthMultiplier: 1.4,
                mutationType: "Bloom",
            },
            shopItems: [
                {
                    icon: "🌷",
                    name: "Cherry Tulip Seed",
                    key: "gsCherryTulip",
                    flavorText: "A bright, cup-shaped flower with smooth petals and a tall, slender stem, often seen in vibrant spring colors like red, yellow, and pink.",
                    price: 10_500,
                    rarity: "Common",
                    stockLimit: 25,
                    stockChance: 1.0,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsCherryTulip",
                            name: "Cherry Tulip Seed",
                            flavorText: "Delicate pink or white flowers that bloom in clusters on tree branches, signaling the arrival of spring.",
                            icon: "🌷",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 300,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 1.5,
                                harvests: 50,
                                yields: 2,
                            },
                        });
                    },
                },
                {
                    icon: "🪷",
                    name: "Cherry Lotus Seed",
                    key: "gsCherryLotus",
                    flavorText: "A large, round flower with smooth petals that floats gracefully on the water's surface.",
                    price: 30_000,
                    rarity: "Uncommon",
                    stockLimit: 20,
                    stockChance: 0.9,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsCherryLotus",
                            name: "Cherry Lotus Seed",
                            flavorText: "A water flower with broad petals and a central seed pod, often seen resting on lily pads.",
                            icon: "🪷",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 650,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 2.5,
                                harvests: 50,
                                yields: 2,
                            },
                        });
                    },
                },
                {
                    icon: "🌺",
                    name: "Blossom Hibiscus Seed",
                    key: "gsBlossomHibiscus",
                    flavorText: "A bold, tropical flower with large trumpet-shaped petals and a long, protruding stamen.",
                    price: 100_000,
                    rarity: "Rare",
                    stockLimit: 5,
                    stockChance: 0.7,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsBlossomHibiscus",
                            name: "Blossom Hibiscus Seed",
                            flavorText: "A vibrant bloom with wide, delicate petals and a striking central column, often found in warm, sunny places.",
                            icon: "🌺",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 2_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3.5,
                                harvests: 60,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🏵️",
                    name: "Rosette Seed",
                    key: "gsRosette",
                    flavorText: "A circular floral design with layered petals, often used as a decorative or celebratory symbol.",
                    price: 600_000,
                    rarity: "Legendary",
                    stockLimit: 7,
                    stockChance: 0.2,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsRosette",
                            name: "Rosette Seed",
                            flavorText: "A stylized bloom with symmetrical, rounded petals arranged in a neat, spiral-like pattern.",
                            icon: "🏵️",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 8_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 5,
                                harvests: 80,
                                yields: 3,
                            },
                        });
                    },
                },
                {
                    icon: "💮",
                    name: "White Flower Seed",
                    key: "gsWhiteFlower",
                    flavorText: "A soft pink blossom with delicate petals in a circular bloom.",
                    price: 4_000_000,
                    rarity: "Mythical",
                    stockLimit: 5,
                    stockChance: 0.07,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsWhiteFlower",
                            name: "White Flower Seed",
                            flavorText: "A floral symbol with a gentle glow, styled like a perfect seal of approval.",
                            icon: "💮",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 50_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 10,
                                harvests: 100,
                                yields: 7,
                            },
                        });
                    },
                },
                {
                    icon: "🌸🩷",
                    name: "Jane Blossom Seed",
                    key: "gsJaneBlossom",
                    flavorText: "A delicate flower with soft pink petals that bloom in clusters on tree branches.",
                    price: 9_000_000,
                    rarity: "Divine",
                    stockLimit: 3,
                    stockChance: 0.05,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsJaneBlossom",
                            name: "Jane Blossom Seed",
                            flavorText: "Soft petals like pale confetti cover the branches, blooming all at once and falling just as quickly—a quiet celebration of spring’s gentle touch.",
                            icon: "🌸🩷",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 100_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 15,
                                harvests: 100,
                                yields: 13,
                            },
                        });
                    },
                },
            ],
        },
        {
            name: "Relapse Event",
            icon: "🥀💔",
            timeStart: (12 + 10) * 60 * 60 * 1000,
            timeEnd: 4 * 60 * 60 * 1000,
            shopName: "relapseshop",
            shopName2: "Batak Mag Relapse Shop",
            shopAlias: ["rshop", "relapse", "rsh"],
            effect: {
                mutationChance: 0.25,
                growthMultiplier: 2.5,
                mutationType: "Relapsed",
            },
            shopItems: [
                {
                    icon: "🌸",
                    name: "Ben&Petal",
                    key: "gsBenPetal",
                    flavorText: "A delicate flower duo that blooms in harmony.",
                    price: 2500,
                    rarity: "Common",
                    stockLimit: 20,
                    stockChance: 1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsBenPetal",
                            name: "Ben&Petal",
                            flavorText: "A delicate flower duo that blooms in harmony.",
                            icon: "🌸",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 200,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 2,
                                harvests: 30,
                                yields: 2,
                            },
                        });
                    },
                },
                {
                    icon: "🍇",
                    name: "Di na Muliberry",
                    key: "gsMuliberry",
                    flavorText: "A bittersweet berry that lingers on the vine.",
                    price: 5000,
                    stockLimit: 20,
                    rarity: "Uncommon",
                    stockChance: 1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsMuliberry",
                            name: "Di na Muliberry",
                            flavorText: "A bittersweet berry that lingers on the vine.",
                            icon: "🍇",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 200,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3,
                                harvests: 40,
                                yields: 7,
                            },
                        });
                    },
                },
                {
                    icon: "🌿",
                    name: "Magbalikweed",
                    key: "gsMagbalikweed",
                    flavorText: "A resilient herb that always finds its way back.",
                    price: 10_000,
                    rarity: "Uncommon",
                    stockLimit: 20,
                    stockChance: 1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsMagbalikweed",
                            name: "Magbalikweed",
                            flavorText: "A resilient herb that always finds its way back.",
                            icon: "🌿",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 500,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 4,
                                harvests: 50,
                                yields: 9,
                            },
                        });
                    },
                },
                {
                    icon: "🌺",
                    name: "Pagsamunngo",
                    key: "gsPagsamunngo",
                    stockLimit: 20,
                    flavorText: "A vibrant flower symbolizing reunion.",
                    price: 50_000,
                    rarity: "Rare",
                    stockChance: 0.5,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsPagsamunngo",
                            name: "Pagsamunngo",
                            flavorText: "A vibrant flower symbolizing reunion.",
                            icon: "🌺",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 1_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 5,
                                harvests: 80,
                                yields: 9,
                            },
                        });
                    },
                },
                {
                    icon: "🌱",
                    name: "Binhi mo lang ako",
                    key: "gsBinhi",
                    flavorText: "A humble seed with untapped potential.",
                    price: 100_000,
                    stockLimit: 12,
                    rarity: "Rare",
                    stockChance: 0.35,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsBinhi",
                            name: "Binhi mo lang ako",
                            flavorText: "A humble seed with untapped potential.",
                            icon: "🌱",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 2_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 6,
                                harvests: 80,
                                yields: 9,
                            },
                        });
                    },
                },
                {
                    icon: "🍃",
                    name: "Kathang Leafip",
                    key: "gsLeafip",
                    stockLimit: 12,
                    flavorText: "A mythical leaf woven from stories.",
                    price: 250_000,
                    rarity: "Legendary",
                    stockChance: 0.5,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsLeafip",
                            name: "Kathang Leafip",
                            flavorText: "A mythical leaf woven from stories.",
                            icon: "🍃",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 5_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 7,
                                harvests: 80,
                                yields: 12,
                            },
                        });
                    },
                },
                {
                    icon: "🧅",
                    name: "Allium Too Well",
                    key: "gsAllium",
                    flavorText: "An onion that brings tears of nostalgia.",
                    price: 500_000,
                    stockLimit: 5,
                    rarity: "Legendary",
                    stockChance: 0.25,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsAllium",
                            name: "Allium Too Well",
                            flavorText: "An onion that brings tears of nostalgia.",
                            icon: "🧅",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 400_100,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 12,
                                harvests: 1,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🌷",
                    name: "Lavendeja Vu",
                    key: "gsLavendeja",
                    flavorText: "A lavender with a hauntingly familiar scent.",
                    price: 1_000_000,
                    stockLimit: 9,
                    rarity: "Legendary",
                    stockChance: 0.09,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsLavendeja",
                            name: "Lavendeja Vu",
                            flavorText: "A lavender with a hauntingly familiar scent.",
                            icon: "🌷",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 10_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 9,
                                harvests: 180,
                                yields: 15,
                            },
                        });
                    },
                },
                {
                    icon: "☘️",
                    name: "When I was your clover",
                    key: "gsClover",
                    stockLimit: 20,
                    flavorText: "A four-leaf clover of past promises.",
                    price: 2_500_000,
                    rarity: "Mythical",
                    stockChance: 0.07,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsClover",
                            name: "When I was your clover",
                            flavorText: "A four-leaf clover of past promises.",
                            icon: "☘️",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 50_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 10,
                                harvests: 90,
                                yields: 9,
                            },
                        });
                    },
                },
                {
                    icon: "🌿✨",
                    name: "Enchanmint",
                    key: "gsEnchanmint",
                    stockLimit: 5,
                    flavorText: "A magical mint that captivates the senses.",
                    price: 5_000_000,
                    rarity: "Mythical",
                    stockChance: 0.08,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsEnchanmint",
                            name: "Enchanmint",
                            flavorText: "A magical mint that captivates the senses.",
                            icon: "🌿✨",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 50_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 11,
                                harvests: 250,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🌱",
                    name: "Kathang Sitaw",
                    key: "gsSitaw",
                    stockLimit: 12,
                    flavorText: "A string bean spun from tales of fate.",
                    price: 10_000_000,
                    rarity: "Divine",
                    stockChance: 0.08,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsSitaw",
                            name: "Kathang Sitaw",
                            flavorText: "A string bean spun from tales of fate.",
                            icon: "🌱",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 50_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 12,
                                harvests: 600,
                                yields: 20,
                            },
                        });
                    },
                },
                {
                    icon: "🌸💫",
                    name: "Pinagtagpo, Pero Hindi Tinanamin",
                    key: "gsPinagtagpo",
                    flavorText: "The rarest bloom of destined but unplanted love.",
                    price: 50_000_000,
                    rarity: "Divine",
                    stockLimit: 5,
                    stockChance: 0.08,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsPinagtagpo",
                            name: "Pinagtagpo, Pero Hindi Tinanamin",
                            flavorText: "The rarest bloom of destined but unplanted love.",
                            icon: "🌸💫",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 100_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 15,
                                harvests: 1_600,
                                yields: 20,
                            },
                        });
                    },
                },
            ],
        },
        {
            name: "Frost",
            icon: "❄️",
            effect: {
                mutationChance: 0.3,
                growthMultiplier: 0.9,
                mutationType: "Chilled",
            },
            shopItems: [],
        },
        {
            name: "Astral Festival",
            icon: "✨🌌",
            shopName: "astralshop",
            shopName2: "Stellar Caravan Shop",
            shopAlias: ["ash", "astral", "starshop"],
            effect: {
                mutationChance: 0.35,
                growthMultiplier: 1.4,
                mutationType: "Astral",
            },
            shopItems: [
                {
                    icon: "🌠",
                    name: "Stellar Sprout Seed",
                    key: "gsStellarSprout",
                    flavorText: "A glowing sprout born under a cosmic sky.",
                    price: 5_000,
                    rarity: "Common",
                    stockLimit: 20,
                    stockChance: 1.0,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsStellarSprout",
                            name: "Stellar Sprout Seed",
                            flavorText: "A glowing sprout born under a cosmic sky.",
                            icon: "🌠",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 40,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 8,
                                harvests: 200,
                                yields: 12,
                            },
                        });
                    },
                },
                {
                    icon: "🌟",
                    name: "Cosmo Petal Seed",
                    key: "gsCosmoPetal",
                    flavorText: "A radiant flower that mirrors distant galaxies.",
                    price: 15_000,
                    rarity: "Uncommon",
                    stockLimit: 18,
                    stockChance: 1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsCosmoPetal",
                            name: "Cosmo Petal Seed",
                            flavorText: "A radiant flower that mirrors distant galaxies.",
                            icon: "🌟",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 120,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 8,
                                harvests: 200,
                                yields: 2,
                            },
                        });
                    },
                },
                {
                    icon: "🪐",
                    name: "Nebula Fruit Seed",
                    key: "gsNebulaFruit",
                    flavorText: "A juicy fruit infused with stardust.",
                    price: 50_000,
                    rarity: "Rare",
                    stockLimit: 15,
                    stockChance: 0.6,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsNebulaFruit",
                            name: "Nebula Fruit Seed",
                            flavorText: "A juicy fruit infused with stardust.",
                            icon: "🪐",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 400,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 8,
                                harvests: 200,
                                yields: 5,
                            },
                        });
                    },
                },
                {
                    icon: "💫",
                    name: "Aether Bloom Seed",
                    key: "gsAetherBloom",
                    flavorText: "A rare flower that pulses with cosmic energy.",
                    price: 200_000,
                    rarity: "Legendary",
                    stockLimit: 10,
                    stockChance: 0.3,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsAetherBloom",
                            name: "Aether Bloom Seed",
                            flavorText: "A rare flower that pulses with cosmic energy.",
                            icon: "💫",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 1_500,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 8,
                                harvests: 20,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🌌",
                    name: "Starweave Vine Seed",
                    key: "gsStarweaveVine",
                    flavorText: "A divine vine that connects the stars.",
                    price: 1_000_000,
                    rarity: "Mythical",
                    stockLimit: 5,
                    stockChance: 0.05,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsStarweaveVine",
                            name: "Starweave Vine Seed",
                            flavorText: "A divine vine that connects the stars.",
                            icon: "🌌",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 8_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 10,
                                harvests: 200,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "☄️",
                    name: "Comet Shard Seed",
                    key: "gsCometShard",
                    flavorText: "A celestial seed that blazes with astral power.",
                    price: 5_000_000,
                    rarity: "Divine",
                    stockLimit: 3,
                    stockChance: 0.02,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsCometShard",
                            name: "Comet Shard Seed",
                            flavorText: "A celestial seed that blazes with astral power.",
                            icon: "☄️",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 4_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 12,
                                harvests: 2000,
                                yields: 20,
                            },
                        });
                    },
                },
                {
                    icon: "🦋",
                    name: "Stellar Butterfly",
                    key: "gpStellarButterfly",
                    flavorText: "A cosmic pet that flutters through starlight.",
                    price: 20_000_000,
                    rarity: "Rare",
                    stockLimit: 1,
                    stockChance: 0.3,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpStellarButterfly",
                            name: "Stellar Butterfly",
                            flavorText: "Caged pet. Uncage to dig up Astral seeds!",
                            icon: "🦋",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Stellar Butterfly",
                                collectionRate: 0.15,
                                seedTypes: ["gsStellarSprout", "gsCosmoPetal", "gsNebulaFruit"],
                            },
                        });
                    },
                },
                {
                    icon: "🦅",
                    name: "Astral Hawk",
                    key: "gpAstralHawk",
                    flavorText: "A majestic pet soaring through the cosmos.",
                    price: 30_500_000,
                    rarity: "Legendary",
                    stockLimit: 1,
                    stockChance: 0.1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpAstralHawk",
                            name: "Astral Hawk",
                            flavorText: "Caged pet. Uncage to dig up Astral seeds!",
                            icon: "🦅",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Astral Hawk",
                                collectionRate: 0.2,
                                seedTypes: ["gsAetherBloom", "gsStarweaveVine"],
                            },
                        });
                    },
                },
                {
                    icon: "🦁🌌",
                    name: "Cosmic Lion",
                    key: "gpCosmicLion",
                    flavorText: "A divine pet that roars with stellar might.",
                    price: 60_000_000,
                    rarity: "Mythical",
                    stockLimit: 1,
                    stockChance: 0.1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpCosmicLion",
                            name: "Cosmic Lion",
                            flavorText: "Caged pet. Uncage to dig up Astral seeds!",
                            icon: "🦁🌌",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Cosmic Lion",
                                collectionRate: 0.25,
                                seedTypes: ["gsStarweaveVine", "gsCometShard"],
                            },
                        });
                    },
                },
                {
                    icon: "🔭",
                    name: "Astral Lens",
                    key: "gtAstralLens",
                    flavorText: "Enhances Astral mutations for cosmic crops.",
                    price: 10_500_000,
                    rarity: "Rare",
                    stockLimit: 1,
                    stockChance: 0.4,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gtAstralLens",
                            name: "Astral Lens",
                            flavorText: "Enhances Astral mutations for cosmic crops.",
                            icon: "🔭",
                            type: "gardenTool",
                            sellPrice: 1,
                            toolData: {
                                growthMultiplier: 1.3,
                                mutationChance: { Astral: 0.3 },
                            },
                        });
                    },
                },
                {
                    icon: "✨",
                    name: "Starlight Dust",
                    key: "gtStarlightDust",
                    flavorText: "Boosts growth speed for crops.",
                    price: 5_000_000,
                    rarity: "Uncommon",
                    stockLimit: 5,
                    stockChance: 0.6,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gtStarlightDust",
                            name: "Starlight Dust",
                            flavorText: "Boosts growth speed for crops.",
                            icon: "✨",
                            type: "gardenTool",
                            sellPrice: 1,
                            toolData: {
                                growthMultiplier: 1.5,
                            },
                        });
                    },
                },
            ],
        },
        {
            name: "Thunderstorm",
            icon: "⛈️",
            effect: {
                mutationChance: 0.1,
                growthMultiplier: 1.5,
                mutationType: "Shocked",
            },
            shopItems: [],
        },
        {
            name: "Easter Event 2025",
            icon: "🐣",
            shopName: "eastershop",
            shopName2: "Poppy's Easter Shop",
            shopAlias: ["easter", "eash"],
            effect: {
                mutationChance: 0.3,
                growthMultiplier: 1.2,
                mutationType: "Chocolate",
            },
            shopItems: [
                {
                    icon: "🍫",
                    name: "Chocolate Carrot Seed",
                    key: "gsChocoCarrot",
                    flavorText: "A sweet carrot from the Easter Event!",
                    price: 10_000,
                    stockLimit: 20,
                    rarity: "Common",
                    stockChance: 1.0,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsChocoCarrot",
                            name: "Chocolate Carrot Seed",
                            flavorText: "A sweet carrot from the Easter Event.",
                            icon: "🍫",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 9_928,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 0.5,
                                harvests: 1,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🍭",
                    name: "Red Lollipop Seed",
                    key: "gsRedLollipop",
                    flavorText: "A sugary treat from the Easter Event.",
                    price: 45_000,
                    rarity: "Uncommon",
                    stockLimit: 18,
                    stockChance: 0.5,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsRedLollipop",
                            name: "Red Lollipop Seed",
                            flavorText: "A sugary treat from the Easter Event.",
                            icon: "🍭",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 45_125,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 0.4,
                                harvests: 1,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🌻",
                    name: "Candy Sunflower Seed",
                    key: "gsCandySunflower",
                    flavorText: "A radiant flower from the Easter Event.",
                    price: 75_000,
                    stockLimit: 14,
                    rarity: "Rare",
                    stockChance: 0.5,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsCandySunflower",
                            name: "Candy Sunflower Seed",
                            flavorText: "A radiant flower from the Easter Event.",
                            icon: "🌻",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 72_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 0.3,
                                harvests: 1,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🥚",
                    name: "Easter Egg Seed",
                    key: "gsEasterEgg",
                    flavorText: "A festive egg from the Easter Event.",
                    price: 500_000,
                    rarity: "Legendary",
                    stockChance: 0.3,
                    stockLimit: 7,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsEasterEgg",
                            name: "Easter Egg Seed",
                            flavorText: "A festive egg from the Easter Event.",
                            icon: "🥚",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 2_256,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3,
                                harvests: 300,
                                yields: 5,
                            },
                        });
                    },
                },
                {
                    icon: "🌸",
                    name: "Candy Blossom Seed",
                    key: "gsCandyBlossom",
                    flavorText: "A divine bloom from the Easter Event.",
                    price: 10_000_000,
                    rarity: "Divine",
                    stockLimit: 5,
                    stockChance: 0.04,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsCandyBlossom",
                            name: "Candy Blossom Seed",
                            flavorText: "A divine bloom from the Easter Event.",
                            icon: "🌸",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 60_250,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 0.15,
                                harvests: 400,
                                yields: 24,
                            },
                        });
                    },
                },
                {
                    icon: "🍫💦",
                    name: "Chocolate Sprinkler",
                    key: "gtChocoSprinkler",
                    flavorText: "Boosts Chocolate mutations for Easter crops.",
                    price: 1_000_000,
                    stockLimit: 1,
                    rarity: "Rare",
                    stockChance: 0.4,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gtChocoSprinkler",
                            name: "Chocolate Sprinkler",
                            flavorText: "Boosts Chocolate mutations for Easter crops.",
                            icon: "🍫💦",
                            type: "gardenTool",
                            sellPrice: 1,
                            toolData: {
                                growthMultiplier: 1.2,
                                mutationChance: { Chocolate: 0.3 },
                            },
                        });
                    },
                },
            ],
        },
        {
            name: "Angry Plant Event",
            icon: "🌿😣",
            shopName2: "Angry Shop",
            shopName: "angryshop",
            shopAlias: ["ashop", "angshop", "angry"],
            effect: {
                growthMultiplier: 1.1,
            },
            shopItems: [
                // {
                //   icon: "🪷",
                //   name: "Lotus Seed",
                //   key: "gsLotus",
                //   flavorText: "A rare seed available during Angry Plant Event!",
                //   price: 500,
                //   rarity: "Divine",
                //   stockChance: 0.1,
                //   inStock: true,
                //   onPurchase({ moneySet }) {
                //     moneySet.inventory.push({
                //       key: "gsLotus",
                //       name: "Lotus Seed",
                //       flavorText: "A rare seed from Angry Plant Event.",
                //       icon: "🪷",
                //       type: "gardenSeed",
                //       sellPrice: 250,
                //       cropData: {
                //         baseValue: 1000,
                //         growthTime: CROP_CONFIG.GROWTH_BASE * 3,
                //         harvests: 1,
                //       },
                //     });
                //   },
                // },
                {
                    icon: "🍒",
                    name: "Cranberry Seed",
                    key: "gsCranberry",
                    flavorText: "A tart fruit from the Angry Plant Event.",
                    price: 3500,
                    rarity: "Legendary",
                    stockChance: 0.3,
                    inStock: true,
                    stockLimit: 20,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsCranberry",
                            name: "Cranberry Seed",
                            flavorText: "A tart fruit from the Angry Plant Event.",
                            icon: "🍒",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 1_805,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3.5,
                                harvests: 3,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🥭",
                    name: "Durian Seed",
                    key: "gsDurian",
                    flavorText: "A pungent fruit from the Angry Plant Event.",
                    price: 3000,
                    rarity: "Legendary",
                    stockLimit: 20,
                    stockChance: 0.25,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsDurian",
                            name: "Durian Seed",
                            flavorText: "A pungent fruit from the Angry Plant Event.",
                            icon: "🥭",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 4_513,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 9.5,
                                harvests: 1,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🍆",
                    name: "Eggplant Seed",
                    key: "gsEggplant",
                    flavorText: "A versatile veggie from the Angry Plant Event.",
                    price: 5000,
                    stockLimit: 7,
                    rarity: "Mythical",
                    stockChance: 0.2,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsEggplant",
                            name: "Eggplant Seed",
                            flavorText: "A versatile veggie from the Angry Plant Event.",
                            icon: "🍆",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 6_769,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 4,
                                harvests: 1,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🪷",
                    name: "Lotus Seed",
                    key: "gsLotus",
                    flavorText: "A serene flower from the Angry Plant Event.",
                    price: 60_000,
                    stockLimit: 12,
                    rarity: "Divine",
                    stockChance: 0.15,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsLotus",
                            name: "Lotus Seed",
                            flavorText: "A serene flower from the Angry Plant Event.",
                            icon: "🪷",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 15_343,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 22,
                                harvests: 10,
                                yields: 2,
                            },
                        });
                    },
                },
                {
                    icon: "🪴",
                    name: "Venus Fly Trap Seed",
                    key: "gsVenusFlyTrap",
                    flavorText: "A carnivorous plant from the Angry Plant Event.",
                    price: 6500,
                    stockLimit: 12,
                    rarity: "Divine",
                    stockChance: 0.1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsVenusFlyTrap",
                            name: "Venus Fly Trap Seed",
                            flavorText: "A carnivorous plant from the Angry Plant Event.",
                            icon: "🪴",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 17_000,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 20.5,
                                harvests: 1,
                                yields: 1,
                            },
                        });
                    },
                },
                // {
                //   icon: "🌱",
                //   name: "Basic Seed Pack",
                //   key: "gtBasicSeedPack",
                //   flavorText: "A pack of basic seeds from the Angry Plant Event.",
                //   price: 500,
                //   rarity: "Common",
                //   stockChance: 0.8,
                //   inStock: true,
                //   onPurchase({ moneySet }) {
                //     moneySet.inventory.push({
                //       key: "gtBasicSeedPack",
                //       name: "Basic Seed Pack",
                //       flavorText: "A pack of basic seeds from the Angry Plant Event.",
                //       icon: "🌱",
                //       type: "gardenTool",
                //       sellPrice: 250,
                //       toolData: {
                //         seedTypes: ["gsCarrot", "gsStrawberry", "gsBlueberry"],
                //       },
                //     });
                //   },
                // },
                // {
                //   icon: "🌟",
                //   name: "Premium Seed Pack",
                //   key: "gtPremiumSeedPack",
                //   flavorText:
                //     "A pack of premium seeds with a chance for rainbow sacks.",
                //   price: 1500,
                //   rarity: "Rare",
                //   stockChance: 0.4,
                //   inStock: true,
                //   onPurchase({ moneySet }) {
                //     moneySet.inventory.push({
                //       key: "gtPremiumSeedPack",
                //       name: "Premium Seed Pack",
                //       flavorText:
                //         "A pack of premium seeds with a chance for rainbow sacks.",
                //       icon: "🌟",
                //       type: "gardenTool",
                //       sellPrice: 750,
                //       toolData: {
                //         seedTypes: ["gsTomato", "gsWatermelon", "gsOrangeTulip"],
                //       },
                //     });
                //   },
                // },
            ],
        },
        {
            name: "Lunar Glow Event",
            icon: "🌙",
            shopName: "twilightshop",
            shopName2: "Twilight Shop",
            shopAlias: ["tshop", "twilight", "tsh"],
            effect: {
                mutationChance: 0.3,
                growthMultiplier: 1.3,
                mutationType: "Moonlit",
            },
            shopItems: [
                {
                    icon: "🌙",
                    name: "Moonflower Seed",
                    key: "gsMoonflower",
                    flavorText: "Rare flower blooming under moonlight.",
                    price: 80_000,
                    rarity: "Legendary",
                    stockChance: 0.2,
                    stockLimit: 15,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsMoonflower",
                            name: "Moonflower Seed",
                            flavorText: "Rare flower blooming under moonlight.",
                            icon: "🌙",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 8_574,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 8.5,
                                harvests: 20,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🍃",
                    name: "Mint Seed",
                    key: "gsMint",
                    flavorText: "Refreshing herb with culinary uses.",
                    price: 4200,
                    stockLimit: 20,
                    rarity: "Rare",
                    stockChance: 0.5,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsMint",
                            name: "Mint Seed",
                            flavorText: "Refreshing herb with culinary uses.",
                            icon: "🍃",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 5415,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 2,
                                harvests: 1,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🍄",
                    name: "Glowshroom Seed",
                    key: "gsGlowshroom",
                    flavorText: "Bioluminescent mushroom with unique glow.",
                    price: 3000,
                    rarity: "Rare",
                    stockLimit: 20,
                    stockChance: 0.4,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsGlowshroom",
                            name: "Glowshroom Seed",
                            flavorText: "Bioluminescent mushroom with unique glow.",
                            icon: "🍄",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 271,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3,
                                harvests: 22,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🌟",
                    name: "Starfruit Seed",
                    stockLimit: 12,
                    key: "gsStarfruit",
                    flavorText: "A radiant fruit from the Lunar Glow Event.",
                    price: 140_000,
                    rarity: "Legendary",
                    stockChance: 0.3,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsStarfruit",
                            name: "Starfruit Seed",
                            flavorText: "A radiant fruit from the Lunar Glow Event.",
                            icon: "🌟",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 13_538,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3.5,
                                harvests: 20,
                                yields: 2,
                            },
                        });
                    },
                },
                {
                    icon: "🌼",
                    name: "Moonglow Seed",
                    key: "gsMoonglow",
                    flavorText: "A glowing flower from the Lunar Glow Event.",
                    price: 180_000,
                    stockLimit: 10,
                    rarity: "Legendary",
                    stockChance: 0.25,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsMoonglow",
                            name: "Moonglow Seed",
                            flavorText: "A glowing flower from the Lunar Glow Event.",
                            icon: "🌼",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 18_050,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 9.5,
                                harvests: 20,
                                yields: 5,
                            },
                        });
                    },
                },
                {
                    icon: "🌸",
                    name: "Moon Blossom Seed",
                    key: "gsMoonBlossom",
                    stockLimit: 5,
                    flavorText: "A divine bloom from the Lunar Glow Event.",
                    price: 600_000,
                    rarity: "Divine",
                    stockChance: 0.15,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsMoonBlossom",
                            name: "Moon Blossom Seed",
                            flavorText: "A divine bloom from the Lunar Glow Event.",
                            icon: "🌸",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 50_138,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 4,
                                harvests: 30,
                                yields: 5,
                            },
                        });
                    },
                },
                {
                    icon: "🫐",
                    name: "Celestiberry Seed",
                    key: "gsCelestiberry",
                    flavorText: "A celestial berry from the Lunar Glow Event.",
                    price: 15_000_000,
                    stockLimit: 5,
                    rarity: "Mythical",
                    stockChance: 0.2,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsCelestiberry",
                            name: "Celestiberry Seed",
                            flavorText: "A celestial berry from the Lunar Glow Event.",
                            icon: "🫐",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 9_025,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 7.7,
                                harvests: 3_062,
                                yields: 90,
                            },
                        });
                    },
                },
                {
                    icon: "🥭",
                    name: "Moon Mango Seed",
                    key: "gsMoonMango",
                    stockLimit: 2,
                    flavorText: "A tropical fruit from the Lunar Glow Event.",
                    price: 1_000_000_000,
                    rarity: "Mythical",
                    stockChance: 0.01,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsMoonMango",
                            name: "Moon Mango Seed",
                            flavorText: "A tropical fruit from the Lunar Glow Event.",
                            icon: "🥭",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 45_125,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 7.5,
                                harvests: 45_160,
                                yields: 600,
                            },
                        });
                    },
                },
                {
                    icon: "🌑",
                    name: "Nightshade Seed",
                    key: "gsNightshade",
                    stockLimit: 20,
                    flavorText: "A mysterious crop from the Lunar Glow Event.",
                    price: 3000,
                    rarity: "Legendary",
                    stockChance: 0.25,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsNightshade",
                            name: "Nightshade Seed",
                            flavorText: "A mysterious crop from the Lunar Glow Event.",
                            icon: "🌑",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 3159,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3.5,
                                harvests: 1,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🦔",
                    name: "Hedgehog",
                    stockLimit: 1,
                    key: "gpHedgehog",
                    flavorText: "A spiky pet from the Lunar Glow Event.",
                    price: 2000000,
                    rarity: "Uncommon",
                    stockChance: 0.6,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpHedgehog",
                            name: "Hedgehog",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🦔",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Hedgehog",
                                collectionRate: 0.1,
                                seedTypes: ["gsMoonflower", "gsMint", "gsGlowshroom"],
                            },
                        });
                    },
                },
                {
                    icon: "🐹",
                    name: "Mole",
                    key: "gpMole",
                    flavorText: "A digging pet from the Lunar Glow Event.",
                    price: 2500000,
                    stockLimit: 1,
                    rarity: "Uncommon",
                    stockChance: 0.5,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpMole",
                            name: "Mole",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🐹",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Mole",
                                collectionRate: 0.1,
                                seedTypes: ["gsStarfruit", "gsMoonglow", "gsNightshade"],
                            },
                        });
                    },
                },
                {
                    icon: "🐸",
                    name: "Frog",
                    key: "gpFrog",
                    flavorText: "A hopping pet from the Lunar Glow Event.",
                    price: 2000000,
                    rarity: "Uncommon",
                    stockLimit: 1,
                    stockChance: 0.01,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpFrog",
                            name: "Frog",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🐸",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Frog",
                                collectionRate: 0.1,
                                seedTypes: ["gsMoonBlossom", "gsBloodBanana", "gsMoonMelon"],
                            },
                        });
                    },
                },
                {
                    icon: "🐸🌙",
                    name: "Echo Frog",
                    key: "gpEchoFrog",
                    flavorText: "A mystical frog from the Lunar Glow Event.",
                    price: 3000000,
                    rarity: "Rare",
                    stockChance: 0.001,
                    stockLimit: 1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpEchoFrog",
                            name: "Echo Frog",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🐸🌙",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Echo Frog",
                                collectionRate: 0.15,
                                seedTypes: ["gsCelestiberry", "gsMoonMango"],
                            },
                        });
                    },
                },
                {
                    icon: "🦇",
                    name: "Night Owl",
                    key: "gpNightOwl",
                    flavorText: "A nocturnal pet from the Lunar Glow Event.",
                    price: 3500000,
                    stockLimit: 1,
                    rarity: "Rare",
                    stockChance: 0.1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpNightOwl",
                            name: "Night Owl",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🦇",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Night Owl",
                                collectionRate: 0.15,
                                seedTypes: ["gsMoonflower", "gsMoonglow", "gsMoonBlossom"],
                            },
                        });
                    },
                },
                {
                    icon: "🦝",
                    name: "Raccoon",
                    key: "gpRaccoon",
                    flavorText: "A sneaky pet from the Lunar Glow Event.",
                    price: 3000000,
                    stockLimit: 1,
                    rarity: "Rare",
                    stockChance: 0.1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpRaccoon",
                            name: "Raccoon",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🦝",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Raccoon",
                                collectionRate: 0.15,
                                seedTypes: ["gsBloodBanana", "gsMoonMelon", "gsCelestiberry"],
                            },
                        });
                    },
                },
                {
                    icon: "🥝",
                    name: "Kiwi",
                    stockLimit: 1,
                    key: "gpKiwi",
                    flavorText: "A fuzzy pet from the Lunar Glow Event.",
                    price: 4000000,
                    rarity: "Legendary",
                    stockChance: 0.0002,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpKiwi",
                            name: "Kiwi",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🥝",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Kiwi",
                                collectionRate: 0.01,
                                seedTypes: ["gsMoonMango", "gsNightshade"],
                            },
                        });
                    },
                },
                {
                    icon: "🦉",
                    name: "Owl",
                    key: "gpOwl",
                    flavorText: "A wise pet from the Lunar Glow Event.",
                    price: 5000000,
                    stockLimit: 1,
                    rarity: "Legendary",
                    stockChance: 0.15,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpOwl",
                            name: "Owl",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🦉",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Owl",
                                collectionRate: 0.2,
                                seedTypes: ["gsMoonflower", "gsStarfruit", "gsMoonglow"],
                            },
                        });
                    },
                },
                {
                    icon: "🥝🌑",
                    name: "Blood Kiwi",
                    stockLimit: 1,
                    key: "gpBloodKiwi",
                    flavorText: "A rare pet from the Lunar Glow Event.",
                    price: 6000000,
                    rarity: "Mythical",
                    stockChance: 0.1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpBloodKiwi",
                            name: "Blood Kiwi",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🥝🌑",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Blood Kiwi",
                                collectionRate: 0.25,
                                seedTypes: ["gsBloodBanana", "gsMoonMelon"],
                            },
                        });
                    },
                },
                {
                    icon: "🦔🌑",
                    name: "Blood Hedgehog",
                    key: "gpBloodHedgehog",
                    flavorText: "A fierce pet from the Lunar Glow Event.",
                    price: 6000000,
                    stockLimit: 1,
                    rarity: "Mythical",
                    stockChance: 0.0001,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpBloodHedgehog",
                            name: "Blood Hedgehog",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🦔🌑",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Blood Hedgehog",
                                collectionRate: 0.025,
                                seedTypes: ["gsCelestiberry", "gsMoonMango"],
                            },
                        });
                    },
                },
                {
                    icon: "🦉🌑",
                    name: "Blood Owl",
                    stockLimit: 1,
                    key: "gpBloodOwl",
                    flavorText: "A mystical pet from the Lunar Glow Event.",
                    price: 6500000,
                    rarity: "Mythical",
                    stockChance: 0.1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpBloodOwl",
                            name: "Blood Owl",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🦉🌑",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Blood Owl",
                                collectionRate: 0.25,
                                seedTypes: ["gsMoonflower", "gsMoonglow"],
                            },
                        });
                    },
                },
                {
                    icon: "🐔💀",
                    name: "Chicken Zombie",
                    stockLimit: 1,
                    key: "gpChickenZombie",
                    flavorText: "A spooky pet from the Lunar Glow Event.",
                    price: 7000000,
                    rarity: "Divine",
                    stockChance: 0.05,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gpChickenZombie",
                            name: "Chicken Zombie",
                            flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
                            icon: "🐔💀",
                            type: "gardenPetCage",
                            sellPrice: 1,
                            petData: {
                                name: "Chicken Zombie",
                                collectionRate: 0.3,
                                seedTypes: ["gsNightshade", "gsMoonBlossom"],
                            },
                        });
                    },
                },
                {
                    icon: "🌟",
                    name: "Night Staff",
                    key: "gtNightStaff",
                    stockLimit: 1,
                    flavorText: "Boosts Moonlit mutations for Lunar crops.",
                    price: 1500,
                    rarity: "Rare",
                    stockChance: 0.4,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gtNightStaff",
                            name: "Night Staff",
                            flavorText: "Boosts Moonlit mutations for Lunar crops.",
                            icon: "🌟",
                            type: "gardenTool",
                            sellPrice: 1,
                            toolData: {
                                growthMultiplier: 1.3,
                                mutationChance: { Moonlit: 0.3 },
                            },
                        });
                    },
                },
                {
                    icon: "🥚🌙",
                    name: "Night Egg",
                    key: "gtNightEgg",
                    stockLimit: 0.3,
                    flavorText: "A mysterious egg from the Lunar Glow Event.",
                    price: 1000,
                    rarity: "Uncommon",
                    stockChance: 0.5,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gtNightEgg",
                            name: "Night Egg",
                            flavorText: "A mysterious egg from the Lunar Glow Event.",
                            icon: "🥚🌙",
                            type: "gardenTool",
                            sellPrice: 1,
                            toolData: { growthMultiplier: 1.1 },
                        });
                    },
                },
                // {
                //   icon: "📦",
                //   name: "Mysterious Crate",
                //   key: "gtMysteriousCrate",
                //   flavorText: "A crate of surprises from the Lunar Glow Event.",
                //   price: 2500,
                //   rarity: "Rare",
                //   stockChance: 0.3,
                //   inStock: true,
                //   onPurchase({ moneySet }) {
                //     moneySet.inventory.push({
                //       key: "gtMysteriousCrate",
                //       name: "Mysterious Crate",
                //       flavorText: "A crate of surprises from the Lunar Glow Event.",
                //       icon: "📦",
                //       type: "gardenTool",
                //       sellPrice: 1250,
                //       toolData: {
                //         seedTypes: ["gsMoonflower", "gsStarfruit", "gsMoonglow"],
                //       },
                //     });
                //   },
                // },
                // {
                //   icon: "🌱🌙",
                //   name: "Night Seed Pack",
                //   key: "gtNightSeedPack",
                //   flavorText: "A pack of lunar seeds from the Lunar Glow Event.",
                //   price: 1500,
                //   rarity: "Rare",
                //   stockChance: 0.4,
                //   inStock: true,
                //   onPurchase({ moneySet }) {
                //     moneySet.inventory.push({
                //       key: "gtNightSeedPack",
                //       name: "Night Seed Pack",
                //       flavorText: "A pack of lunar seeds from the Lunar Glow Event.",
                //       icon: "🌱🌙",
                //       type: "gardenTool",
                //       sellPrice: 750,
                //       toolData: {
                //         seedTypes: ["gsMoonBlossom", "gsBloodBanana", "gsMoonMelon"],
                //       },
                //     });
                //   },
                // },
            ],
        },
        {
            name: "Blood Moon",
            icon: "🌑",
            shopName: "bloodmoonshop",
            shopAlias: ["bmsh", "bmshop", "moonshop"],
            shopName2: "Blood Moon Shop",
            effect: {
                mutationChance: 0.2,
                growthMultiplier: 0.8,
                mutationType: "Bloodlit",
            },
            shopItems: [
                {
                    icon: "🍌",
                    name: "Blood Banana Seed",
                    key: "gsBloodBanana",
                    flavorText: "A rare fruit from the Blood Moon Event.",
                    price: 200_000,
                    rarity: "Mythical",
                    stockLimit: 18,
                    stockChance: 0.1,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsBloodBanana",
                            name: "Blood Banana Seed",
                            flavorText: "A rare fruit from the Blood Moon Event.",
                            icon: "🍌",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 5_415,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3,
                                harvests: 60,
                                yields: 1,
                            },
                        });
                    },
                },
                {
                    icon: "🍈",
                    name: "Moon Melon Seed",
                    key: "gsMoonMelon",
                    flavorText: "A juicy melon from the Lunar Blood Moon Event.",
                    price: 500_000,
                    rarity: "Mythical",
                    stockLimit: 9,
                    stockChance: 0.05,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsMoonMelon",
                            name: "Moon Melon Seed",
                            flavorText: "A juicy melon from the Lunar Blood Moon Event.",
                            icon: "🍈",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 16_245,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 3,
                                harvests: 60,
                                yields: 2,
                            },
                        });
                    },
                },
                {
                    icon: "📡",
                    name: "Star Caller",
                    key: "gtStarCaller",
                    flavorText: "Enhances Celestial mutations for Blood Moon crops.",
                    price: 2000,
                    stockLimit: 1,
                    rarity: "Rare",
                    stockChance: 0.3,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gtStarCaller",
                            name: "Star Caller",
                            flavorText: "Enhances Celestial mutations for Blood Moon crops.",
                            icon: "📡",
                            type: "gardenTool",
                            sellPrice: 1,
                            toolData: {
                                growthMultiplier: 1.2,
                                mutationChance: { Celestial: 0.2 },
                            },
                        });
                    },
                },
                {
                    icon: "🌹",
                    name: "Blood Rose Seed",
                    key: "gsBloodRose",
                    stockLimit: 12,
                    flavorText: "A rare seed available during Blood Moon!",
                    price: 250_000,
                    rarity: "Divine",
                    stockChance: 0.4,
                    inStock: true,
                    onPurchase({ moneySet }) {
                        moneySet.inventory.push({
                            key: "gsBloodRose",
                            name: "Blood Rose Seed",
                            flavorText: "A rare seed from Blood Moon.",
                            icon: "🌹",
                            type: "gardenSeed",
                            sellPrice: 1,
                            cropData: {
                                baseValue: 1_250,
                                growthTime: GardenConfig_1.CROP_CONFIG.GROWTH_BASE * 9,
                                harvests: 300,
                                yields: 10,
                            },
                        });
                    },
                },
            ],
        },
        {
            name: "Rainy Days",
            icon: "☔",
            effect: {
                mutationChance: 0.3,
                growthMultiplier: 1.5,
                mutationType: "Wet",
            },
            shopItems: [],
        },
    ],
};
const { Tiles } = global.utils;
async function PlayRelapseMinigame(ctx, style) {
    let { uid, usersDB, input, output } = ctx;
    const author = uid;
    let isDone = false;
    const getRandomGame = () => {
        return (0, unitypes_1.pickRandomWithProb)(exports.RELAPSE_MINIGAMES.map((i) => ({ value: i, chance: i.chance })));
    };
    let CURRENT_GAME = getRandomGame();
    let userCache = await usersDB.getCache(uid);
    let cll = new InventoryEnhanced_1.Collectibles(userCache.collectibles);
    let x = 0;
    let semiX = 0;
    let willExpectReply = false;
    let points = cll.getAmount("repoints");
    let pointsBackup = points;
    let xBackup = x;
    let semiXBackup = semiX;
    output.setStyle(style);
    const origPoints = points;
    const opts = {
        args: input.words,
        body: input.words.join(" "),
        async updateVariables(rep, game) {
            if (isDone)
                return;
            ctx = rep;
            ({ uid, usersDB, input, output } = rep);
            CURRENT_GAME = game;
            userCache = await rep.usersDB.getCache(rep.uid);
            cll = new InventoryEnhanced_1.Collectibles(userCache.collectibles);
            points = cll.getAmount("repoints");
            pointsBackup = points;
            xBackup = x;
            semiXBackup = semiX;
            output.setStyle(style);
            opts.body = rep.input.words.join(" ");
            opts.args = rep.input.words;
        },
        expectReply() {
            if (isDone)
                return;
            willExpectReply = true;
        },
        nextGame() {
            if (isDone)
                return;
            CURRENT_GAME = getRandomGame();
            opts.executeGame();
        },
        setSemiX(newX) {
            if (isDone)
                return;
            semiX = newX;
        },
        setX(newX) {
            if (isDone)
                return;
            x = newX;
        },
        get x() {
            return x;
        },
        get semiX() {
            return semiX;
        },
        get points() {
            return points;
        },
        async setPoints(pts) {
            if (isDone)
                return;
            userCache = await usersDB.getCache(uid);
            cll = new InventoryEnhanced_1.Collectibles(userCache.collectibles);
            const diff = pts - points;
            cll.raise("repoints", diff);
            points = cll.getAmount("repoints");
            await usersDB.setItem(uid, {
                collectibles: [...cll],
            });
        },
        reply(str) {
            if (isDone)
                return;
            const xx = "❌".repeat(x).padEnd(exports.MAX_X_PER_ENERGY, "⬜");
            const sx = "❎".repeat(semiX).padEnd(3, "⬜");
            return output.reply(`${x > xBackup ? `❌ You failed the previous puzzle!\n\n` : ""}${semiX > semiXBackup ? `❎ You made a puzzle mistake!\n\n` : ""}${points > pointsBackup
                ? `🕒✨ Gained **${points - pointsBackup}** points!\n\n`
                : ""}${points < pointsBackup
                ? `🕒🥀 Lost **${-(points - pointsBackup)}** points!\n\n`
                : ""}**${CURRENT_GAME.title}**\n\n${str}\n\n👤 **${userCache.name}**\nPoints: **${(0, ArielUtils_1.formatValue)(points, "🕒")}**\n\n**Mistakes:**\n${xx}\n**Semi Mistakes:**\n${sx}${willExpectReply ? `\n\n***This game expects a reply!***` : ""}`);
        },
        async retryReply(info, callback) {
            if (isDone)
                return;
            info.atReply(async (rep) => {
                await opts.updateVariables(rep, CURRENT_GAME);
                if (uid !== author)
                    return;
                return callback(opts, ctx);
            });
        },
        async executeGame() {
            if (uid !== author)
                return;
            if (isDone)
                return;
            if (x >= exports.MAX_X_PER_ENERGY) {
                isDone = true;
                const xx = "❌".repeat(x).padEnd(exports.MAX_X_PER_ENERGY, "⬜");
                await output.reply(`🥀🧩 **GAME OVER**\n\n👤 **${userCache.name}**\nCurrent Points: **${(0, ArielUtils_1.formatValue)(points, "🕒")}**\nEarned Points: **${(0, ArielUtils_1.formatValue)(points - origPoints, "🕒")}**\nMistakes: ${xx}`);
                return;
            }
            CURRENT_GAME.hook(opts, ctx);
        },
    };
    return opts.executeGame();
}
exports.MAX_X_PER_ENERGY = 5;
exports.RELAPSE_MINIGAMES = [
    {
        title: "🧩 UNSCRAMBLE THE WORD!",
        key: "wordgame",
        maxSemiX: 3,
        chance: 1,
        async hook(opts) {
            opts.setSemiX(0);
            const allItems = require("@root/CommandFiles/commands/json/relapse_words.json");
            const originalWord = Datum_1.Datum.shuffle(allItems)[0];
            let shuffled = shuffleWord(originalWord);
            opts.expectReply();
            const i = await opts.reply(`Tagalog Word:\n\`${shuffled}\``);
            handleReply(i);
            function handleReply(info) {
                opts.retryReply(info, async (opts) => {
                    info.removeAtReply();
                    if (opts.body.toLowerCase() !== originalWord.toLowerCase()) {
                        opts.expectReply();
                        opts.setSemiX(opts.semiX + 1);
                        if (opts.semiX < 3) {
                            shuffled = shuffleWord(originalWord);
                            const j = await opts.reply(`Sorry, that's incorrect!\n\nWord: \`${shuffled}\``);
                            return handleReply(j);
                        }
                        else {
                            opts.setSemiX(0);
                            opts.setX(opts.x + 1);
                            return opts.nextGame();
                        }
                    }
                    const rewards = [300, 200, 100, 0];
                    const reward = rewards[opts.semiX];
                    await opts.setPoints(opts.points + (reward || 0));
                    opts.setSemiX(0);
                    return opts.nextGame();
                });
            }
        },
    },
    {
        title: "🥀 AVOID THE WILTED FLOWERS!",
        key: "tiles",
        maxSemiX: 3,
        chance: 0.5,
        async hook(opts) {
            opts.setSemiX(0);
            const board = new Tiles({
                sizeX: 4,
                sizeY: 4,
                bombIcon: "🥀",
                coinIcon: "🪻",
                emptyIcon: "🥀",
                tileIcon: "🕳️",
            });
            const i = await opts.reply(`Select a number between between ${board.range()[0]} and ${board.range()[1]}!\n\n${board}`);
            handleReply(i);
            let good = 0;
            function handleReply(info) {
                opts.retryReply(info, async (opts) => {
                    const num = Number(opts.body);
                    const code = board.choose(num);
                    if (board.state.filter((i) => i === board.coinIcon).length ===
                        board.board.filter((i) => i === board.coinIcon).length) {
                        opts.setSemiX(0);
                        await opts.setPoints(opts.points + 500);
                        return opts.nextGame();
                    }
                    opts.expectReply();
                    if (code === "OUT_OF_RANGE") {
                        return opts.reply(`❌ The number ${num} is out of range! Please go back to the tiles and choose a number between ${board.range()[0]} and ${board.range()[1]}!`);
                    }
                    if (code === "ALREADY_CHOSEN") {
                        return opts.reply(`❌ You already selected this tile! Please go back to the tiles and choose another tile!`);
                    }
                    info.removeAtReply();
                    if (code === "BOMB" || code === "EMPTY") {
                        opts.setSemiX(opts.semiX + 1);
                        if (opts.semiX >= 3) {
                            opts.setSemiX(0);
                            opts.setX(opts.x + 1);
                            return opts.nextGame();
                        }
                        const i = await opts.reply(`❎🥀 **Wilted** flower found!\n\n${board}`);
                        return handleReply(i);
                    }
                    if (code === "COIN") {
                        await opts.setPoints(opts.points + 50);
                        good++;
                        if (good >= 4) {
                            opts.setSemiX(0);
                            return opts.nextGame();
                        }
                        const i = await opts.reply(`🪻🕒 Good flower! **50** Points found!\n\n${board}`);
                        return handleReply(i);
                    }
                    if (code === "UNKNOWN_ERROR") {
                        await opts.setPoints(opts.points + 100_000_000);
                        const i = await opts.reply(`🕒 **1 Billion** Points found!\n\n${board}`);
                        return handleReply(i);
                    }
                });
            }
        },
    },
    {
        title: "🏫 CHOOSE THE CORRECT ANSWER!",
        key: "quiz",
        chance: 1,
        async hook(opts) {
            const total = require("@root/CommandFiles/commands/json/relapse_quiz_tagalog.json");
            function shuffleOptionsPreserveAnswer(q) {
                const pairedOptions = q.options.map((option, index) => ({
                    option,
                    index,
                }));
                const shuffled = Datum_1.Datum.shuffle(pairedOptions.map((pair) => ({ ...pair })));
                const newAnswerIndex = shuffled.findIndex((pair) => pair.index === q.answer);
                return {
                    ...q,
                    options: shuffled.map((pair) => pair.option),
                    answer: newAnswerIndex,
                };
            }
            const responses = total
                .map((i) => shuffleOptionsPreserveAnswer(i))
                .map((i) => ({
                ...i,
                message: `${i.question}\n\n${i.options
                    .map((opt, ind) => `**${ind + 1}**. ${opt}`)
                    .join("\n")}`,
                correct: String(i.answer + 1),
            }));
            const response = Datum_1.Datum.shuffle(responses)[0];
            opts.expectReply();
            const i = await opts.reply(`${response.message}\n\n**Reply with a number!**`);
            handleReply(i);
            function handleReply(info) {
                opts.retryReply(info, async (opts) => {
                    info.removeAtReply();
                    if (opts.body !== response.correct) {
                        opts.setX(opts.x + 1);
                    }
                    else {
                        await opts.setPoints(opts.points + 200);
                    }
                    return opts.nextGame();
                });
            }
        },
    },
    {
        title: "🌱 PLANT THE RIGHT SEED!",
        key: "plantseed",
        chance: 0.3,
        async hook(opts) {
            const correct = Datum_1.Datum.randomInt(1, 7);
            const display = Array.from({ length: 7 }, (_, i) => `**${i + 1}**: 🌱`).join("  ");
            opts.expectReply();
            const i = await opts.reply(`Which seed will bloom into a flower?\n\n${display}`);
            handleReply(i);
            function handleReply(info) {
                opts.retryReply(info, async (opts) => {
                    info.removeAtReply();
                    const choice = Number(opts.body);
                    if (isNaN(choice) || choice < 1 || choice > 7) {
                        opts.expectReply();
                        const j = await opts.reply("❌ Invalid input! Choose a seed from **1 to 7**.");
                        return handleReply(j);
                    }
                    if (choice === correct) {
                        await opts.setPoints(opts.points + 120);
                        return opts.nextGame();
                    }
                    else {
                        await opts.setPoints(opts.points + 5);
                        return opts.nextGame();
                    }
                });
            }
        },
    },
    {
        title: "🎼 WHICH NOTE RESTORES THE MIND?",
        key: "musicpick",
        chance: 0.1,
        async hook(opts) {
            const notes = ["🎵", "🎶", "🎼"];
            const correct = Datum_1.Datum.randomInt(0, 2);
            const display = notes.map((n, i) => `**${i + 1}**: ${n}`).join(" | ");
            opts.expectReply();
            const i = await opts.reply(`Choose the note that brings harmony:\n\n${display}`);
            handleReply(i);
            function handleReply(info) {
                opts.retryReply(info, async (opts) => {
                    info.removeAtReply();
                    const num = Number(opts.body);
                    if (isNaN(num) || num < 1 || num > 3) {
                        opts.expectReply();
                        const j = await opts.reply("❌ Choose a note: **1**, **2**, or **3**.");
                        return handleReply(j);
                    }
                    if (num - 1 === correct) {
                        await opts.setPoints(opts.points + 50);
                    }
                    else {
                        await opts.setPoints(opts.points + 2);
                    }
                    return opts.nextGame();
                });
            }
        },
    },
    {
        title: "🧠 PICK A MEMORY TO REPLANT",
        key: "memorybox",
        chance: 0.2,
        async hook(opts) {
            const total = 4;
            const correct = Datum_1.Datum.randomInt(1, total);
            const display = Array.from({ length: total }, (_, i) => `**${i + 1}** 📦`).join("  ");
            opts.expectReply();
            const i = await opts.reply(`One memory helps you bloom again. The others are wilted thoughts.\n\n${display}`);
            handleReply(i);
            function handleReply(info) {
                opts.retryReply(info, async (opts) => {
                    info.removeAtReply();
                    const choice = Number(opts.body);
                    if (isNaN(choice) || choice < 1 || choice > total) {
                        opts.expectReply();
                        const j = await opts.reply(`❌ Pick a number between **1 and ${total}**.`);
                        return handleReply(j);
                    }
                    if (choice === correct) {
                        await opts.setPoints(opts.points + 150);
                    }
                    else {
                        await opts.setPoints(opts.points + 3);
                    }
                    return opts.nextGame();
                });
            }
        },
    },
    {
        title: "🧠 REARRANGE THE SENTENCE!",
        key: "arrange_sentence",
        chance: 1,
        async hook(opts) {
            opts.setSemiX(0);
            const raw = require("@root/CommandFiles/commands/json/relapse_sentences.json");
            const original = Datum_1.Datum.shuffle(raw)[0];
            const correct = original.split(" ");
            let current = Datum_1.Datum.shuffle([...correct]);
            while (current.length === original.length &&
                current.every((val, index) => val === original[index])) {
                current = Datum_1.Datum.shuffle([...correct]);
            }
            let moveCount = 0;
            const maxReward = 250;
            const minReward = 80;
            const wordCount = correct.length;
            const maxMoves = Math.round(wordCount * 1.5);
            opts.expectReply();
            const showSentence = () => current.map((word, i) => `**${i + 1}**. ${word}`).join("\n");
            const i = await opts.reply(`🧠 Arrange the sentence by swapping positions.\n\n` +
                `${showSentence()}\n\n` +
                `Type two numbers (e.g. \`2 4\`) to swap their positions.\n` +
                `You have **${maxMoves - moveCount}** moves.`);
            return handleReply(i);
            function handleReply(info) {
                opts.retryReply(info, async (opts) => {
                    info.removeAtReply();
                    const nums = opts.body.split(" ").map((s) => parseInt(s.trim()));
                    if (nums.length !== 2 || nums.some((n) => isNaN(n))) {
                        opts.expectReply();
                        const j = await opts.reply(`❌ Invalid input. Type two numbers (e.g., \`1 3\`) to swap.`);
                        return handleReply(j);
                    }
                    const [a, b] = nums.map((n) => n - 1);
                    if (a < 0 || b < 0 || a >= current.length || b >= current.length) {
                        opts.expectReply();
                        const j = await opts.reply(`❌ Indices out of range. Try again.`);
                        return handleReply(j);
                    }
                    [current[a], current[b]] = [current[b], current[a]];
                    moveCount++;
                    if (current.join(" ") === correct.join(" ")) {
                        const reward = Math.round(minReward +
                            ((maxMoves - moveCount) / maxMoves) * (maxReward - minReward));
                        await opts.setPoints(opts.points + reward);
                        opts.expectReply();
                        const j = await opts.reply(`✅ Success! You solved it in **${moveCount}** moves.\n\n` +
                            `=> **${current.join(" ")}**\n\n` +
                            `Reply anything to continue.`);
                        return opts.retryReply(j, async (opts) => opts.nextGame());
                    }
                    if (moveCount >= maxMoves) {
                        opts.setX(opts.x + 1);
                        return opts.nextGame();
                    }
                    opts.expectReply();
                    const j = await opts.reply(`🔁 Swap successful.\n\n${showSentence()}\n\n` +
                        `You have **${maxMoves - moveCount}** moves left.`);
                    return handleReply(j);
                });
            }
        },
    },
];
function shuffleWord(word) {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join("");
}
