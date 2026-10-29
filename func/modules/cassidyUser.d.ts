// import type { Inventory, Collectibles } from "../plugins/ut-shop.js";
// import type { CassEXP } from "./cassEXP.js";

import { IFCAU_User } from "@xaviabot/fca-unofficial";
import { InputRoles } from "./InputClass";
import {
  GardenBarn,
  GardenPetActive,
  GardenPlot,
  GardenStats,
} from "./GardenTypes";
import { CasaieahRaw } from "./CasaieahUtils";

type InventoryTypes =
  | "generic"
  | "weapon"
  | "armor"
  | "key"
  | "food"
  | "anypet_food"
  | "cheque"
  | `${string}_food`
  | `${string}`;

export interface UserStatsManagerOld {
  filePath: string;
  defaults: { money: number; exp: number };

  isMongo: boolean;

  process(data: Partial<UserData>): UserData;

  calcMaxBalance(users: Record<string, UserData>, specificID: string): number;

  connect(): Promise<void>;

  extractMoney(userData: UserData): {
    money: number;
    total: number;
    bank: number;
    lendAmount: number;
    cheques: number;
  };

  get(key: string): Promise<UserData>;
  getCache(key: string): Promise<UserData>;

  deleteUser(key: string): Promise<void>;

  remove(
    key: string,
    removedProperties: string[]
  ): Promise<Record<string, UserData>>;

  set(key: string, updatedProperties?: Partial<UserData>): Promise<void>;

  getAll(): Promise<Record<string, UserData>>;

  readMoneyFile(): Record<string, UserData>;

  writeMoneyFile(data: Record<string, UserData>): void;

  toLeanObject(): Promise<Record<string, UserData>>;
}

export type BaseInventoryItem = {
  key: string;
  name: string;
  flavorText?: string;
  icon: string;
  sellPrice?: number;
  type: InventoryTypes;
  /**
   * @deprecated
   */
  index?: number;
  uuid?: string;
};

export type WeaponInventoryItem = BaseInventoryItem & {
  atk: number;
  def?: number;
  magic?: number;
  type: "weapon";
};

export type ArmorInventoryItem = BaseInventoryItem & {
  atk?: number;
  def: number;
  magic?: number;
  type: "armor";
};

export type RandFoodItem = BaseInventoryItem & {
  heal: number;
  type: "food";
  saturation?: number;
  picky?: boolean;
};

export type PetFoodItem = BaseInventoryItem & {
  saturation: number;
  type: `${string}_food`;
  heal?: number;
  picky?: boolean;
};

export type ChequeItem = {
  chequeAmount: number;
  type: "cheque";
};

export type PetUncaged = {
  name: string;
  key: string;
  flavorText?: string;
  icon: string;
  type: "pet";
  sellPrice?: number;
  cannotToss?: false;
  petType: string;
  level: number;
  lastFeed: number;
  lastExp: number;
  lastSaturation: number;
  lastFoodEaten: string;
  lastQuest?: number;
  questCount?: number;
  lastQuestDay?: number;
  questStreak?: number;
};

export type InventoryItem = (
  | (BaseInventoryItem & WeaponInventoryItem)
  | (BaseInventoryItem & ArmorInventoryItem)
  | (BaseInventoryItem & ChequeItem)
  | BaseInventoryItem
) & { [key: string]: unknown };

export type CollectibleItem = {
  metadata: {
    key: string;
    name: string;
    icon: string;
    type: string;
    limit?: number | null;
    [key: string]: any;
  };
  amount: number;
};

type UserData = {
  avatarURL?: string;
  analytics?: [string, number][];
  nameMeta?:
    | undefined
    | {
        name: string;
        nonEmojis: string;
        emojis: string;
        finalName: string;
      };
  money: number;
  userID?: string;
  inventory?: InventoryItem[];
  collectibles?: CollectibleItem[];
  petsData?: (InventoryItem & PetUncaged)[];
  /**
   * @deprecated
   */
  exp: number;
  name?: string | "Unregistered";
  lastModified?: number;
  cassEXP?: any;
  tilesKeys?: string[];
  shopInv?: { [key: string]: boolean };
  boxItems?: InventoryItem[];
  battlePoints: number;
  extensionIDs?: string[];
  [key: string]: any;
  threadInfo?: {
    threadID: string;
    threadName: string;
    emoji: string;
    adminIDs: { id: string }[];
    participantIDs: string[];
    isGroup: boolean;
  };
  tdCreateTime?: {
    timestamp: number;
  };
  userMeta?: {
    name: string;
    image: string;
    url: string;
    desc: string;
  };
  roles?: Array<[string, InputRoles]>;
  groles?: Array<[string, InputRoles]>;
  bankData?: {
    nickname?: string;
    bank: number;
    items?: InventoryItem[];
  };
  links?: [string, string][];
  defaultCommands?: [string, string][];
  gearsData?: Array<{
    items?: InventoryItem[];
    key: string;
    weapon?: WeaponInventoryItem[];
    armors?: ArmorInventoryItem[];
  }>;
  userInfo?: IFCAU_User;
  gardenPlots?: GardenPlot[];
  gardenBarns?: GardenBarn[];
  gardenHeld?: string;
  gardenPets?: GardenPetActive[];
  gardenStats?: GardenStats;
  plotLimit?: number;
  gardenEarns?: number;
  casaieah?: CasaieahRaw;
};

type NullableUserData = {
  [K in keyof UserData]?: UserData[K] | null;
};

// type TypedUserData = UserData & {
//   inventory: Inventory;
//   collectibles: Collectibles;
//   cassEXP: CassEXP;
//   petsData: Inventory;
// };

type UserStatsManager = import("../../handlers/database/handleStat").default;

export {
  UserData,
  InventoryTypes,
  NullableUserData,
  UserStatsManager,
  // TypedUserData,
};
