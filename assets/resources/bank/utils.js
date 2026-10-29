import fs from 'fs';

class BankHandler {
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

  async register(userKey, initialBalance = 0) {
    const allData = this.loadFile();
    if (allData[userKey]) {
      throw new Error("User already registered.");
    }
    allData[userKey] = { balance: initialBalance };
    this.saveFile(allData);
  }

  async getBalance(userKey) {
    const allData = this.loadFile();
    if (!allData[userKey]) {
      throw new Error("User not registered.");
    }
    return allData[userKey].balance;
  }

  async deposit(userKey, amount) {
    const allData = this.loadFile();
    if (!allData[userKey]) {
      throw new Error("User not registered.");
    }
    allData[userKey].balance += amount;
    this.saveFile(allData);
  }

  async withdraw(userKey, amount) {
    const allData = this.loadFile();
    if (!allData[userKey]) {
      throw new Error("User not registered.");
    }
    if (allData[userKey].balance < amount) {
      throw new Error("Insufficient balance.");
    }
    allData[userKey].balance -= amount;
    this.saveFile(allData);
  }

  async transfer(senderKey, receiverKey, amount) {
    const allData = this.loadFile();
    if (!allData[senderKey] || !allData[receiverKey]) {
      throw new Error("One or more users not registered.");
    }
    if (allData[senderKey].balance < amount) {
      throw new Error("Insufficient balance.");
    }
    allData[senderKey].balance -= amount;
    allData[receiverKey].balance += amount;
    this.saveFile(allData);
  }

  async setInfo(userKey, newInfo) {
    const allData = this.loadFile();
    if (!allData[userKey]) {
      throw new Error("User not registered.");
    }
    allData[userKey] = { ...allData[userKey], ...newInfo };
    this.saveFile(allData);
  }

  async getInfo(userKey) {
    const allData = this.loadFile();
    if (!allData[userKey]) {
      throw new Error("User not registered.");
    }
    return allData[userKey];
  }
}

export default BankHandler;

