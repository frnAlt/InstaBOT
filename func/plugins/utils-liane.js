// @ts-check
export const meta = {
  name: "utils-liane",
  author: "Liane Cagara",
  version: "3.0.10",
  description:
    "Helpful but optional utilities that isn't used by default, DO NOT OWN THESE",
  supported: "^1.0.0",
  order: 1,
  type: "plugin",
  expect: [
    "TagParser",
    "Slicer",
    "ArgsHelper",
    "CommandProperty",
    "Attachment",
    "MessageEditor",
    "MsgEditor",
    "Editor",
    "ItemPrompt",
    "GameSimulator",
    "isTimeAvailable",
    "ItemLister",
  ],
};
import axios from "axios";
import fs from "fs";
import { stoData } from "../modules/stoData.js";
import { CassEXP } from "../modules/cassEXP.js";
import { clamp } from "@cassidy/unispectra";
import { SpectralCMDHome } from "../modules/spectralCMDHome";
const moment = require("moment-timezone");

/**
 * Checks if the current time falls within a specified range.
 *
 * @param {number} msStart - The start time in milliseconds from midnight.
 * @param {number} msEnd - The end time in milliseconds from midnight.
 * @param {string} [timeZone='Asia/Manila'] - The timezone to use (default is Philippines timezone).
 * @returns {boolean} - Returns true if the current time is within the range, otherwise false.
 */
export function isTimeAvailable(msStart, msEnd, timeZone = "Asia/Manila") {
  const now = moment.tz(timeZone);

  const msCurrent =
    now.hours() * 60 * 60 * 1000 +
    now.minutes() * 60 * 1000 +
    now.seconds() * 1000 +
    now.milliseconds();

  return msCurrent >= msStart && msCurrent <= msEnd;
}

export class ItemLister {
  constructor(inventory) {
    this.inventory = inventory;
  }
  minified(hasKey) {
    return this.raw()
      .map(
        (item) => `${item.icon} ${item.name} ${hasKey ? `(${item.key})` : ""}`
      )
      .join("\n");
  }
  formal(hasKey) {
    return this.raw()
      .map(
        (item) =>
          `${item.icon} **${item.name}** ${hasKey ? `(${item.key})` : ""}`
      )
      .join("\n");
  }
  shopStyle(_hasKey, hasPrice, priceKey) {
    return this.raw()
      .map((item) => {
        let isOkay = false;
        const price = item[priceKey] ?? item.price;
        if (!isNaN(price) && price > 0) {
          isOkay = true;
        }
        return `${item.icon} **${item.name}**${
          hasPrice ? ` - ${isOkay ? `$**${item.price}**` : "🚫"}` : ""
        }\n✦ ${item.flavorText}`;
      })
      .join("\n\n");
  }
  raw() {
    return Array.from(this.inventory);
  }
}

/**
 * @template {any} T
 */
export class Slicer {
  /**
   *
   * @param {T[]} array
   * @param {number} limit
   */
  constructor(array = [], limit = 10) {
    this.array = Array.from(array);
    this.limit = limit;
  }
  /**
   *
   * @param {number | string} page
   */
  getPage(page) {
    return Slicer.byPageArray(this.array, page, this.limit);
  }

  /**
   * @readonly
   * @type {number}
   */
  get pagesLength() {
    return Math.ceil(this.array.length / (this.limit || 10));
  }

  /**
   *
   * @param {string | number} page
   * @returns {number}
   */
  static parseNum(page) {
    let _page = Math.floor(Number(page || "1"));
    if (isNaN(_page) || _page < 1) {
      _page = 1;
    }
    return _page;
  }

  /**
   * @param {number | string} page
   * @param {string | number} limit
   * @returns {[number, number]}
   */
  static byPage(page, limit) {
    let _page = this.parseNum(page);
    let _limit = Math.floor(Number(limit));
    if (isNaN(Number(limit))) {
      _limit = 10;
    }
    const sliceA = (_page - 1) * _limit;
    const sliceB = _page * _limit;
    return [sliceA, sliceB];
  }
  /**
   * @template {any} T
   * @param {T[]} array
   * @param {number | string} page
   * @param {number} limit
   */
  static byPageArray(array, page, limit) {
    return array.slice(...this.byPage(page, limit));
  }
}
export class CommandProperty {
  constructor(commandName) {
    this.commandName = commandName;

    let [rootCommand, ...nestedProperties] = this.commandName
      .split(".")
      .map((part) => part.trim())
      .filter(Boolean);

    let commandProperty = {};

    nestedProperties.reduce((obj, prop, index) => {
      if (nestedProperties[index + 1]) {
        obj[prop] = {};
        return obj[prop];
      } else {
        obj[prop] = true;
        return obj;
      }
    }, commandProperty);

    this[rootCommand] = commandProperty;
  }

