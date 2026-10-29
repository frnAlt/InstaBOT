"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CROP_CONFIG = void 0;
exports.fetchSeedStock = fetchSeedStock;
const axios_1 = __importDefault(require("axios"));
exports.CROP_CONFIG = {
    BARN_LIMIT: 120,
    MUTATIONS: [
        { name: "Wet", valueMultiplier: 2, chance: 0.01, icon: "💧" },
        { name: "Chilled", valueMultiplier: 2, chance: 0, icon: "❄️" },
        { name: "Chocolate", valueMultiplier: 2, chance: 0, icon: "🍫" },
        { name: "Moonlit", valueMultiplier: 2, chance: 0, icon: "🌙" },
        { name: "Pollinated", valueMultiplier: 3, chance: 0, icon: "🐝" },
        { name: "Bloodlit", valueMultiplier: 4, chance: 0, icon: "🌑" },
        { name: "Plasma", valueMultiplier: 5, chance: 0, icon: "⚡" },
        { name: "HoneyGlazed", valueMultiplier: 5, chance: 0, icon: "🍯" },
        {
            name: "Frozen",
            valueMultiplier: 10,
            chance: 0,
            both: ["Wet", "Chilled"],
            icon: "🧊",
        },
        { name: "Golden", valueMultiplier: 20, chance: 0.01, icon: "🌟" },
        {
            name: "Zombified",
            valueMultiplier: 25,
            chance: 0.01,
            pet: ["gpChickenZombie"],
            icon: "🧟",
        },
        { name: "Twisted", valueMultiplier: 30, chance: 0, icon: "🌀" },
        { name: "Rainbow", valueMultiplier: 50, chance: 0.01, icon: "🌈" },
        { name: "Shocked", valueMultiplier: 100, chance: 0, icon: "🌩️" },
        { name: "Celestial", valueMultiplier: 120, chance: 0, icon: "✨" },
        { name: "Disco", valueMultiplier: 125, chance: 0, icon: "🪩" },
        { name: "VoidTouched", valueMultiplier: 135, chance: 0, icon: "🌌" },
        { name: "Relapsed", valueMultiplier: 7, chance: 0, icon: "💔🎫" },
        { name: "Astral", valueMultiplier: 6, chance: 0, icon: "🌌" },
        { name: "Bloom", valueMultiplier: 3, chance: 0, icon: "🌸" },
        { name: "Skipped", valueMultiplier: 5, chance: 0, icon: "⏭️💔" },
        { name: "Looped", valueMultiplier: 10, chance: 0, icon: "♻️" },
        { name: "Muted", valueMultiplier: 13, chance: 0, icon: "🔇" },
        { name: "Ghosted", valueMultiplier: 20, chance: 0, icon: "👻" },
        { name: "Desynced", valueMultiplier: 40, chance: 0, icon: "⬅️↪️" },
        { name: "Wilted", valueMultiplier: 0.9, chance: 0, icon: "🥀💔" },
    ],
    MBIAS: 1,
    GROWTH_BASE_OLD: 5 * 60 * 1000,
    GROWTH_BASE: 15 * 60 * 1000,
    OVERGROWTH_PENALTY: 1.5,
    LUCKY_HARVEST_CHANCE: 0.02,
    ACHIEVEMENTS: [
        { key: "harvest_100", name: "Harvest Master", harvests: 100, reward: 1000 },
        { key: "mutation_10", name: "Mutation Maniac", mutations: 10, reward: 500 },
        { key: "expand_1", name: "Land Baron", expansions: 1, reward: 2000 },
    ],
    MUTATION_INTERVAL: 2 * 60 * 1000,
    MAX_AFK: 1 * 60 * 60 * 1000,
    MIN_KG: 0.18,
    MAX_KG: 200.32,
    KILO_BIAS: 20,
    get STOCK_SEED_URL() {
        return `https://growagardenstock.com/api/stock?type=gear-seeds&ts=${Date.now()}`;
    },
    NOTIF_TIMEOUT: 10,
    MAX_MUTATION_ATT: 20,
    STOCK_MIN_BIAS: 10 / 15,
};
async function fetchSeedStock() {
    try {
        const res = await axios_1.default.get(exports.CROP_CONFIG.STOCK_SEED_URL);
        return res.data;
    }
    catch (error) {
        console.error(error?.stack);
        return null;
    }
}
