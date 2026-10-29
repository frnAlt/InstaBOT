"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MintManager = void 0;
exports.isInvalidAm = isInvalidAm;
exports.convertMintToCll = convertMintToCll;
exports.convertCllToMint = convertCllToMint;
exports.formatMint = formatMint;
exports.getTokens = getTokens;
exports.getTokensInfo = getTokensInfo;
exports.getUpdatedTokens = getUpdatedTokens;
exports.updatedTokensInfo = updatedTokensInfo;
exports.formatTokens = formatTokens;
const InventoryEnhanced_1 = require("@cass-modules/InventoryEnhanced");
const ArielUtils_1 = require("./ArielUtils");
const unisym_1 = require("./unisym");
function isInvalidAm(amount, balance) {
    return isNaN(amount) || amount < 1 || amount > balance;
}
function convertMintToCll(mint) {
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
function convertCllToMint(cll, asset) {
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
async function formatMint(mint, usersDB) {
    const { name = "???" } = await usersDB.getCache(mint.author);
    return `${mint.icon} **${mint.name}** [${mint.id}]\n**By ${name}**\n**Since**: ${(0, unisym_1.formatTime)(Date.now() - mint.creationDate)}\n🪙 **Market Value**: ${(0, ArielUtils_1.formatCash)(mint.asset / (mint.copies || 1) || 0, true)} each.\n📋 **Copies**: ${mint.copies || 1}\n💸 **Total Asset**: ${(0, ArielUtils_1.formatCash)(mint.asset, true)}`;
}
class MintManager {
    mints;
    static MINT_KEY = "mints";
    static MINT_LIMIT = 8;
    constructor(mints) {
        this.mints = mints ?? {};
    }
    static async fromDB(globalDB) {
        const data = (await globalDB.getCache(MintManager.MINT_KEY));
        const allCache = Cassidy.databases.usersDB.isMongo
            ? await Cassidy.databases.usersDB.queryItemAll({
                "value.collectibles": { $exists: true },
            }, "collectibles")
            : await Cassidy.databases.usersDB.getAllCache();
        const mints = MintManager.updateCopies(data.mints ?? {}, allCache);
        return new MintManager(mints);
    }
    static flatAllCllOld(userData) {
        const amountsMap = new Map();
        const allItems = Object.values(userData).flatMap((u) => u.collectibles);
        for (const item of allItems) {
            const key = item?.metadata?.key;
            if (!key)
                continue;
            const existing = amountsMap.get(key);
            if (existing) {
                existing.amount = (existing.amount || 0) + (item.amount || 0);
            }
            else {
                amountsMap.set(key, { ...item });
            }
        }
        return Array.from(amountsMap.values());
    }
    static flatAllCll(userData) {
        return Array.from(Object.values(userData)
            .reduce((amountsMap, user) => {
            user.collectibles?.forEach((item) => {
                const key = item?.metadata?.key;
                if (key) {
                    const existing = amountsMap.get(key);
                    if (existing) {
                        existing.amount += item.amount || 0;
                    }
                    else {
                        amountsMap.set(key, { ...item });
                    }
                }
            });
            return amountsMap;
        }, new Map())
            .values());
    }
    static updateCopies(mintsx, userData) {
        const cll = new InventoryEnhanced_1.Collectibles(MintManager.flatAllCll(userData));
        const result = {};
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
    raw() {
        return { mints: this.mints };
    }
    async saveBy(globalDB) {
        await globalDB.setItem(MintManager.MINT_KEY, this.raw());
    }
    getAllMints() {
        return this.mints;
    }
    getUserMints(userId) {
        return this.mints[userId] ?? [];
    }
    getMintById(tokenId) {
        const allMints = Object.values(this.mints ?? {}).flat();
        return allMints.find((m) => m.id === tokenId) || null;
    }
    createMint(userId, mint) {
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
    updateMint(userId, updatedMint) {
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
    deleteMint(userId, tokenId) {
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
    getTopMints(by, limit = 10) {
        const mints = this.mints;
        const allMints = Object.entries(mints).flatMap(([author, mintUser]) => mintUser.map((mintItem) => ({ author, mintItem })));
        return allMints
            .sort((a, b) => by === "copies"
            ? (b.mintItem.copies || 1) - (a.mintItem.copies || 1)
            : (b.mintItem.asset || 0) - (a.mintItem.asset || 0))
            .slice(0, limit);
    }
    findExistingMint(target, mints) {
        return Object.entries(mints ?? {})
            .filter(([, mintUser]) => mintUser?.some((mintItem) => mintItem.name === target.name || mintItem.id === target.id))
            .map(([author, mintUser]) => {
            return mintUser
                ?.filter((mintItem) => mintItem.name === target.name || mintItem.id === target.id)
                .map((mintItem) => ({ author, mintItem }));
        })
            .flat();
    }
}
exports.MintManager = MintManager;
function getTokens(id, rawCLL) {
    const cll = new InventoryEnhanced_1.Collectibles(rawCLL ?? []);
    const amount = cll.getAmount(`mtls_${id}`);
    return amount;
}
function getTokensInfo(id, userData) {
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
    const cll = new InventoryEnhanced_1.Collectibles(userData.collectibles ?? []);
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
function getUpdatedTokens(id, userData, amount) {
    const ID = `mtls_${id}`;
    const cll = new InventoryEnhanced_1.Collectibles(userData.collectibles ?? []);
    cll.raise(-cll.getAmount(ID));
    cll.raise(amount);
    return cll;
}
function updatedTokensInfo(infoT, amount) {
    if (infoT.isMoney) {
        return { money: amount };
    }
    const ID = infoT.metadata.key;
    const cll = new InventoryEnhanced_1.Collectibles(infoT.userData.collectibles ?? []);
    cll.raise(ID, -cll.getAmount(ID));
    cll.raise(ID, Math.abs(amount));
    return {
        collectibles: Array.from(cll),
    };
}
function formatTokens(infoT, amount) {
    if (infoT.isMoney) {
        return (0, ArielUtils_1.formatCash)(amount, true);
    }
    return `${(0, ArielUtils_1.formatValue)(amount, infoT.metadata.icon, true)}`;
}