  static reverse(obj) {
    if (!obj || typeof obj !== "object") {
      return "";
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return "";
    }

    const firstKey = keys[0];
    const value = obj[firstKey];

    if (typeof value === "object") {
      return firstKey + "." + CommandProperty.reverse(value);
    } else {
      return firstKey;
    }
  }
}

export class ArgsHelper extends Array {
  constructor(
    { body, isCommand } = {
      body: "",
      isCommand: false,
    }
  ) {
    let array = String(body).split(" ").filter(Boolean);
    let commandName = null;
    if (!!isCommand) {
      commandName = array.shift();
    }
    super(...array);
    this.isCommand = () => !!isCommand;
    this.commandName = () => commandName;
  }
  get commandProperties() {
    return new CommandProperty(this.commandName());
  }
  get properties() {
    const self = this;
    return new Proxy(
      {},
      {
        get(_, prop) {
          return new CommandProperty(self[prop] || "");
        },
        set(_, prop, value) {
          self[prop] =
            typeof value === "object"
              ? CommandProperty.reverse(value)
              : String(value);
          return true;
        },
      }
    );
  }
  set properties(values) {
    if (!Array.isArray(values)) {
      return;
    }
    for (const index in values) {
      this[index] =
        typeof values === "object"
          ? CommandProperty.reverse(values)
          : String(values);
    }
  }
  on(degree, value, callback) {
    const needed = String(this[degree] || "");
    if (
      typeof value === "string" &&
      needed.toLowerCase() === value.toLowerCase()
    ) {
      callback(needed, value);
    } else if (value instanceof RegExp && value.test(needed)) {
      callback(needed, value);
    }
  }
}
export class TagParser {
  constructor(event) {
    this.event = event;
  }

  get args() {
    return new ArgsHelper(this.event);
  }

  static mainParser(str) {
    str = String(str);
    const [, str2] = str.split("[").map((i) => i.trim());
    if (!str2) {
      return null;
    }
    const [str3] = str2.split("]").map((i) => i.trim());
    if (!str3) {
      return null;
    }
    const tags = str3
      .split(",")
      .filter(Boolean)
      .map((tag) => tag.trim())
      .map((tagStr) => {
        const [tag = null, value = null] = tagStr
          .split("=")
          .map((i) => i.trim());
        return {
          tag,
          value,
        };
      })
      .filter((i) => i.tag);
    tags.toObject = () => {
      let result = {};
      for (const tag of tags) {
        result[tag.tag] = tag.value;
      }
      return result;
    };
    return tags;
  }

  getByTag(tagName, index = 0) {
    if (index >= this.args.length) {
      throw new Error("Index out of range.");
    }
    const tags = TagParser.mainParser(this.args[index]);
    return tags.filter((tag) => tag.tag === tagName);
  }

  getAllTagNames(index = 0) {
    if (index >= this.args.length) {
      throw new Error("Index out of range.");
    }
    const tags = TagParser.mainParser(this.args[index]);
    const tagNames = tags.map((tag) => tag.tag);
    return [...new Set(tagNames)];
  }

  getValuesByTag(tagName, index = 0) {
    if (index >= this.args.length) {
      throw new Error("Index out of range.");
    }
    const tags = TagParser.mainParser(this.args[index]);
    return tags.filter((tag) => tag.tag === tagName).map((tag) => tag.value);
  }

  formatTags(index = 0) {
    if (index >= this.args.length) {
      throw new Error("Index out of range.");
    }
    const tags = TagParser.mainParser(this.args[index]);
    return tags.map((tag) => `${tag.tag}=${tag.value}`).join(", ");
  }

  get(index = 0) {
    return TagParser.mainParser(this.args[index]);
  }

  addTags(newTags, index = 0) {
    if (index >= this.args.length) {
      throw new Error("Index out of range.");
    }
    const existingTags = TagParser.mainParser(this.args[index]);
    const updatedTags = [...existingTags, ...newTags];
    this.args[index] = `[${updatedTags
      .map((tag) => `${tag.tag}=${tag.value}`)
      .join(", ")}]`;
  }

