/**
 * The original code can be found on https://github.com/XaviaTeam/XaviaBot
 * This version is modified only for the sake of COMPATIBILITY of cassidy with xavia commands.
 * THIS DOES NOT USE BIGINT for database reasons.
 * @XaviaTeam
 * @lianecagara
 */

export class Balance {
  constructor() {}

  static MAX_BALANCE_LIMIT = BigInt(Number.MAX_VALUE); // -1: no limit (not safe)

  static setLimit(amount: number | bigint | string) {
    const parsedAmount = Balance.makeSafe(amount);
    Balance.MAX_BALANCE_LIMIT = parsedAmount == null ? -1n : parsedAmount;
  }

  /**
   * Make balance
   */
  static make(...num: (number | bigint | string)[]): bigint {
    return BigInt(num.reduce((acc, cur) => BigInt(acc) + BigInt(cur), 0n));
  }

  /**
   * Make balance, return null if error instead
   */
  static makeSafe(...num: (number | bigint | string)[]): bigint | null {
    try {
      return Balance.make(...num);
    } catch {
      return null;
    }
  }

  static add(userID: string, ...amount: (number | bigint)[]) {
    const targetUser = global.Cassidy.databases.usersDB.cache[userID];
    if (!targetUser)
      throw new BalanceError(
        "USER_NOT_EXISTS",
        `User "${userID}" not available.`
      );
    if (!targetUser)
      throw new BalanceError(
        "UNEXPECTED",
        "This should not occur. If you encounter this issue, please report it to the creator."
      );

    let newAmount = Balance.make(targetUser[BIG_MONEY_KEY] ?? 0, ...amount);
    if (Balance.MAX_BALANCE_LIMIT != -1n) {
      newAmount =
        newAmount > Balance.MAX_BALANCE_LIMIT
          ? Balance.MAX_BALANCE_LIMIT
          : newAmount;
    }
    targetUser[BIG_MONEY_KEY] = Number(newAmount < 0 ? 0 : newAmount);
    return global.Cassidy.databases.usersDB.setItem(userID, {
      [BIG_MONEY_KEY]: Number(targetUser[BIG_MONEY_KEY]),
    });
  }

  static sub(userID: string, ...amount: (number | bigint)[]) {
    const targetUser = global.Cassidy.databases.usersDB.cache[userID];
    if (!targetUser)
      throw new BalanceError(
        "USER_NOT_EXISTS",
        `User "${userID}" not available.`
      );
    if (!targetUser)
      throw new BalanceError(
        "UNEXPECTED",
        "This should not occur. If you encounter this issue, please report it to the creator."
      );

    let newAmount = Balance.make(
      targetUser[BIG_MONEY_KEY],
      ...amount.map((n) => BigInt(n) * -1n)
    );
    if (Balance.MAX_BALANCE_LIMIT != -1n) {
      newAmount =
        newAmount > Balance.MAX_BALANCE_LIMIT
          ? Balance.MAX_BALANCE_LIMIT
          : newAmount;
    }
    targetUser[BIG_MONEY_KEY] = Number(newAmount < 0 ? 0 : newAmount);
    return global.Cassidy.databases.usersDB.setItem(userID, {
      [BIG_MONEY_KEY]: Number(targetUser[BIG_MONEY_KEY]),
    });
  }

  /**
   *
   * @param {string} userID
   */
  static get(userID: string) {
    const targetUser = global.Cassidy.databases.usersDB.cache[userID];
    if (!targetUser)
      throw new BalanceError(
        "USER_NOT_EXISTS",
        `User "${userID}" not available.`
      );
    if (!targetUser)
      throw new BalanceError(
        "UNEXPECTED",
        "This should not occur. If you encounter this issue, please report it to the creator."
      );

    return BigInt(targetUser[BIG_MONEY_KEY] ?? 0);
  }

  /**
   *
   * @param {string} userID
   * @param {number | bigint} amount
   */
  static set(userID: string, amount: number | bigint) {
    const targetUser = global.Cassidy.databases.usersDB.cache[userID];
    if (!targetUser)
      throw new BalanceError(
        "USER_NOT_EXISTS",
        `User "${userID}" not available.`
      );
    if (!targetUser)
      throw new BalanceError(
        "UNEXPECTED",
        "This should not occur. If you encounter this issue, please report it to the creator."
      );

    const isLimitExceed =
      Balance.MAX_BALANCE_LIMIT != -1n && amount > Balance.MAX_BALANCE_LIMIT;
    targetUser[BIG_MONEY_KEY] = Number(
      Balance.make(isLimitExceed ? Balance.MAX_BALANCE_LIMIT : amount)
    );
    return global.Cassidy.databases.usersDB.setItem(userID, {
      [BIG_MONEY_KEY]: Number(targetUser[BIG_MONEY_KEY]),
    });
  }

  static from(userID: string) {
    if (!global.Cassidy.databases.usersDB.cache[userID]) return null;

    return {
      add: (...amount: (number | bigint)[]) => Balance.add(userID, ...amount),

      sub: (...amount: (number | bigint)[]) => Balance.sub(userID, ...amount),
      get: () => Balance.get(userID),

      set: (amount: number | bigint) => Balance.set(userID, amount),
    };
  }
}

export type BalanceFrom = ReturnType<(typeof Balance)["from"]>;
export type BalanceMake = BalanceFrom & {
  from: (typeof Balance)["from"];
  make: (typeof Balance)["make"];
  makeSafe: (typeof Balance)["makeSafe"];
};

export const ErrorName = {
  UNEXPECTED: "UnexpectedError",
  USER_NOT_EXISTS: "UserNotFoundError",
} as const;

export class BalanceError extends Error {
  constructor(name: keyof typeof ErrorName, message: string) {
    super(message);
    this.name = name;
  }
}

export const BIG_MONEY_KEY = "money";

export function makeBalanceCTX(userID: string): BalanceMake {
  return {
    from: Balance.from,
    make: Balance.make,
    makeSafe: Balance.makeSafe,
    ...Balance.from(userID),
  };
}
