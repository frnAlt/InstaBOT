"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitDot = splitDot;
exports.splitPipe = splitPipe;
exports.splitStr = splitStr;
exports.isPrimitive = isPrimitive;
exports.isSerializable = isSerializable;
exports.isNonPrimitive = isNonPrimitive;
exports.overwrite = overwrite;
exports.deepMerge = deepMerge;
exports.pickWithRest = pickWithRest;
exports.randomWithProb = randomWithProb;
exports.pickRandomWithProb = pickRandomWithProb;
exports.randomBiased = randomBiased;
exports.isInTimeRange = isInTimeRange;
exports.calculateInflation = calculateInflation;
function splitDot(str) {
    return str.split(".");
}
function splitPipe(str) {
    return str.split("|");
}
function splitStr(separator, str) {
    return str.split(separator);
}
function isPrimitive(value) {
    const type = typeof value;
    return (value === null ||
        value === undefined ||
        type === "string" ||
        type === "number" ||
        type === "boolean" ||
        type === "bigint" ||
        type === "symbol");
}
function isSerializable(value) {
    if (isPrimitive(value))
        return true;
    if (Array.isArray(value)) {
        return value.every(isSerializable);
    }
    if (typeof value === "object" && value !== null) {
        return Object.values(value).every(isSerializable);
    }
    return false;
}
function isNonPrimitive(value) {
    return !isPrimitive(value);
}
function overwrite(target, source) {
    return { ...target, ...source };
}
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        const sourceVal = source[key];
        const targetVal = target[key];
        if (typeof targetVal === "object" &&
            targetVal !== null &&
            typeof sourceVal === "object" &&
            sourceVal !== null &&
            !Array.isArray(sourceVal)) {
            result[key] = deepMerge(targetVal, sourceVal);
        }
        else {
            result[key] = sourceVal;
        }
    }
    return result;
}
function pickWithRest(obj, keys) {
    const [pickedEntries, restEntries] = Object.entries(obj).reduce(([picked, rest], [key, value]) => {
        if (keys.includes(key)) {
            picked.push([key, value]);
        }
        else {
            rest.push([
                key,
                value,
            ]);
        }
        return [picked, rest];
    }, [[], []]);
    const picked = Object.fromEntries(pickedEntries);
    const rest = Object.fromEntries(restEntries);
    return { ...picked, ...rest };
}
/**
 * Normalize and sort array of { chance, value } by descending chance.
 */
function randomWithProb(items) {
    const totalChance = items.reduce((sum, item) => sum + item.chance, 0);
    if (totalChance === 0)
        return [...items];
    const normalized = items.map((item) => ({
        chance: item.chance / totalChance,
        value: item.value,
    }));
    normalized.sort((a, b) => b.chance - a.chance);
    return normalized;
}
/**
 * Picks a random value from items weighted by chance.
 */
function pickRandomWithProb(items) {
    const totalChance = items.reduce((sum, item) => sum + item.chance, 0);
    if (totalChance === 0)
        return undefined;
    const normalized = items.map((item) => ({
        chance: item.chance / totalChance,
        value: item.value,
    }));
    const cumulative = normalized.reduce((acc, item, i) => {
        if (i === 0)
            acc.push(item.chance);
        else
            acc.push(acc[i - 1] + item.chance);
        return acc;
    }, []);
    const rand = Math.random();
    let low = 0, high = cumulative.length - 1;
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (rand < cumulative[mid])
            high = mid;
        else
            low = mid + 1;
    }
    return normalized[low]?.value;
}
function randomBiased(min, max, exponent) {
    const r = Math.random();
    const biased = Math.pow(r, exponent);
    return min + (max - min) * biased;
}
const luxon_1 = require("luxon");
function isInTimeRange(from, to, timezone = "Asia/Manila") {
    const parse = (timeStr, zone) => {
        const t = luxon_1.DateTime.fromFormat(timeStr.toLowerCase(), "ha", { zone });
        if (!t.isValid)
            throw new Error(`Invalid time: ${timeStr}`);
        return t;
    };
    const now = luxon_1.DateTime.now().setZone(timezone);
    const start = parse(from, timezone);
    const end = parse(to, timezone);
    return start > end ? now >= start || now <= end : now >= start && now <= end;
}
function calculateInflation(usersData) {
    if (global.Cassidy.config.disableInflation) {
        return 0;
    }
    let sum = Object.values(usersData)
        .filter((i) => !isNaN(i?.money))
        .reduce((acc, { money = 0 }) => acc + money, 0);
    const bankDatas = Object.values(usersData).filter((i) => typeof i?.bankData === "object" &&
        typeof i.bankData.bank === "number" &&
        !isNaN(i.bankData.bank));
    const bankSum = bankDatas.reduce((acc, { bankData }) => acc + bankData.bank, 0);
    const lendUsers = Object.values(usersData).filter((i) => typeof i?.lendAmount === "number" && !isNaN(i.lendAmount));
    const lendAmounts = lendUsers.reduce((acc, { lendAmount }) => acc + lendAmount, 0);
    const bankMean = bankSum / bankDatas.length;
    let mean = sum / Object.keys(usersData).length;
    !isNaN(bankMean) ? (mean += bankMean) : null;
    const ll = lendAmounts / lendUsers.length;
    !isNaN(ll) ? (mean += ll) : null;
    const getChequeAmount = (items) => items.reduce((acc, j) => j.type === "cheque" &&
        typeof j.chequeAmount === "number" &&
        !isNaN(j.chequeAmount)
        ? j.chequeAmount + acc
        : acc, 0);
    const invAmounts = Object.values(usersData).reduce((total, userData) => {
        let userTotal = 0;
        if (Array.isArray(userData.inventory)) {
            userTotal += getChequeAmount(userData.inventory);
        }
        if (Array.isArray(userData.boxItems)) {
            userTotal += getChequeAmount(userData.boxItems);
        }
        if (Array.isArray(userData.tradeVentory)) {
            userTotal += getChequeAmount(userData.tradeVentory);
        }
        return total + userTotal;
    }, 0);
    mean += invAmounts;
    if (isNaN(mean)) {
        return 0;
    }
    return (mean / 100_000_000) ** (1 / 5);
}