  removeTagsByName(tagNames, index = 0) {
    if (index >= this.args.length) {
      throw new Error("Index out of range.");
    }
    const existingTags = TagParser.mainParser(this.args[index]);
    const updatedTags = existingTags.filter(
      (tag) => !tagNames.includes(tag.tag)
    );
    this.args[index] = `[${updatedTags
      .map((tag) => `${tag.tag}=${tag.value}`)
      .join(", ")}]`;
  }

  updateTagValue(tagName, newValue, index = 0) {
    if (index >= this.args.length) {
      throw new Error("Index out of range.");
    }
    const existingTags = TagParser.mainParser(this.args[index]);
    const updatedTags = existingTags.map((tag) =>
      tag.tag === tagName ? { ...tag, value: newValue } : tag
    );
    this.args[index] = `[${updatedTags
      .map((tag) => `${tag.tag}=${tag.value}`)
      .join(", ")}]`;
  }
}

/**
 *
 * @param {CommandContext} obj
 */
export async function use(obj) {
  obj.TagParser = TagParser;
  obj.Slicer = Slicer;
  class MessageEditor {
    constructor(event, api) {
      this.api = api || obj.api;
      this.currentID = null;
      this.edits = 0;
      this.event = event || obj.event;
    }
    async apply(content, delay, isReply) {
      delay = Number(delay || 0);
      content = String(content);
      if (!this.currentID) {
        this.currentID = await new Promise((resolve) => {
          this.api.sendMessage(
            content,
            this.event.threadID,
            (_, info) => {
              resolve(info.messageID);
            },
            isReply ? this.event.messageID : undefined
          );
        });
        return this;
      }
      if (this.edits > 5) {
        return this;
      }
      const self = this;
      await new Promise((resolve) => {
        setTimeout(() => {
          self.api.editMessage(content, self.currentID, () => {
            resolve();
          });
        }, delay);
      });
      return this;
    }
  }

  class Attachment {
    constructor(url, { devLog = false, strictMode = true } = {}) {
      this.url = url;
      this.api = obj.api;
      this.devLog = devLog;
      this.strictMode = strictMode;
      this.stream = null;
      this.event = obj.event;
    }

    async loadUrl(method = "GET", extra = {}) {
      try {
        const response = await axios({
          method: method,
          url: this.url,
          ...extra,
          responseType: "stream",
        });
        this.stream = response.data;
        return this.stream;
      } catch (error) {
        if (this.strictMode) {
          throw error;
        }
        if (this.devLog) {
          console.error(error);
        }
      }
    }
    async send(optionalCaption, optionalThreadID) {
      if (!this.isLoaded()) {
        return this.api.sendMessage(
          "[Attachment] Image not yet loaded.",
          optionalThreadID || this.event.threadID
        );
      }
      try {
        const payload = {
          attachment: await this.load(),
        };
        if (optionalCaption) {
          payload.body = String(optionalCaption);
        }
        await this.api.sendMessage(
          payload,
          optionalThreadID || this.event.threadID
        );
        return payload;
      } catch (error) {
        await this.api.sendMessage(
          `[Attachment] Failed sending attachment.\n${
            error instanceof Error
              ? error.toString()
              : JSON.stringify(error, null, 2)
          }`,
          optionalThreadID || this.event.threadID
        );
        return null;
      }
    }

    async loadFile() {
      try {
        this.stream = fs.createReadStream(this.url);
        return this.stream;
      } catch (error) {
        if (this.strictMode) {
          throw error;
        }
        if (this.devLog) {
          console.error(error);
        }
      }
    }
    load() {
      if (this.url.startsWith("http")) {
        return this.loadUrl();
      } else {
        return this.loadFile();
      }
    }
    isLoaded() {
      return !!this.stream;
    }

    setDevLog(enabled) {
      this.devLog = enabled;
    }

    setStrictMode(enabled) {
      this.strictMode = enabled;
    }

    isDevLogEnabled() {
      return this.devLog;
    }

    isStrictModeEnabled() {
      return this.strictMode;
    }
  }
  obj.ArgsHelper = ArgsHelper;
  obj.CommandProperty = CommandProperty;
  obj.Attachment = Attachment;
  obj.MessageEditor = MessageEditor;
  obj.MsgEditor = MessageEditor;
  obj.Editor = MessageEditor;

  class GameSimulator {
    /**
     * @type {Record<string, GameSimulator>}
     */
    static instances = {};
    constructor({
      key,
      verb = key.charAt(0).toUpperCase() + key.slice(1),
      verbing = verb + "ing",
      pastTense = verb + "ed",
      checkIcon = "✓",
      initialStorage = 30,
      itemData = [],
      actionEmoji = "🔖",
      stoData,
    }) {
      GameSimulator.instances[key] = this;
      this.key = key;
      this.verb = verb;
      this.verbing = verbing;
      this.pastTense = pastTense;
      this.checkIcon = checkIcon;
      this.actionEmoji = actionEmoji;
      this.storage = initialStorage;
      this.stoData = stoData;
      this.itemData = itemData.map((i) => {
        return {
          ...i,
          priceA: i.priceA * 10,
          priceB: i.priceB * 10,
        };
      });
    }

    /**
     * @param {CommandContext} context
     */
    async simulateAction(context = obj) {
      try {
        const {
          input,
          output,
          money,
          prefix,
          CassExpress,
          Inventory,
          commandName,
        } = context;
        const self = this;
        const home = new SpectralCMDHome({ isHypen: false }, [
          {
            key: "tune",
            description:
              "Tune at least 3 items before collecting—your choices shape the outcome, but you can't repeat the same order!",
            aliases: ["-tu"],
            icon: "🚀",
            // @ts-ignore
            async handler(_, __) {
              const {
                money: _userMoney,
                [self.key + "Stamp"]: actionStamp,
                [self.key + "MaxZ"]: _actionMax = self.storage,
                [self.key + "Total"]: totalItems = {},
                [self.key + "Tune"]: _actionTune = [],
                cassEXP: _cxp,
                name: _name,
              } = await money.getItem(input.senderID);

              let sortedItems = Object.entries(totalItems).sort(
                () => Math.random() - 0.5
              );
              self.itemData.forEach((i) => {
                const total = Object.keys(totalItems).find((j) => j === i.name);

                if (!total) {
                  sortedItems.unshift([i.name, 0]);
                }
              });
              sortedItems = sortedItems.slice(0, 5);

              const genR = () => Math.floor(Math.random() * 5) + 1;

              let warn = actionStamp
                ? `⚠️ **You have already tuned your items!**\n\nTuning again will **reset the timer** and you may **lose your opportunity to collect.**\n\n`
                : "";

              let result = `${warn}🚀 Choose at least **3 items** to tune. Reply with the corresponding **numbers**.\n\n***Example***: ${genR()} ${genR()} ${genR()}\n\n`;

              sortedItems.forEach(([itemName, itemCount], ind) => {
                const data = self.itemData.find(
                  (item) => item.name === itemName
                );
                result += `**${ind + 1}**. ${
                  data.icon
                } **${itemName}**\nSold Amount: ${itemCount}\nRarity: ${
                  100 - data.chance * 100
                }%\nProcessing Time: ${
                  data.delay
                } minutes.\nPrice Range:\nBetween ${data.priceA} and ${
                  data.priceB
                }.\n\n`;
              });

              /**
               * @type {CassidySpectra.CommandStyle}
               */
              const style = {
                title: "🚀 Item Tuner",
                titleFont: "bold",
                contentFont: "fancy",
              };

              const inf = await output.replyStyled(result, style);

              input.setReply(inf.messageID, {
                /**
                 *
                 * @param {CommandContext} ctx2
                 */
                async callback(ctx2) {
                  if (ctx2.input.senderID !== input.senderID) {
                    return;
                  }
                  const nums = ctx2.input.words
                    .map((i) => parseInt(i))
                    .map((i) => sortedItems.at(i - 1))
                    .map((i) => i?.[0])
                    .slice(0, 3);

                  if (nums.length < 3) {
                    return ctx2.output.replyStyled(
                      `❌ You need to provide at least three numbers! You provided only ${nums.length}.`,
                      style
                    );
                  }
                  if (nums.length > 3) {
                    return ctx2.output.replyStyled(
                      `❌ You only need to provide three numbers! You provided too much.`,
                      style
                    );
                  }

                  const invalidNums = nums.filter(
                    (i) => i === null || i === undefined
                  );

                  if (invalidNums.length > 0) {
                    return ctx2.output.replyStyled(
                      `❌ Invalid input detected! The following values are missing: ${invalidNums.join(
                        ", "
                      )}.`,
                      style
                    );
                  }
                  const uniqueNums = new Set(nums);
                  if (uniqueNums.size !== nums.length) {
                    return ctx2.output.replyStyled(
                      `❌ Duplicate numbers are not allowed! Your input contains duplicates.`,
                      style
                    );
                  }

                  await money.setItem(ctx2.input.senderID, {
                    [self.key + "Tune"]: nums,
                    [self.key + "Stamp"]: Date.now(),
                  });

                  let r2 = "";

                  nums.forEach((itemName) => {
                    const ind = sortedItems.findIndex((i) => i[0] === itemName);
                    const data = self.itemData.find(
                      (item) => item.name === itemName
                    );
                    r2 += `**${ind + 1}**. ${
                      data.icon
                    } **${itemName}**\nRarity: ${
                      100 - data.chance * 100
                    }%\nProcessing Time: ${
                      data.delay
                    } minutes.\nPrice Range:\nBetween ${data.priceA} and ${
                      data.priceB
                    }.\n\n`;
                  });

                  return ctx2.output.replyStyled(
                    `✅ Tuning successful!\nPlease wait patiently to **collect** your items.\n\nThe following **3 items** will be **prioritized**:\n\n${r2}\n\n⚠️ **Warning:** Tuning **resets the waiting time** for all items.\nAvoid tuning while having many items waiting, or you may lose the opportunity to collect them.`.trim(),
                    style
                  );
                },
              });
            },
          },
          {
            key: "collect",
            description: "Collect items that have finished processing.",
            aliases: ["-c"],
            icon: "💵",
            // @ts-ignore
            async handler(_, __) {
              const currentTimestamp = Date.now();
              function formatDuration(ms) {
                const seconds = Math.floor(ms / 1000) % 60;
                const minutes = Math.floor(ms / (1000 * 60)) % 60;
                const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
                const days = Math.floor(ms / (1000 * 60 * 60 * 24));

                const parts = [];
                if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
                if (hours > 0)
                  parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
                if (minutes > 0)
                  parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
                if (seconds > 0)
                  parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

                return parts.length > 1
                  ? parts.slice(0, -1).join(", ") + " and " + parts.slice(-1)
                  : parts[0] || "0 seconds";
              }

              const {
                money: userMoney,
                [self.key + "Stamp"]: actionStamp,
                [self.key + "MaxZ"]: actionMax = self.storage,
                [self.key + "Total"]: totalItems = {},
                [self.key + "Tune"]: actionTune = [],
                cassEXP: cxp,
                name,
              } = await money.getItem(input.senderID);
              const cassEXP = new CassEXP(cxp);
              if (!name) {
                return output.reply(
                  "❌ Please register first using the identity-setname command."
                );
              }

              const randTune = () =>
                self.itemData.map((i) => i.name)[
                  Math.floor(Math.random() * self.itemData.length)
                ];

              while (actionTune.length < 3) {
                actionTune.push(randTune());
              }

              const tuneBasedData = [...self.itemData].sort((a, b) => {
                const indexA = actionTune.indexOf(a.name);
                const indexB = actionTune.indexOf(b.name);

                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;

                return Math.random() - 0.5;
              });

              let text = "";
              let newMoney = userMoney;
              let totalYield = 0;
              let failYield = 0;
              let failData = [];

              if (!actionStamp) {
                text = `${self.actionEmoji} Cannot perform ${self.verbing} action since no items have been tuned yet. Use the **${prefix}${commandName}-tune** command to set your priorities before collecting!`;
              } else {
                const elapsedTime =
                  (currentTimestamp - actionStamp) / 1000 / 60;

                let harvestedItems = [];
                for (const item of tuneBasedData) {
                  let tuneIndex = [...actionTune].indexOf(item.name);
                  const chanceMod = [1.1, 1.2, 1.3];
                  let yieldAmount = Math.max(
                    0,
                    Math.floor(elapsedTime / item.delay)
                  );

                  /**
                   *
                   * @param {number} chance
                   * @returns
                   */
                  const addChanceMod = (chance) => {
                    const mod = chanceMod[tuneIndex] || 0.8;

                    return Math.min(chance * mod, 1);
                  };
                  const yieldArray = Array(yieldAmount).fill();
                  yieldAmount = yieldArray.reduce(
                    (acc) =>
                      acc + (Math.random() < addChanceMod(item.chance) ? 1 : 0),
                    0
                  );
                  if (totalYield + yieldAmount > actionMax) {
                    failYield += totalYield + yieldAmount - actionMax;
                    failData.push({
                      ...item,
                      yieldAmount: totalYield + yieldAmount - actionMax,
                    });

                    yieldAmount = actionMax - totalYield;
                  }

                  if (yieldAmount <= 0) {
                    continue;
                  }
                  let price = Math.floor(
                    addChanceMod(Math.random()) *
                      (item.priceB - item.priceA + 1) +
                      item.priceA
                  );
                  price = CassExpress.farmUP(price, totalItems);

                  totalYield += yieldAmount;
                  if (!totalItems[item.name]) {
                    totalItems[item.name] = 0;
                  }
                  totalItems[item.name] += yieldAmount;

                  const total = yieldAmount * price;
                  harvestedItems.push({
                    name: item.name,
                    icon: item.icon,
                    yieldAmount,
                    price,
                    total,
                  });
                  cassEXP.expControls.raise(
                    clamp(0, Math.floor(total / 1000), 10)
                  );
                  newMoney += total;
                }

                text = `📝 **Summary**:\n`;
                let types = 0;
                harvestedItems = harvestedItems.sort(
                  (a, b) => a.total - b.total
                );
                harvestedItems.forEach((item) => {
                  if (item.yieldAmount < 1) {
                    return;
                  }
                  const tunedOrder = actionTune.indexOf(item.name);
                  text += `${
                    tunedOrder !== -1
                      ? `🚀**#${tunedOrder + 1}**`
                      : self.checkIcon
                  } ${item.icon} ${
                    tunedOrder !== -1
                      ? `**x${item.yieldAmount}** **${item.name}(s)**`
                      : `x${item.yieldAmount} ${item.name}(s)`
                  } sold for **${item.price}$** each, total: **${
                    item.total
                  }$**\n`;
                  types++;
                });
                failData.forEach((item) => {
                  if (item.yieldAmount < 1) {
                    return;
                  }
                  const tunedOrder = actionTune.indexOf(item.name);
                  text += `${
                    tunedOrder !== -1 ? `❌**#${tunedOrder + 1}**` : "❌"
                  } ${item.icon} ${
                    tunedOrder !== -1
                      ? `**x${item.yieldAmount}** **${item.name}(s)**`
                      : `x${item.yieldAmount} ${item.name}(s)`
                  } failed.\n`;
                  types++;
                });
                if (failYield > 0) {
                  text += `\n🥲 **Failed** ${self.verbing} ${failYield} **item(s)** due to full storage.\n`;
                }
                if (types === 0) {
                  text += `\n🥲 No items ${self.pastTense}, you should wait for the next action!\n`;
                } else {
                  text += `\n💗 ${self.pastTense} ${types} type(s) of items.\n`;
                }
                cassEXP.expControls.raise(
                  Math.floor((totalYield / actionMax) * 10)
                );
                text += `\n🗃️ Storage: `;
                text += `${totalYield.toLocaleString()}/${Number(
                  actionMax
                ).toLocaleString()} (${Math.floor(
                  (totalYield / actionMax) * 100
                )}%)\n✓ You can **upgrade** this storage by using **${prefix}${
                  self.key
                }-upgrade**.`;
                text += `\n\n✨ **Total Earnings**: $**${(
                  newMoney - userMoney
                ).toLocaleString()}💵**\n💰 **Your Balance**: $**${newMoney.toLocaleString()}**💵`;
                text += `\n⌛ **Time Took**: ${formatDuration(
                  currentTimestamp - actionStamp
                )}\n\n${self.actionEmoji} To start another ${
                  self.verbing
                } cycle, use the **${prefix}${commandName}-tune** command to set your priorities before collecting.`;
              }

              await money.setItem(input.senderID, {
                money: newMoney,
                [self.key + "Stamp"]: null,
                [self.key + "MaxZ"]: actionMax,
                [self.key + "Total"]: totalItems,
                [self.key + "Tune"]: [],
                cassEXP: cassEXP.raw(),
              });

              return output.reply(text);
            },
          },
          {
            key: "total",
            description:
              "Displays the total number of items earned, along with detailed information such as rarity, processing time, price range, and rankings based on the most frequently earned item types.",
            aliases: ["-t"],
            icon: "📦",

            async handler(__, _) {
              const { [self.key + "Total"]: totalItems = {}, name } =
                await money.getItem(input.senderID);
              if (!name) {
                return output.reply(
                  "❌ Please register first using the identity-setname command."
                );
              }

              let result = `📝 **Total ${self.verb}s Items**:\n\n`;
              const sortedItems = Object.entries(totalItems).sort(
                (a, b) => b[1] - a[1]
              );
              sortedItems.forEach(([itemName, itemCount]) => {
                const data = self.itemData.find(
                  (item) => item.name === itemName
                );
                result += `${self.checkIcon} ${
                  data.icon
                } **${itemName}**\nSold Amount: ${itemCount}\nRarity: ${
                  100 - data.chance * 100
                }%\nProcessing Time: ${
                  data.delay
                } minutes.\nPrice Range:\nBetween ${data.priceA} and ${
                  data.priceB
                }.\n\n`;
              });
              const totalHarvest = Object.values(totalItems).reduce(
                (acc, count) => acc + count,
                0
              );
              result += `\n**Total**: ${totalHarvest}`;
              return output.reply(result);
            },
          },
          {
            key: "check",
            description:
              "Checks the progress of your tuned items and their remaining collection time.",
            icon: "✅",
            // @ts-ignore
            async handler(_, __) {
              const {
                money: _userMoney,
                [self.key + "Stamp"]: actionStamp,
                [self.key + "MaxZ"]: actionMax = self.storage,
                [self.key + "Total"]: _totalItems = {},
                [self.key + "Tune"]: actionTune = [],
                cassEXP: _cxp,
                name: _name,
              } = await money.getItem(input.senderID);

              function formatDuration(ms) {
                const seconds = Math.floor(ms / 1000) % 60;
                const minutes = Math.floor(ms / (1000 * 60)) % 60;
                const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
                const days = Math.floor(ms / (1000 * 60 * 60 * 24));

                const parts = [];
                if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
                if (hours > 0)
                  parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
                if (minutes > 0)
                  parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
                if (seconds > 0)
                  parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

                return parts.length > 1
                  ? parts.slice(0, -1).join(", ") + " and " + parts.slice(-1)
                  : parts[0] || "0 seconds";
              }

              const mapped = actionTune.map((itemName, ind) => {
                const data = self.itemData.find(
                  (item) => item.name === itemName
                );
                return `**${ind + 1}**. ${data.icon} **${itemName}**\nRarity: ${
                  100 - data.chance * 100
                }%\nProcessing Time: ${
                  data.delay
                } minutes.\nPrice Range:\nBetween ${data.priceA} and ${
                  data.priceB
                }.`;
              });

              const timeElapsed = actionStamp
                ? formatDuration(Date.now() - actionStamp)
                : "❌ Not yet tuned.";

              return output.reply(
                `🗃️ **Max Storage**:\n${Number(
                  actionMax
                ).toLocaleString()}\n\n⌛ **Time Since Tuning**:\n${timeElapsed}\n\n🚀 **Tuned Items:**\n\n${
                  mapped.length > 0 ? mapped.join("\n\n") : "[ No Tuned Items ]"
                }\n\nUse +${commandName}-collect to claim your yield or profit at the right time.\n⚠️ Collecting too early will **reduce your earnings** and **require retuning**, while collecting too late may cause **storage overflow**, leading to lost profits.`
              );
            },
          },
          {
            key: "upgrade",
            description: "Upgrade your storage.",
            aliases: ["-u"],
            icon: "🛒",
            /**
             * @type {import("@cass-modules/spectralCMDHome").Handler}
             */
            async handler(_, __) {
              const data = self.stoData ?? stoData[self.key];
              if (!data) {
                return output.reply(
                  `🔍 The upgrade data is **missing**, we cannot determine the price so we cannot upgrade.`
                );
              }
              data.key ??= `${self.key}MaxZ`;
              data.price ??= 100;
              const {
                money: _userMoney,
                battlePoints: bp = 0,
                [self.key + "Stamp"]: _actionStamp,
                [self.key + "MaxZ"]: _actionMax = self.storage,
                [self.key + "Total"]: _totalItems = {},
                [data.key]: storage,
                [`${data.key}_upgrades`]: upgrades = 0,
                inventory: inv,
                name: _name,
              } = await money.getItem(input.senderID);
              const inventory = new Inventory(inv);

              if (!storage) {
                return output.reply(
                  `🎀 You cannot upgrade without playing the game.`
                );
              }

              let hasDiscount = inventory.has("silkRibbon");
              let multiplier = 1;
              if (hasDiscount) {
                multiplier = 0.75;
              }
              let price = Math.floor(data.price * 2 ** upgrades * multiplier);
              if (isNaN(price)) {
                return output.wentWrong();
              }
              if (bp < price) {
                return output.reply(
                  `❌ The price of "${
                    self.key
                  }" **storage** upgrade is **${price.toLocaleString()}**💷 but you only have **${bp.toLocaleString()}**💷.\n\n**Before Upgrading**: ${Number(
                    storage
                  ).toLocaleString()} 🗃️\n**After Upgrading**: ${(
                    storage * 2
                  ).toLocaleString()} 🗃️`
                );
              }

              const i = await output.reply(
                `⚠️ Buy "${
                  self.key
                }" storage upgrade for **${price.toLocaleString()}**💷?\n**Before Upgrading**: ${Number(
                  storage
                ).toLocaleString()} 🗃️\n**After Upgrading**: ${(
                  storage * 2
                ).toLocaleString()} 🗃️\n\n**Battle Points**\nBefore - **${bp.toLocaleString()}**💷\nAfter - **${(
                  bp - price
                ).toLocaleString()}**💷\n\n***Reply anything to confirm***`
              );

              input.setReply(i.messageID, {
                key: self.key,
                /**
                 * @type {CommandEntry}
                 */
                async callback({ output }) {
                  input.delReply(i.messageID);
                  await money.setItem(input.senderID, {
                    [`${data.key}_upgrades`]: upgrades + 1,
                    battlePoints: bp - price,
                    [data.key]: storage * 2,
                  });
                  await output.replyStyled(
                    `✅ Successfully purchased "${self.key}"${
                      hasDiscount ? "25% OFF! 🎀" : ""
                    } storage upgrade for ${price}💷!\n\n**Old Storage**: ${storage} 🗃️\n**New Storage**: ${
                      storage * 2
                    } 🗃️\n**New Battle Points**: ${bp - price}💷 (-${price})`,
                    context.command?.style ?? {
                      title: "🛒 Upgrader",
                      titleFont: "bold",
                      contentFont: "fancy",
                    }
                  );
                },
              });
            },
          },
        ]);
        return home.runInContext(context);
      } catch (error) {
        return context.output.error(error);
      }
    }
  }
  class ItemPrompt {
    constructor(inventory = []) {
      const { Inventory } = obj;
      this.inv = new Inventory([...inventory]);
    }
    async selectItem({
      format = async (i) => {
        return i;
      },
      onItem = async function (_ctx, _item) {},
      head = "",
      bottom = "",
      onWrong = undefined,
    } = {}) {
      const { output, Inventory } = obj;
      format ??= async (inv) => {
        return [...inv].map(
          (item, n) => `${n + 1} ${item.icon} **${item.name}** (${item.key})\n`
        );
      };
      const self = this;
      return output.waitForReply(
        `${head}\n${await format(this.inv)}\n${bottom}`.trim(),
        async (ctx) => {
          const {
            repObj: { resolve },
          } = ctx;
          let targetItem = self.inv
            .getAll()
            .find(
              (_, i) => String(i) === String(parseInt(ctx.input.words[0]) + 1)
            );
          if (!targetItem) {
            if (onWrong) {
              return await onWrong(ctx);
            }
            return ctx.output.reply(`❌ Item not found.`);
          }
          let { inventory: newInv } = await ctx.money.getItem(
            ctx.input.senderID
          );
          const inv = new Inventory(newInv);
          if (![...inv].some((i) => i === targetItem)) {
            return ctx.output.reply(`❌ Missing item!`);
          }
          await onItem(ctx, targetItem);
          return resolve(targetItem);
        }
      );
    }
  }
  obj.ItemPrompt = ItemPrompt;
  obj.GameSimulator = GameSimulator;
  obj.isTimeAvailable = isTimeAvailable;
  obj.ItemLister = ItemLister;
  obj.next();
}
