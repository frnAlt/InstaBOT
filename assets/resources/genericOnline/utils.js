import LiaMongo from "lia-mongo";

class MongoInfo {
  #uri;
  mongo;
  #defaults;

  constructor({
    uri = global.Cassidy.config.MongoConfig?.uri,
    basename = "genericinfostats",
    defaults = {},
  } = {}) {
    if (!uri) {
      throw new Error("MongoDB URI must be provided.");
    }
    this.#uri = process.env[uri];
    this.#defaults = defaults;
    this.mongo = new LiaMongo({
      uri: this.#uri,
      collection: basename,
    });
    this.isStarted = false;
  }

  get defaults() {
    return JSON.parse(JSON.stringify(this.#defaults));
  }

  async connect() {
    if (!this.isStarted) {
      await this.mongo.start();
      this.isStarted = true;
      await this.set("test", this.defaults, true); // Ensure initial set to avoid null errors
    }
  }

  async loadFile() {
    await this.connect(); // Ensure connection before operation
    try {
      const data = await this.mongo.toObject();
      return this.processData(data);
    } catch (err) {
      console.error("Error loading data:", err);
      throw err;
    }
  }

  async delete(key) {
    await this.connect();
    try {
      await this.mongo.remove(key);
      return this.loadFile();
    } catch (err) {
      console.error("Error deleting key:", err);
      throw err;
    }
  }

  async deleteProps(key, ...props) {
    await this.connect();
    try {
      const data = await this.get(key);
      for (const prop of props) {
        if (prop in data) {
          delete data[prop];
        }
      }
      return this.set(key, data, true);
    } catch (error) {
      console.error("Error deleting properties:", error);
      throw error;
    }
  }

  async get(key, prop) {
    await this.connect();
    try {
      const data = (await this.mongo.get(key)) || { ...this.defaults };
      if (prop) {
        return data[prop];
      }
      return data;
    } catch (err) {
      console.error("Error getting key:", err);
      throw err;
    }
  }

  async set(key, newValue, noExisting = false) {
    await this.connect();
    try {
      const existingValue = noExisting ? {} : await this.get(key);
      const updatedValue = { ...existingValue, ...newValue };
      await this.mongo.put(key, updatedValue);
      return this.loadFile();
    } catch (err) {
      console.error("Error setting key:", err);
      throw err;
    }
  }

  async getAll() {
    await this.connect();
    try {
      const data = await this.mongo.toObject();
      return this.processData(data);
    } catch (err) {
      console.error("Error getting all data:", err);
      throw err;
    }
  }
  async setAll(newData) {
    await this.connect();
    const all = await this.getAll();
    for (const id in all) {
      await this.set(id, newData[id]);
    }
  }
  async setAllUniform(newProps) {
    await this.connect();
    const all = await this.getAll();
    for (const id in all) {
      await this.set(id, { ...newProps });
    }
  }

  processData(data) {
    const result = {};
    for (const key in data) {
      if (key === "undefined" || key === "null") {
        continue;
      }
      result[key] = JSON.parse(
        JSON.stringify({ ...this.defaults, ...data[key] }),
      );
    }
    return result;
  }

  async map(callback) {
    try {
      const allData = await this.loadFile();
      for (const key in allData) {
        allData[key] = await callback(allData[key], key);
      }
      return allData;
    } catch (err) {
      console.error("Error mapping data:", err);
      throw err;
    }
  }

  async filter(callback) {
    try {
      const allData = await this.loadFile();
      const filteredData = {};
      for (const key in allData) {
        if (await callback(allData[key], key)) {
          filteredData[key] = allData[key];
        }
      }
      return filteredData;
    } catch (err) {
      console.error("Error filtering data:", err);
      throw err;
    }
  }

  async findKey(callback) {
    try {
      const allData = await this.loadFile();
      for (const key in allData) {
        if (await callback(allData[key], key)) {
          return key;
        }
      }
      return null;
    } catch (err) {
      console.error("Error finding key:", err);
      throw err;
    }
  }

  async find(callback) {
    try {
      const key = await this.findKey(callback);
      return key ? this.get(key) : null;
    } catch (err) {
      console.error("Error finding data:", err);
      throw err;
    }
  }

  async some(callback) {
    try {
      const allData = await this.loadFile();
      for (const key in allData) {
        if (await callback(allData[key], key)) {
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Error checking some data:", err);
      throw err;
    }
  }

  async every(callback) {
    try {
      const allData = await this.loadFile();
      for (const key in allData) {
        if (!(await callback(allData[key], key))) {
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error("Error checking every data:", err);
      throw err;
    }
  }

  async reduce(callback, initialValue) {
    try {
      const allData = await this.loadFile();
      let acc = initialValue;
      for (const key in allData) {
        acc = await callback(acc, allData[key], key);
      }
      return acc;
    } catch (err) {
      console.error("Error reducing data:", err);
      throw err;
    }
  }
}

export default MongoInfo;
