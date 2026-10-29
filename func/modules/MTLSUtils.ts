import { Collectibles } from "@cass-modules/InventoryEnhanced";
import { formatCash, formatValue } from "./ArielUtils";
import { CollectibleItem, UserStatsManager } from "./cassidyUser";
import { formatTime } from "./unisym";

export function isInvalidAm(amount: number, balance: number) {
  return isNaN(amount) || amount < 1 || amount > balance;
}

export interface MintUser extends Array<MintItem> {}

export interface MintItem {
  readonly name: string;
  readonly id: string;
  readonly icon: string;
  asset: number;
  copies: number;
  readonly author: string;
  readonly creationDate: number;
}

export interface Mints extends Partial<UserData> {
  mints?: Record<string, MintUser>;
}

export function convertMintToCll(mint: MintItem) {
  return {
    key: `mtls_${mint.id}`,
    name: mint.name,
    flavorText: "Minted from MTLS.",
    icon: mint.icon,
    type: "MTLS",
    author: mint.author,
    creationDate: mint.creationDate ?? Date.now(),
    copies: mint.copies,
  };
}

export function convertCllToMint(
  cll: ReturnType<typeof convertMintToCll>,
  asset: number
): MintItem {
  const id = cll.key.replace("mtls_", "");

  return {
    id: id,
    name: cll.name,
    icon: cll.icon,
    asset,
    author: cll.author,
    creationDate: cll.creationDate,
    copies: cll.copies,
  };
}

export async function formatMint(mint: MintItem, usersDB: UserStatsManager) {
  const { name = "???" } = await usersDB.getCache(mint.author);
  return `${mint.icon} **${mint.name}** [${
    mint.id
  }]\n**By ${name}**\n**Since**: ${formatTime(
    Date.now() - mint.creationDate
  )}\n🪙 **Market Value**: ${formatCash(
    mint.asset / (mint.copies || 1) || 0,
    true
  )} each.\n📋 **Copies**: ${
    mint.copies || 1
  }\n💸 **Total Asset**: ${formatCash(mint.asset, true)}`;
}

export class MintManager {
  public mints: Mints["mints"];
  public static readonly MINT_KEY = "mints";
  public static readonly MINT_LIMIT = 8;

  public constructor(mints: Mints["mints"]) {
    this.mints = mints ?? {};
  }

  static async fromDB(globalDB: UserStatsManager): Promise<MintManager> {
    const data = (await globalDB.getCache(MintManager.MINT_KEY)) as Mints;
    const allCache = Cassidy.databases.usersDB.isMongo
      ? await Cassidy.databases.usersDB.queryItemAll(
          {
            "value.collectibles": { $exists: true },
          },
          "collectibles"
        )
      : await Cassidy.databases.usersDB.getAllCache();

    const mints = MintManager.updateCopies(data.mints ?? {}, allCache);
    return new MintManager(mints);
  }

  static flatAllCllOld(
    userData: Record<string, Partial<UserData>>
  ): CollectibleItem[] {
    const amountsMap = new Map<string, CollectibleItem>();

    const allItems = Object.values(userData).flatMap((u) => u.collectibles);

    for (const item of allItems) {
      const key = item?.metadata?.key;
      if (!key) continue;

      const existing = amountsMap.get(key);
      if (existing) {
        existing.amount = (existing.amount || 0) + (item.amount || 0);
      } else {
        amountsMap.set(key, { ...item });
      }
    }

    return Array.from(amountsMap.values());
  }

  static flatAllCll(
    userData: Record<string, Partial<UserData>>
  ): CollectibleItem[] {
    return Array.from(
      Object.values(userData)
        .reduce((amountsMap, user) => {
          user.collectibles?.forEach((item) => {
            const key = item?.metadata?.key;
            if (key) {
              const existing = amountsMap.get(key);
              if (existing) {
                existing.amount += item.amount || 0;
              } else {
                amountsMap.set(key, { ...item });
              }
            }
          });
          return amountsMap;
        }, new Map<string, CollectibleItem>())
        .values()
    );
  }

  static updateCopies(
    mintsx: Mints["mints"],
    userData: Record<string, Partial<UserData>>
  ): Mints["mints"] {
    const cll = new Collectibles(MintManager.flatAllCll(userData));
    const result: Mints["mints"] = {};

    for (const [author, mints] of Object.entries(mintsx)) {
      result[author] = (mints ?? []).map((mint) => {
        const target = cll.get(`mtls_${mint.id}`);
        const origCopies = mint.copies || 1;
        const updatedCopies = target?.amount ?? origCopies;

        let newAssets = mint.asset;

        if (updatedCopies !== origCopies && origCopies > 0) {
          newAssets *= updatedCopies / origCopies;
        }

        return { ...mint, copies: updatedCopies, asset: newAssets };
      });
    }

    return result;
  }

  raw(): Mints {
    return { mints: this.mints };
  }

  async saveBy(globalDB: UserStatsManager): Promise<void> {
    await globalDB.setItem(MintManager.MINT_KEY, this.raw());
  }

  getAllMints(): Mints["mints"] {
    return this.mints;
  }

