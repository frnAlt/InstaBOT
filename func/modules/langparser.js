"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangParser = void 0;
const format_with_1 = __importDefault(require("@cass-modules/format-with"));
class LangParser {
    parsedData = new Map();
    constructor(content = "") {
        this.parse(content);
    }
    static stringify(data) {
        let entries;
        if (data instanceof Map) {
            entries = Array.from(data.entries());
        }
        else {
            const flattenObject = (obj, prefix = "") => {
                return Object.entries(obj).flatMap(([key, value]) => {
                    const newKey = prefix ? `${prefix}.${key}` : key;
                    if (value && typeof value === "object" && !Array.isArray(value)) {
                        return flattenObject(value, newKey);
                    }
                    const jsonValue = JSON.stringify(String(value));
                    return [[newKey, jsonValue]];
                });
            };
            entries = flattenObject(data);
        }
        return entries.map(([key, value]) => `${key}=${value}`).join("\n");
    }
    static parse(content) {
        const result = new Map();
        content
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith("#"))
            .forEach((line) => {
            const [key, ...valueParts] = line.split("=");
            const value = valueParts.join("=");
            if (key) {
                const trimmedKey = key.trim();
                const trimmedValue = value.trim();
                try {
                    const parsedValue = JSON.parse(trimmedValue);
                    if (typeof parsedValue === "string") {
                        result.set(trimmedKey, parsedValue);
                    }
                }
                catch (e) {
                    // Ignore invalid JSON, only accept valid JSON strings
                }
            }
        });
        return result;
    }
    parse(content) {
        this.parsedData.clear();
        const parsed = LangParser.parse(content);
        parsed.forEach((value, key) => this.parsedData.set(key, value));
        return this;
    }
    setContent(content) {
        return this.parse(content);
    }
    get(key) {
        return this.parsedData.get(key);
    }
    entries() {
        return new Map(this.parsedData);
    }
    raw() {
        return Object.fromEntries(this.parsedData);
    }
    toString() {
        return LangParser.stringify(this.parsedData);
    }
    createGetLang(langs, k1) {
        langs ??= {};
        k1 ||= global.Cassidy.config.defaultLang ?? "en";
        const getLang = (key_, ...replacers) => {
            if (typeof key_ !== "string") {
                const customLangs = key_;
                let item = customLangs?.[k1] ||
                    customLangs?.[global.Cassidy.config.defaultLang] ||
                    customLangs?.["en_US"] ||
                    customLangs?.["en"];
                if (!item) {
                    return `❌ Cannot find language type: "${k1}" on na custom langs.`;
                }
                return (0, format_with_1.default)(item, ...replacers);
            }
            else {
                let key = String(key_);
                let item = langs?.[k1]?.[key] ||
                    langs?.[global.Cassidy.config.defaultLang]?.[key] ||
                    langs?.[k1]?.["en_US"];
                if (!item) {
                    for (const [langKey, langData] of Object.entries(langs || {})) {
                        if (langKey.startsWith("en_") && langData?.[key]) {
                            item = langData[key];
                            break;
                        }
                    }
                }
                if (!item) {
                    for (const langData of Object.values(langs || {})) {
                        if (langData?.[key]) {
                            item = langData[key];
                            break;
                        }
                    }
                }
                if (!item) {
                    item = this.get?.(key);
                }
                if (!item) {
                    return `❌ Cannot find language properties: "${key}"`;
                }
                return (0, format_with_1.default)(item, ...replacers);
            }
        };
        return getLang;
    }
}
exports.LangParser = LangParser;
