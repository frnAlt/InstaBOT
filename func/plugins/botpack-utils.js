// @ts-check

export const meta = {
  name: "botpack-utils",
  author: "Botpack | Mirai | Liane Cagara",
  version: "3.0.0",
  description:
    "Important utils like Users, Threads, and Currencies to make them compatible with Cassidy.",
  supported: "^1.0.0",
  order: 2,
  type: "plugin",
  expect: ["Users", "Threads"],
};

export function createUsers() {
  const { api } = global;
  const { usersDB } = global.Cassidy.databases;

  // @ts-ignore
  async function saveData(data) {}

  async function getInfo() {
    throw new Error("Users.getInfo is deprecated.");
  }

  /**
   *
   * @param {string | number} userID
   * @returns
   */
  async function getNameUser(userID) {
    if (!userID) throw new Error("User ID cannot be blank");
    const { [userID]: user } = await usersDB.getUserInfo([String(userID)]);
    return user?.name || "Facebook users";
  }

  /**
   *
   * @param {string} id
   * @returns
   */
  async function getUserFull(id) {
    try {
      const response = await api.httpGet(
        `https://graph.facebook.com/${id}?fields=email,about,birthday,link&access_token=${global.Cassidy.accessToken}`
      );
      const userInfo = JSON.parse(response);
      return {
        error: 0,
        author: "D-Jukie",
        data: {
          uid: userInfo.id || null,
          about: userInfo.about || null,
          link: userInfo.link || null,
          imgavt: `https://graph.facebook.com/${userInfo.id}/picture?height=1500&width=1500&access_token=1073911769817594|aa417da57f9e260d1ac1ec4530b417de`,
        },
      };
    } catch (error) {
      return { error: 1, author: "D-Jukie", data: {} };
    }
  }

  /**
   *
   * @param {string[]} keys
   * @param {any} callback
   * @returns
   */
  async function getAll(keys = [], callback = undefined) {
    try {
      if (!keys) return usersDB.getAllCache();
      if (!Array.isArray(keys))
        throw new Error("The input parameter must be an array");
      const data = Object.entries(await usersDB.getAllCache()).map(
        ([userID, userData]) => {
          const user = { ID: userID };
          keys.forEach((key) => (user[key] = userData[key]));
          return user;
        }
      );
      callback?.(null, data);
      return data;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  /**
   *
   * @param {string | number} userID
   * @param {any} callback
   * @returns
   */
  async function getData(userID, callback = undefined) {
    try {
      if (!userID) throw new Error("User ID cannot be blank");
      const data = await usersDB.getItem(String(userID));
      callback?.(null, data);
      return data;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  /**
   *
   * @param {string | number} userID
   * @param {Partial<UserData>} options
   * @param {any} callback
   * @returns
   */
  async function setData(userID, options, callback = undefined) {
    try {
      if (!userID) throw new Error("User ID cannot be blank");
      await usersDB.setItem(String(userID), { ...options });
      const n = await usersDB.getCache(String(userID));
      callback?.(null, n);
      return n;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  /**
   *
   * @param {string | number} userID
   * @param {any} callback
   * @returns
   */
  async function delData(userID, callback = undefined) {
    try {
      if (!userID) throw new Error("User ID cannot be blank");

      await usersDB.deleteItem(String(userID));
      callback?.(null, await usersDB.getAllCache());
      return await usersDB.getAllCache();
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  /**
   *
   * @param {string} userID
   * @param {any} callback
   */
  // @ts-ignore
  async function createData(userID, callback) {}

  return {
    getInfo,
    getNameUser,
    getAll,
    getData,
    setData,
    delData,
    createData,
    getUserFull,
  };
}

export function createThreads() {
  const { api } = global;
  const { threadsDB } = global.Cassidy.databases;

  // @ts-ignore
  async function saveData(data) {}

  async function getInfo() {
    throw new Error("Users.getInfo is deprecated.");
  }

  /**
   *
   * @param {string | number} userID
   * @returns
   */
  async function getNameUser(userID) {
    if (!userID) throw new Error("User ID cannot be blank");
    const { [userID]: user } = await threadsDB.getUserInfo([String(userID)]);
    return user?.name || "Facebook users";
  }

  /**
   *
   * @param {string} id
   * @returns
   */
  async function getUserFull(id) {
    try {
      const response = await api.httpGet(
        `https://graph.facebook.com/${id}?fields=email,about,birthday,link&access_token=${global.Cassidy.accessToken}`
      );
      const userInfo = JSON.parse(response);
      return {
        error: 0,
        author: "D-Jukie",
        data: {
          uid: userInfo.id || null,
          about: userInfo.about || null,
          link: userInfo.link || null,
          imgavt: `https://graph.facebook.com/${userInfo.id}/picture?height=1500&width=1500&access_token=1073911769817594|aa417da57f9e260d1ac1ec4530b417de`,
        },
      };
    } catch (error) {
      return { error: 1, author: "D-Jukie", data: {} };
    }
  }

  /**
   *
   * @param {string[]} keys
   * @param {any} callback
   * @returns
   */
  async function getAll(keys = [], callback = undefined) {
    try {
      if (!keys) return threadsDB.getAllCache();
      if (!Array.isArray(keys))
        throw new Error("The input parameter must be an array");
      const data = Object.entries(await threadsDB.getAllCache()).map(
        ([userID, userData]) => {
          const user = { ID: userID };
          keys.forEach((key) => (user[key] = userData[key]));
          return user;
        }
      );
      callback?.(null, data);
      return data;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  /**
   *
   * @param {string | number} userID
   * @param {any} callback
   * @returns
   */
  async function getData(userID, callback = undefined) {
    try {
      if (!userID) throw new Error("User ID cannot be blank");
      const data = await threadsDB.getItem(String(userID));
      callback?.(null, data);
      return data;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  /**
   *
   * @param {string | number} userID
   * @param {Partial<UserData>} options
   * @param {any} callback
   * @returns
   */
  async function setData(userID, options, callback = undefined) {
    try {
      if (!userID) throw new Error("User ID cannot be blank");
      await threadsDB.setItem(String(userID), { ...options });
      const n = await threadsDB.getCache(String(userID));
      callback?.(null, n);
      return n;
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  /**
   *
   * @param {string | number} userID
   * @param {any} callback
   * @returns
   */
  async function delData(userID, callback = undefined) {
    try {
      if (!userID) throw new Error("User ID cannot be blank");

      await threadsDB.deleteItem(String(userID));
      callback?.(null, await threadsDB.getAllCache());
      return await threadsDB.getAllCache();
    } catch (error) {
      callback?.(error, null);
      return false;
    }
  }

  /**
   *
   * @param {string} userID
   * @param {any} callback
   */
  // @ts-ignore
  async function createData(userID, callback) {}

  return {
    getInfo,
    getNameUser,
    getAll,
    getData,
    setData,
    delData,
    createData,
    getUserFull,
  };
}
/**
 * @type {ReturnType<typeof createUsers>}
 */
let Users;
/**
 * @type {ReturnType<typeof createThreads>}
 */
let Threads;

/**
 *
 * @param {CommandContext} obj
 */
export async function use(obj) {
  Users ??= createUsers();
  Threads ??= createThreads();
  obj.Users = Users;
  obj.Threads = Threads;
  obj.next();
}
