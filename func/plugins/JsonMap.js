import fs from "fs";

export const meta = {
  name: "json-map",
  author: "Liane Cagara",
  version: "1.0.0",
  description:
    "JsonMap still behaves exactly like map, except the keys will always be converted to strings. and it also abstracts the process of manual json reading, parsing, and writing while keeping the familiar Map methods.",
  supported: "^1.0.0",
  order: 1,
  type: "plugin",
  expect: ["JsonMap"],
};
export class JsonMap extends Map {
  constructor(filepath) {
    super();
    this.filepath = filepath;
    this.loadFromFile();
    return new Proxy(this, {
      get(target, prop, receiver) {
        this.loadFromFile();
        if (typeof target[prop] === "function") {
          return (...args) => {
            try {
              const result = target[prop].apply(target, args);
              this.saveToFile();
              return result;
            } catch (error) {
              throw error;
            }
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  loadFromFile() {
    try {
      const data = fs.readFileSync(this.filepath, "utf8");
      const parsedData = JSON.parse(data);
      this.clear();
      for (const [key, value] of Object.entries(parsedData)) {
        this.set(key, value);
      }
    } catch (error) {
      throw error;
    }
  }

  saveToFile() {
    try {
      const data = JSON.stringify(Object.fromEntries(this));
      fs.writeFileSync(this.filepath, data, "utf8");
    } catch (error) {
      throw error;
    }
  }
}

export async function use(obj) {
  obj.JsonMap = JsonMap;
  obj.next();
}
