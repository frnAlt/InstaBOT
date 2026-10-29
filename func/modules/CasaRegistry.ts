import { CasaTile } from "./CasaieahUtils";

export const TILE_REGISTRY = new Map<string, CasaTile>([
  // === Exterior ===
  [
    "grass",
    {
      id: "grass",
      name: "Grass",
      emoji: "🌿",
      price: 10_000,
    },
  ],
  [
    "path",
    {
      id: "path",
      name: "Path",
      emoji: "🪵",
      price: 10_000,
    },
  ],
  [
    "fence",
    {
      id: "fence",
      name: "Fence",
      emoji: "🚧",
      price: 20_000,
    },
  ],
  [
    "tree",
    {
      id: "tree",
      name: "Tree",
      emoji: "🌳",
      price: 20_000,
    },
  ],
  [
    "water",
    {
      id: "water",
      name: "Water",
      emoji: "💧",
      price: 5_000,
    },
  ],

  // === Walls / Structure ===
  [
    "wall",
    {
      id: "wall",
      name: "Wall",
      emoji: "🧱",
      price: 5_000,
    },
  ],
  [
    "window",
    {
      id: "window",
      name: "Window",
      emoji: "🪟",
      price: 20_000,
    },
  ],
  [
    "door",
    {
      id: "door",
      name: "Door",
      emoji: "🚪",
      price: 30_000,
    },
  ],
  [
    "roof",
    {
      id: "roof",
      name: "Roof",
      emoji: "🏠",
      price: 5_000,
    },
  ],

  // === Interior ===
  [
    "floor",
    {
      id: "floor",
      name: "Floor",
      emoji: "🪵",
      price: 5_000,
    },
  ],
  [
    "rug",
    {
      id: "rug",
      name: "Rug",
      emoji: "🟥",
      price: 5_000,
    },
  ],
  [
    "bed",
    {
      id: "bed",
      name: "Bed",
      emoji: "🛏️",
      price: 100_000,
    },
  ],
  [
    "couch",
    {
      id: "couch",
      name: "Couch",
      emoji: "🛋️",
      price: 50_000,
    },
  ],
  [
    "table",
    {
      id: "table",
      name: "Table",
      emoji: "🪑",
      price: 50_000,
    },
  ],
  [
    "tv",
    {
      id: "tv",
      name: "TV",
      emoji: "📺",
      price: 200_000,
    },
  ],
  [
    "lamp",
    {
      id: "lamp",
      name: "Lamp",
      emoji: "💡",
      price: 30_000,
    },
  ],
  [
    "plant",
    {
      id: "plant",
      name: "Plant",
      emoji: "🪴",
      price: 30_000,
    },
  ],
  [
    "fridge",
    {
      id: "fridge",
      name: "Fridge",
      emoji: "🧊",
      price: 10_000,
    },
  ],
  [
    "stove",
    {
      id: "stove",
      name: "Stove",
      emoji: "🔥",
      price: 10_000,
    },
  ],
  [
    "sink",
    {
      id: "sink",
      name: "Sink",
      emoji: "🚰",
      price: 10_000,
    },
  ],
  [
    "toilet",
    {
      id: "toilet",
      name: "Toilet",
      emoji: "🚽",
      price: 200_000,
    },
  ],
  [
    "bathtub",
    {
      id: "bathtub",
      name: "Bathtub",
      emoji: "🛁",
      price: 700_000,
    },
  ],
  [
    "mirror",
    {
      id: "mirror",
      name: "Mirror",
      emoji: "🪞",
      price: 50_000,
    },
  ],

  // === Misc ===
  [
    "book",
    {
      id: "book",
      name: "Book",
      emoji: "📕",
      price: 10_000,
    },
  ],
  [
    "clock",
    {
      id: "clock",
      name: "Clock",
      emoji: "🕒",
      price: 80_000,
    },
  ],
  [
    "painting",
    {
      id: "painting",
      name: "Painting",
      emoji: "🖼️",
      price: 10_000,
    },
  ],
  [
    "computer",
    {
      id: "computer",
      name: "Computer",
      emoji: "💻",
      price: 900_000,
    },
  ],
]);
