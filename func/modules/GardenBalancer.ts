import { GardenItem, GardenSeed } from "@cass-modules/GardenTypes";
import { gardenShop } from "./GardenShop";
import { InventoryItem } from "./cassidyUser";

export type ShopPrice = "money" | "battlePoints" | `cll:${string}`;
export interface ShopItem {
  icon: string;
  name: string;
  key: string;
  flavorText: string;
  price: number;
  priceType?: ShopPrice;
  rarity?: string;
  /**
   * @deprecated
   */
  stockLimit?: number;
  stockChance?: number;
  inStock?: boolean;
  /**
   * @deprecated
   */
  expReward?: number;
  onPurchase: (
    args:
      | (CommandContext & { moneySet: { inventory: InventoryItem[] } })
      | { moneySet: { inventory: InventoryItem[] } }
  ) => void;
  [key: string]: unknown;
}

export interface ItemBalanceResult {
  name: string;
  key: string;
  score: number;
  price: number;
  baseValue: number;
  harvests: number;
  growthTime: number;
  pricePerHarvest: number;
  profitPerHarvest: number;
  timeEfficiency: number;
  costEfficiency: number;
  rarity: string;
  item: GardenSeed;
  stockChance: number;
}
export function evaluateItemBalance(
  shopItem: gardenShop.GardenShopItem
): ItemBalanceResult | null {
  let inventoryItem: GardenItem | null = null;
  const mockMoneySet = {
    inventory: [] as GardenItem[],
  };

  shopItem.onPurchase({ moneySet: mockMoneySet });
  inventoryItem = mockMoneySet.inventory[0] || null;

  if (
    !inventoryItem ||
    inventoryItem.type !== "gardenSeed" ||
    !inventoryItem.cropData
  ) {
    return null;
  }

  const { cropData, name, key } = inventoryItem;
  let { baseValue, growthTime, harvests, yields = 1 } = cropData;
  let { price, rarity } = shopItem;
  if (shopItem.priceType !== "money" && shopItem.priceType) {
    price = 0;
  }
  if (inventoryItem.cropData.baseKG) {
    baseValue * (inventoryItem.cropData.baseKG + 1);
  }

  const totalYields = yields;
  const harvestsPerYield = Math.floor(harvests / yields);
  const totalHarvests = harvestsPerYield * totalYields;

  // const totalValue = baseValue * totalYields;
  const pricePerYield = (price || 1) / totalHarvests;
  const profitPerYield = baseValue - (pricePerYield || 0);
  const totalProfit = profitPerYield * totalYields;

  const totalGrowthTime = growthTime * totalYields;
  const timeEfficiency = totalProfit / totalGrowthTime;
  const costEfficiency = totalProfit / (price || 1);

  const score =
    (profitPerYield * 0.4 +
      timeEfficiency * 0.3 +
      costEfficiency * 0.2 +
      baseValue * 0.1) /
    10;

  return {
    name,
    key,
    score: Number(score.toFixed(6)),
    price,
    baseValue,
    harvests,
    growthTime,
    pricePerHarvest: Number((price / totalHarvests).toFixed(2)),
    profitPerHarvest: Number((totalProfit / totalHarvests).toFixed(2)),
    timeEfficiency: Number(timeEfficiency.toFixed(8)),
    costEfficiency: Number(costEfficiency.toFixed(2)),
    rarity,
    stockChance: shopItem.stockChance,
    item: inventoryItem,
  };
}
