import fs from "fs";

class UserInfo {
  constructor({ filepath, api, discordApi }) {
    this.filepath = filepath;
    this.api = api;
    this.discordApi = discordApi;
  }

  loadFile() {
    try {
      if (!fs.existsSync(this.filepath)) {
        fs.writeFileSync(this.filepath, JSON.stringify({}, null, 2));
      }
      return JSON.parse(fs.readFileSync(this.filepath, "utf8"));
    } catch (err) {
      console.log(err);
      return {};
    }
  }

  saveFile(data) {
    try {
      const finalData = { ...this.loadFile(), ...data };
      fs.writeFileSync(this.filepath, JSON.stringify(finalData, null, 2));
      return this.loadFile();
    } catch (err) {
      console.log(err);
    }
  }

  async get(key) {
    try {
      const allData = this.loadFile();
      if (key in allData) {
        return allData[key];
      }
      const info = key.startsWith("discord")
        ? await this.discordApi.getUserInfo(key)
        : await this.api.getUserInfo(key);
      const { [key]: userInfo } = info || { [key]: { name: "Unknown User" } };
      //damn this is the first ever time i destructured using computed keys
      allData[key] = {
        ...userInfo,
      };
      this.saveFile(allData);
      return allData[key];
    } catch (err) {
      console.log(err);
      return {};
    }
  }

  async set(key, newValue) {
    const allData = this.loadFile();
    const keyValue = allData[key] || {};
    try {
      return this.saveFile({ ...allData, [key]: { ...keyValue, ...newValue } });
    } catch (err) {
      console.log(err);
      return this.loadFile();
    }
  }

  async getAll() {
    try {
      return this.loadFile();
    } catch (err) {
      console.log(err);
      return {};
    }
  }
}

export default UserInfo;
