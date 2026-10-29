import LiaMongo from "lia-mongo";
import fs from "fs";

class UserInfo {
  constructor({ filepath, api, discordApi }) {
    this.filepath = filepath;
    this.api = api;
    this.discordApi = discordApi;
    this.mongo = null;
    this.collectionName = "userInfo";
    this.isMongo = global.Cassidy.config.MongoConfig?.status || false;
    this.isStarted = false;

    if (this.isMongo) {
      const uri = global.Cassidy.config.MongoConfig?.uri;
      this.mongo = new LiaMongo({ uri, collection: this.collectionName });
    }
  }

  async connectMongo() {
    if (this.isMongo && !this.isStarted) {
      try {
        await this.mongo.start();
        this.isStarted = true;
        await this.set("wss:admin", { name: "Panel Admin" });
      } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
      }
    }
  }

  async loadFile() {
    let allData = {};

    try {
      if (fs.existsSync(this.filepath)) {
        const jsonData = fs.readFileSync(this.filepath, "utf8");
        allData = JSON.parse(jsonData);
      }

      if (this.isMongo) {
        await this.connectMongo();
        const mongoData = await this.mongo.toObject();
        allData = { ...allData, ...mongoData };
      }

      return allData;
    } catch (err) {
      console.error("Error loading data:", err);
      return {};
    }
  }

  async get(key, refresh = true) {
    try {
      let data = {};
      if (!this.isMongo || !refresh) {
        const allData = await this.loadFile();
        data = allData[key];
      } else {
        await this.connectMongo();
        data = await this.mongo.get(key);
      }

      if (!data) {
        const info = key.startsWith("discord")
          ? await this.discordApi.getUserInfo(key)
          : await this.api.getUserInfo(key);

        const { [key]: userInfo } = info || { [key]: { name: "Unknown User" } };

        if (!this.isMongo) {
          let allData = await this.loadFile();
          allData[key] = {
            ...userInfo,
          };
          await this.saveFile(allData);
        } else {
          await this.mongo.put(key, userInfo);
        }

        return userInfo;
      }

      return data;
    } catch (err) {
      console.error("Error getting user info:", err);
      return {};
    }
  }

  async set(key, newValue, refresh = true) {
    try {
      if (this.isMongo) {
        await this.connectMongo();
        const existingData = await this.mongo.get(key);
        const mergedData = { ...existingData, ...newValue };
        await this.mongo.put(key, mergedData);
      } else {
        let allData = await this.loadFile();
        allData[key] = { ...allData[key], ...newValue };
        await this.saveFile(allData);
      }

      if (refresh && !this.isMongo) {
        await this.loadFile();
      }

      return newValue;
    } catch (err) {
      console.error("Error setting user info:", err);
      return {};
    }
  }

  async getAll() {
    try {
      return await this.loadFile();
    } catch (err) {
      console.error("Error getting all user info:", err);
      return {};
    }
  }

  async saveFile(data) {
    try {
      if (!this.isMongo) {
        fs.writeFileSync(this.filepath, JSON.stringify(data, null, 2));
      } else {
        await this.connectMongo();
        for (const key in data) {
          await this.mongo.put(key, data[key]);
        }
      }
      return data;
    } catch (err) {
      console.error("Error saving data:", err);
      return {};
    }
  }
}

export default UserInfo;