  getUserMints(userId: string): MintUser {
    return this.mints[userId] ?? [];
  }

  getMintById(tokenId: string): MintItem | null {
    const allMints = Object.values(this.mints ?? {}).flat();
    return allMints.find((m) => m.id === tokenId) || null;
  }

  createMint(
    userId: string,
    mint: MintItem
  ): { success: boolean; error?: string; existingMint?: MintItem } {
    const mints = this.mints;
    const userMints = mints[userId] ?? [];

    if (userMints.length >= MintManager.MINT_LIMIT) {
      return { success: false, error: "Mint limit reached" };
    }

    const existing = this.findExistingMint(mint, mints);
    if (existing.length > 0) {
      return {
        success: false,
        error: "Mint already exists",
        existingMint: existing[0].mintItem,
      };
    }

    userMints.push(mint);
    mints[userId] = userMints;
    this.mints = mints;
    return { success: true };
  }

  updateMint(userId: string, updatedMint: MintItem): boolean {
    const mints = this.mints;
    const userMints = mints[userId] ?? [];

    const mintIndex = userMints.findIndex((m) => m.id === updatedMint.id);
    if (mintIndex === -1) {
      return false;
    }

    userMints[mintIndex] = updatedMint;
    mints[userId] = userMints;
    this.mints = mints;
    return true;
  }

  deleteMint(userId: string, tokenId: string): MintItem | null {
    const mints = this.mints;
    const userMints = mints[userId] ?? [];

    const mintIndex = userMints.findIndex((m) => m.id === tokenId);
    if (mintIndex === -1) {
      return null;
    }

    const [deletedMint] = userMints.splice(mintIndex, 1);
    mints[userId] = userMints;
    this.mints = mints;
    return deletedMint;
  }

  getTopMints(
    by: "copies" | "asset",
    limit: number = 10
  ): { author: string; mintItem: MintItem }[] {
    const mints = this.mints;
    const allMints = Object.entries(mints).flatMap(([author, mintUser]) =>
      mintUser.map((mintItem) => ({ author, mintItem }))
    );

    return allMints
      .sort((a, b) =>
        by === "copies"
          ? (b.mintItem.copies || 1) - (a.mintItem.copies || 1)
          : (b.mintItem.asset || 0) - (a.mintItem.asset || 0)
      )
      .slice(0, limit);
  }

  public findExistingMint(
    target: MintItem,
    mints: Mints["mints"]
  ): Array<{ author: string; mintItem: MintItem }> {
    return Object.entries(mints ?? {})
      .filter(([, mintUser]) =>
        mintUser?.some(
          (mintItem) =>
            mintItem.name === target.name || mintItem.id === target.id
        )
      )
      .map(([author, mintUser]) => {
        return mintUser
          ?.filter(
            (mintItem) =>
              mintItem.name === target.name || mintItem.id === target.id
          )
          .map((mintItem) => ({ author, mintItem }));
      })
      .flat();
  }
}

export function getTokens(
  id: string,
  rawCLL: UserData["collectibles"]
): number {
  const cll = new Collectibles(rawCLL ?? []);
  const amount = cll.getAmount(`mtls_${id}`);
  return amount;
}

export function getTokensInfo(
  id: string | "money",
  userData: UserData
): {
  amount: number;
  metadata: CollectibleItem["metadata"];
  isMoney: boolean;
  userData: UserData;
  refKey: string;
} {
  if (id === "money") {
    return {
      amount: userData.money,
      isMoney: true,
      metadata: {
        icon: "💵",
        key: "money",
        limit: null,
        name: "Money",
        type: "",
      },
      userData,
      refKey: "money",
    };
  }
  const cll = new Collectibles(userData.collectibles ?? []);
  const ID = `mtls_${id}`;
  const amount = cll.getAmount(ID);
  return {
    amount,
    metadata: cll.getMeta(ID) ?? {
      icon: "❓",
      key: "",
      limit: null,
      name: "Unknown",
      type: "",
    },
    isMoney: false,
    userData,
    refKey: id,
  };
}

export function getUpdatedTokens(
  id: string,
  userData: Mints,
  amount: number
): Collectibles {
  const ID = `mtls_${id}`;
  const cll = new Collectibles(userData.collectibles ?? []);
  cll.raise(-cll.getAmount(ID));
  cll.raise(amount);
  return cll;
}

export function updatedTokensInfo(
  infoT: ReturnType<typeof getTokensInfo>,
  amount: number
): Partial<UserData> {
  if (infoT.isMoney) {
    return { money: amount };
  }
  const ID = infoT.metadata.key;
  const cll = new Collectibles(infoT.userData.collectibles ?? []);
  cll.raise(ID, -cll.getAmount(ID));
  cll.raise(ID, Math.abs(amount));
  return {
    collectibles: Array.from(cll),
  };
}

export function formatTokens(
  infoT: ReturnType<typeof getTokensInfo>,
  amount: number
) {
  if (infoT.isMoney) {
    return formatCash(amount, true);
  }
  return `${formatValue(amount, infoT.metadata.icon, true)}`;
}
