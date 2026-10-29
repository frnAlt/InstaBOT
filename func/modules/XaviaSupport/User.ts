/**
 * The original code can be found on https://github.com/XaviaTeam/XaviaBot
 * This version is modified only for the sake of COMPATIBILITY of cassidy with xavia commands.
 * Dependent on @xaviabot/fca-unofficial
 * @XaviaTeam
 * @lianecagara
 */

import { IFCAU_API } from "@xaviabot/fca-unofficial";
import { User } from "./XaviaTypes";
import { isAcceptableNumber } from "./utils";
import { Balance } from "./Balance";

export const _4HOURS = 1000 * 60 * 60 * 4;
export const MAX_EXP = Number.MAX_SAFE_INTEGER;

export default function getCUser(api: IFCAU_API) {
  const DATABASE: string = "MONGO";

  /**
   * Get user info from api
   * @param uid
   * @returns Object info or null
   */
  async function getInfoAPI(uid: string): Promise<User["info"] | null> {
    if (!uid) return null;
    uid = String(uid);
    const info = await api.getUserInfo(uid).catch((_) => []);
    if (info[uid]) {
      updateInfo(uid, { ...info[uid] });

      return info[uid];
    } else {
      create(uid, {});

      return null;
    }
  }

  function makeUserCompatible(user: UserData): User {
    if (!user) {
      return null;
    }
    return {
      data: user,
      banned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userID: user.userID,
    };
  }

  /**
   * Get full user data from Database, if not exist, run create
   * @param uid
   * @returns Object info or null
   */
  async function get(uid: string): Promise<User | null> {
    if (!uid) return null;
    uid = String(uid);
    let userData = await global.Cassidy.databases.usersDB.getCache(uid);

    return makeUserCompatible(userData || null);
  }

  /**
   * Get full user data from Database, if not exist, run create
   * @param uid
   * @returns Object info or null
   */
  function getSync(uid: string): User | null {
    if (!uid) return null;
    uid = String(uid);
    let userData = global.Cassidy.databases.usersDB.cache[uid];

    return makeUserCompatible(userData || null);
  }

  /**
   * Get full users data from Database
   * @param uids
   * @returns Array of user data
   */
  function getAll(uids: string[]): (User | null)[] {
    if (uids && Array.isArray(uids))
      return uids.map((uid) =>
        makeUserCompatible(
          global.Cassidy.databases.usersDB.cache[String(uid)] || null
        )
      );
    else
      return Array.from(
        Object.values(global.Cassidy.databases.usersDB.cache).map((i) =>
          makeUserCompatible(i)
        )
      );
  }

  /**
   * Get user info from database
   * @param uid
   * @returns Object info or null
   */
  async function getInfo(uid: string) {
    if (!uid) return null;
    uid = String(uid);
    const userData = await get(uid);

    return userData?.data?.userMeta || null;
  }

  async function getName(uid: string) {
    if (!uid) return null;
    uid = String(uid);
    const userData = await get(uid);

    return userData?.data?.userMeta?.name || null;
  }

  /**
   * Get user data from database
   * @param uid
   * @returns Object data or null
   */
  async function getData(uid: string) {
    if (!uid) return null;
    uid = String(uid);
    const userData = await get(uid);

    return userData?.data || null;
  }

  /**
   * Update user info
   */
  async function updateInfo(_uid: string, _data: Record<string, any>) {}

  /**
   * Update user data; money will not be included.
   * @param uid
   * @param data
   * @returns Boolean
   */
  async function updateData(uid: string, data: object) {
    if (!uid || !data || typeof data !== "object" || Array.isArray(data))
      return false;
    uid = String(uid);

    try {
      const userData = await get(uid);
      if (userData !== null) {
        if (data.hasOwnProperty("money")) {
          logger(
            "Updating money with updateData method is deprecated, please use Balance instead.",
            "WARN"
          );
        }

        Object.assign(userData.data, data);
        await global.Cassidy.databases.usersDB.setItem(uid, {
          ...userData.data,
        });

        if (DATABASE === "JSON" || DATABASE === "MONGO") {
          return true;
        }
      } else return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Create new user data
   * @param uid
   * @param data
   * @returns Boolean
   */
  async function create(uid: string, data: object) {
    if (!uid || !data) return false;
    uid = String(uid);
    const userData = makeUserCompatible(
      (await global.Cassidy.databases.usersDB.getCache(uid)) || null
    );

    if (!userData.data)
      userData.data = {
        exp: 1,
        money: 0,
        battlePoints: 0,
      };

    Object.assign(userData.info, data);

    global.Cassidy.databases.usersDB.setItem(uid, {
      ...userData.data,
    });

    return;
  }

  function increaseExp(uid: string, amount: number, _withEffect: boolean) {
    if (!uid || !amount) return false;
    if (!isAcceptableNumber(amount)) return false;

    uid = String(uid);

    try {
      const userData = getSync(uid);
      if (userData !== null) {
        let finalNumber =
          Math.floor(userData.data.exp || 0) + Math.floor(amount);

        if (finalNumber > MAX_EXP) finalNumber = MAX_EXP;
        else if (finalNumber < 0) finalNumber = 0;

        userData.data.exp = finalNumber;
        global.Cassidy.databases.usersDB.setItem(uid, {
          ...userData.data,
        });

        if (DATABASE === "JSON" || DATABASE === "MONGO") {
          return true;
        }
      } else return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function decreaseExp(uid: string, amount: number) {
    if (!uid || !amount) return false;
    if (!isAcceptableNumber(amount)) return false;

    uid = String(uid);

    try {
      const userData = getSync(uid);
      if (userData !== null) {
        let finalNumber =
          Math.floor(userData.data.exp || 0) - Math.floor(amount);

        if (finalNumber > MAX_EXP) finalNumber = MAX_EXP;
        else if (finalNumber < 0) finalNumber = 0;

        userData.data.exp = finalNumber;
        global.Cassidy.databases.usersDB.setItem(uid, {
          ...userData.data,
        });

        if (DATABASE === "JSON" || DATABASE === "MONGO") {
          return true;
        }
      } else return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   *
   * @param uid
   * @returns exp as Number or null
   */
  function getExp(uid: string) {
    if (!uid) return null;
    uid = String(uid);
    const userData = getSync(uid);
    if (userData !== null) {
      return Math.floor(userData.data.exp || 0);
    } else return null;
  }

  /**
   * @deprecated just use the damn balance.get
   * @param uid
   * @returns money as Number or null
   */
  function getMoney(uid: string) {
    return Number(Balance.get(uid));
  }

  /**
   * @deprecated just use the damn balance.set
   */
  function increaseMoney(
    uid: string,
    amount: number,
    _withEffect: boolean = true
  ) {
    const big = getMoney(uid);
    return Balance.set(uid, big + Number(amount));
  }

  /**
   * @deprecated just use the damn balance.set
   */
  function decreaseMoney(uid: string, amount: number) {
    const big = getMoney(uid);
    return Balance.set(uid, big - Number(amount));
  }

  return {
    get,
    getAll,
    getInfo,
    getName,
    getData,
    updateInfo,
    updateData,
    create,
    getExp,
    increaseExp,
    decreaseExp,
    getMoney,
    increaseMoney,
    decreaseMoney,
    getSync,
    getInfoAPI,
    makeUserCompatible,
  };
}
