export type SplitDotRecursive<S extends string> =
  S extends `${infer Head}.${infer Tail}`
    ? [Head, ...SplitDotRecursive<Tail>, ...string[]]
    : [S, ...string[]];

export type SplitPipeRecursive<S extends string> =
  S extends `${infer Head}|${infer Tail}`
    ? [Head, ...SplitPipeRecursive<Tail>, ...string[]]
    : [S, ...string[]];

export type SplitRecursive<
  Sep extends string,
  Str extends string
> = Str extends `${infer Head}${Sep}${infer Tail}`
  ? [Head, ...SplitRecursive<Sep, Tail>, ...string[]]
  : [Str, ...string[]];

export function splitDot<S extends string>(str: S): SplitDotRecursive<S> {
  return str.split(".") as SplitDotRecursive<S>;
}

export function splitPipe<S extends string>(str: S): SplitPipeRecursive<S> {
  return str.split("|") as SplitPipeRecursive<S>;
}

export function splitStr<Sep extends string, Str extends string>(
  separator: Sep,
  str: Str
): SplitRecursive<Sep, Str> {
  return str.split(separator) as SplitRecursive<Sep, Str>;
}

export type PickWithRest<T, K extends keyof T> = Pick<T, K> &
  Partial<Omit<T, K>>;

export type PlainObject<V> = {
  [key: ObjectKey]: V;
};

export type ObjectKey = string | number | symbol;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Overwrite<T, U> = Omit<T, keyof U> & U;

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

export type Serializable =
  | Primitive
  | Serializable[]
  | { [key: string]: Serializable };

export type NonPrimitive<T = unknown> = T extends Primitive ? never : T;

export type UnknownExtra<T> = T & { [key: string]: unknown };

export type UnknownExtraRecursive<T> = T extends Array<infer U>
  ? Array<UnknownExtraRecursive<U>>
  : T extends object
  ? { [K in keyof T]: UnknownExtraRecursive<T[K]> } & { [key: string]: unknown }
  : T;

export type UncheckedArray<T> = Array<T> & {
  [index: number]: T;
};

export function isPrimitive(value: unknown): value is Primitive {
  const type = typeof value;
  return (
    value === null ||
    value === undefined ||
    type === "string" ||
    type === "number" ||
    type === "boolean" ||
    type === "bigint" ||
    type === "symbol"
  );
}

export function isSerializable(value: unknown): value is Serializable {
  if (isPrimitive(value)) return true;

  if (Array.isArray(value)) {
    return value.every(isSerializable);
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).every(isSerializable);
  }

  return false;
}

export function isNonPrimitive<T>(value: T): value is NonPrimitive<T> {
  return !isPrimitive(value);
}

export function overwrite<T, U>(target: T, source: U): Overwrite<T, U> {
  return { ...target, ...source } as Overwrite<T, U>;
}

export function deepMerge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  const result = { ...target } as any;

  for (const key in source) {
    const sourceVal = source[key];
    const targetVal = (target as any)[key];

    if (
      typeof targetVal === "object" &&
      targetVal !== null &&
      typeof sourceVal === "object" &&
      sourceVal !== null &&
      !Array.isArray(sourceVal)
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else {
      result[key] = sourceVal;
    }
  }

  return result;
}

export function pickWithRest<T, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): PickWithRest<T, K> {
  const [pickedEntries, restEntries] = Object.entries(obj).reduce(
    ([picked, rest], [key, value]) => {
      if ((keys as readonly string[]).includes(key)) {
        picked.push([key as K, value as T[K]]);
      } else {
        rest.push([
          key as Exclude<keyof T, K>,
          value as T[Exclude<keyof T, K>],
        ]);
      }
      return [picked, rest];
    },
    [[], []]
  );

  const picked = Object.fromEntries(pickedEntries) as Pick<T, K>;
  const rest = Object.fromEntries(restEntries) as Partial<Omit<T, K>>;

  return { ...picked, ...rest } as PickWithRest<T, K>;
}

export type RandomWithProbParameter<T> = {
  chance: number;
  value: T;
};

/**
 * Normalize and sort array of { chance, value } by descending chance.
 */
export function randomWithProb<T>(
  items: RandomWithProbParameter<T>[]
): RandomWithProbParameter<T>[] {
  const totalChance = items.reduce((sum, item) => sum + item.chance, 0);

  if (totalChance === 0) return [...items];

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
export function pickRandomWithProb<T>(
  items: RandomWithProbParameter<T>[]
): T | undefined {
  const totalChance = items.reduce((sum, item) => sum + item.chance, 0);
  if (totalChance === 0) return undefined;

  const normalized = items.map((item) => ({
    chance: item.chance / totalChance,
    value: item.value,
  }));

  const cumulative = normalized.reduce<number[]>((acc, item, i) => {
    if (i === 0) acc.push(item.chance);
    else acc.push(acc[i - 1] + item.chance);
    return acc;
  }, []);

  const rand = Math.random();

  let low = 0,
    high = cumulative.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (rand < cumulative[mid]) high = mid;
    else low = mid + 1;
  }

  return normalized[low]?.value;
}

export function randomBiased(
  min: number,
  max: number,
  exponent: number
): number {
  const r = Math.random();
  const biased = Math.pow(r, exponent);
  return min + (max - min) * biased;
}

import { DateTime } from "luxon";
import { InventoryItem } from "./cassidyUser";

export function isInTimeRange(
  from: string,
  to: string,
  timezone: string = "Asia/Manila"
): boolean {
  const parse = (timeStr: string, zone: string): DateTime => {
    const t = DateTime.fromFormat(timeStr.toLowerCase(), "ha", { zone });
    if (!t.isValid) throw new Error(`Invalid time: ${timeStr}`);
    return t;
  };

  const now = DateTime.now().setZone(timezone);
  const start = parse(from, timezone);
  const end = parse(to, timezone);

  return start > end ? now >= start || now <= end : now >= start && now <= end;
}

export function calculateInflation(usersData: Record<string, UserData>) {
  if (global.Cassidy.config.disableInflation) {
    return 0;
  }
  let sum = Object.values(usersData)
    .filter((i) => !isNaN(i?.money))
    .reduce((acc, { money = 0 }) => acc + money, 0);
  const bankDatas = Object.values(usersData).filter(
    (i) =>
      typeof i?.bankData === "object" &&
      typeof i.bankData.bank === "number" &&
      !isNaN(i.bankData.bank)
  );
  const bankSum = bankDatas.reduce(
    (acc, { bankData }) => acc + bankData.bank,
    0
  );
  const lendUsers = Object.values(usersData).filter(
    (i) => typeof i?.lendAmount === "number" && !isNaN(i.lendAmount)
  );
  const lendAmounts = lendUsers.reduce(
    (acc, { lendAmount }) => acc + lendAmount,
    0
  );

  const bankMean = bankSum / bankDatas.length;
  let mean = sum / Object.keys(usersData).length;
  !isNaN(bankMean) ? (mean += bankMean) : null;
  const ll = lendAmounts / lendUsers.length;
  !isNaN(ll) ? (mean += ll) : null;

  const getChequeAmount = (items: InventoryItem[]) =>
    items.reduce(
      (acc, j) =>
        j.type === "cheque" &&
        typeof j.chequeAmount === "number" &&
        !isNaN(j.chequeAmount)
          ? j.chequeAmount + acc
          : acc,
      0
    );

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
