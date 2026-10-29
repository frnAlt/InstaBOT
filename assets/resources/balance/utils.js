import fs from 'fs';

class CurrencyHandler {
  constructor({ filepath }) {
    this.filepath = filepath;
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
      fs.writeFileSync(this.filepath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.log(err);
    }
  }

  async getCurrency(userKey) {
    const allData = this.loadFile();
    return allData[userKey] ? allData[userKey].currency : 0;
  }

  async earn(userKey, amount) {
    const allData = this.loadFile();
    allData[userKey] = allData[userKey] || { currency: 0 };
    allData[userKey].currency += amount;
    this.saveFile(allData);
  }

  async spend(userKey, amount) {
    const allData = this.loadFile();
    if (allData[userKey] && allData[userKey].currency >= amount) {
      allData[userKey].currency -= amount;
      this.saveFile(allData);
      return true;
    }
    return false;
  }

  async transfer(senderKey, receiverKey, amount) {
    const allData = this.loadFile();
    if (allData[senderKey] && allData[senderKey].currency >= amount) {
      allData[senderKey].currency -= amount;
      allData[receiverKey] = allData[receiverKey] || { currency: 0 };
      allData[receiverKey].currency += amount;
      this.saveFile(allData);
      return true;
    }
    return false;
  }

  async setInfo(userKey, newInfo) {
    const allData = this.loadFile();
    allData[userKey] = allData[userKey] || { currency: 0 };
    allData[userKey] = { ...allData[userKey], ...newInfo };
    this.saveFile(allData);
  }

  async getInfo(userKey) {
    const allData = this.loadFile();
    return allData[userKey] || { currency: 0 };
  }
}

export default CurrencyHandler;

