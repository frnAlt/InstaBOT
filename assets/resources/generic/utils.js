import fs from "fs";

class GenericInfo {
  constructor({ filepath, api, basename, defaults = {} }) {
    this.filepath = basename
      ? `CommandFiles/resources/generic/${basename}.json`
      : filepath;
    this.api = api;
    Object.defineProperty(this, "defaults", {
      get() {
        return { ...defaults };
      },
      set(value) {
        this.defaults = value;
      },
    });
  }

  loadFile() {
    try {
      if (!fs.existsSync(this.filepath)) {
        fs.writeFileSync(this.filepath, JSON.stringify({}, null, 2));
      }
      const result = {};
      const data = JSON.parse(fs.readFileSync(this.filepath, "utf8"));
      for (const key in data) {
        if (key === "undefined" || key === "null") {
          continue;
        }
        result[key] = { ...this.defaults, ...data[key] };
      }
      return result;
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
  get now() {
    return this.loadFile();
  }
  set now(newData) {
    return this.saveFile(newData);
  }
  toString() {
    return JSON.stringify(this.loadFile(), null, 2);
  }
  delete(key) {
    try {
      const allData = this.loadFile();
      delete allData[key];
      return this.saveFile(allData);
    } catch (err) {
      console.log(err);
      return this.loadFile();
    }
  }
  map(callback) {
    const allData = this.loadFile();
    for (const key in allData) {
      allData[key] = callback(allData[key], key);
    }
    return allData;
  }
  mapSave(callback) {
    this.saveFile(this.map(callback));
  }
  filter(callback) {
    const allData = this.loadFile();
    const filteredData = {};
    for (const key in allData) {
      if (callback(allData[key], key)) {
        filteredData[key] = allData[key];
      }
    }
    return filteredData;
  }
  filterSave(callback) {
    this.saveFile(this.filter(callback));
  }
  findKey(callback) {
    const allData = this.loadFile();
    for (const key in allData) {
      if (callback(allData[key], key)) {
        return key;
      }
    }
    return null;
  }
  find(callback) {
    const allData = this.loadFile();
    return allData[this.findKey(callback)];
  }
  some(callback) {
    const allData = this.loadFile();
    for (const key in allData) {
      if (callback(allData[key], key)) {
        return true;
      }
    }
    return false;
  }
  every(callback) {
    const allData = this.loadFile();
    for (const key in allData) {
      if (!callback(allData[key], key)) {
        return false;
      }
    }
    return true;
  }
  reduce(callback, initialValue) {
    const allData = this.loadFile();
    let acc = initialValue;
    for (const key in allData) {
      acc = callback(acc, allData[key], key);
    }
    return acc;
  }
  async waitPromise(returnValue) {
    let values = {};
    for (const key in returnValue) {
      values[key] = await returnValue[key];
    }
    return values;
  }
  has(key) {
    return key in this.loadFile();
  }
  iterate(callback) {
    const allData = this.loadFile();
    for (const key in allData) {
      callback(allData[key], key);
    }
  }
  async iterateAsync(callback) {
    const allData = this.loadFile();
    for (const key in allData) {
      await callback(allData[key], key);
    }
  }
  get(key) {
    try {
      const allData = this.loadFile();
      return allData[key] || { ...this.defaults };
    } catch (err) {
      console.log(err);
      return {};
    }
  }

  set(key, newValue) {
    const allData = this.loadFile();
    const keyValue = allData[key] || {};
    try {
      return this.saveFile({ ...allData, [key]: { ...keyValue, ...newValue } });
    } catch (err) {
      console.log(err);
      return this.loadFile()[key];
    }
  }

  getAll() {
    try {
      return this.loadFile();
    } catch (err) {
      console.log(err);
      return {};
    }
  }
}

export default GenericInfo;
