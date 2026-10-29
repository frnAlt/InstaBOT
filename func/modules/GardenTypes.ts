import { InventoryItem } from "./cassidyUser";

export type GardenSeed = InventoryItem & {
  type: "gardenSeed";
  cropData: {
    baseValue: number;
    growthTime: number;
    harvests: number;
    yields: number;
    baseKG?: number;
  };
  isFavorite?: boolean;
};
export type GardenPack = InventoryItem & {
  type: "roulette_pack";
  treasureKey: `randomGrouped_${string}`;
};

export type GardenPetCage = InventoryItem & {
  type: "gardenPetCage";
  petData: { name: string; collectionRate: number; seedTypes: string[] };
  isFavorite?: boolean;
};

export type GardenTool = InventoryItem & {
  type: "gardenTool";
  toolData: {
    growthMultiplier?: number;
    mutationChance?: { [key: string]: number };
    favoriteEnabled?: boolean;
  };
  isFavorite?: boolean;
};

export type GardenPlot = InventoryItem & {
  key: string;
  seedKey: string;
  name: string;
  icon: string;
  yields: number;
  plantedAt: number;
  growthTime: number;
  harvestsLeft: number;
  baseValue: number;
  mutation: string[];
  isFavorite?: boolean;
  originalGrowthTime: number;
  price: number;
  lastMutation: number;
  noAutoMutation?: never;
  kiloGrams: number;
  maxKiloGrams: number;
  mutationAttempts: number;
  baseKiloGrams: number;
  lastUpdated: number;
};
export type GardenBarn = InventoryItem & {
  key: string;
  seedKey: string;
  name: string;
  icon: string;
  mutation: string[];
  isFavorite?: boolean;
  kiloGrams: number;
  value: number;
  price: number;
};

export type GardenPetActive = InventoryItem & {
  key: string;
  name: string;
  icon: string;
  lastCollect: number;
  petData: { collectionRate: number; seedTypes: string[] };
  isEquipped: boolean;
};

export interface GardenStats {
  plotsHarvested: number;
  mutationsFound: number;
  expansions: number;
  achievements: string[];
}

export type GardenItem = GardenSeed | GardenPetCage | GardenTool | GardenPack;
