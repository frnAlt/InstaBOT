"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registeredExtensions = exports.CassExtensions = void 0;
exports.getEnabledExtensions = getEnabledExtensions;
exports.type = type;
exports.sortExtensions = sortExtensions;
const path_1 = __importDefault(require("path"));
const github_1 = require("./github");
const fs_1 = __importDefault(require("fs"));
class CassExtensions extends Array {
    constructor(array = [], ...etc) {
        if (Array.isArray(array)) {
            super(...array);
        }
        else {
            super(array, ...etc);
        }
        this.normalizeExtensions();
    }
    normalizeExtensions() {
        const all = this;
        for (const item of all) {
            item.category ??= "generic";
            item.category = String(item.category).startsWith("custom_")
                ? item.category
                : `custom_${item.category}`;
            item.info ??= {};
            item.packageName ??= "No Name";
            item.packageDesc = String(item.packageName);
            item.id ??= null;
            item.packagePermissions ??= [];
            if (!Array.isArray(item.packagePermissions)) {
                item.packagePermissions = [];
            }
            item.packageDesc ??= "No Description";
            item.packageDesc = String(item.packageDesc);
            if (typeof item.info !== "object" || !item.info) {
                item.info = {};
            }
        }
        const nullIDs = new Array(...this).filter((i) => !i.id);
        this.removeExtensions(...nullIDs);
    }
    getCategorized(category) {
        return new CassExtensions(this.filter((i) => i.category === category));
    }
    hasCategorized(category) {
        return this.getCategorized(category).length > 0;
    }
    getCategory(item) {
        return item.category;
    }
    hasID(id) {
        return this.some((i) => i.id === id);
    }
    getAllID(id) {
        return this.filter((i) => id === i.id);
    }
    getID(id) {
        return this.find((i) => id === i.id);
    }
    clearDuplicates(id) {
        if (this.hasID(id)) {
            this.removeExtensions(...this.getAllID(id));
        }
        return this;
    }
    registerExtensions(...items) {
        items.forEach((item) => {
            this.clearDuplicates(item.id);
            super.push(item);
        });
        this.normalizeExtensions();
        return this;
    }
    removeExtensions(...refs) {
        for (const ref of refs) {
            const index = this.indexOf(ref);
            this.splice(index, 1);
        }
        return this;
    }
    push(...items) {
        this.registerExtensions(...items);
        return this.length;
    }
    async downloadRemoteExtensions() {
        const folder = "/";
        const repo = "lianecagara/CassReduxExtensions";
        console.log(`📥 Fetching extensions from ${repo}${folder}...`);
        try {
            const files = (await (0, github_1.fetchFileContents)(folder, repo)).filter((i) => i.name.endsWith(".js"));
            console.log(`🔍 Found ${files.length} JavaScript files.`);
            for (const file of files) {
                try {
                    console.log(`📄 Downloading: ${file.name}`);
                    const content = await file.download();
                    const pathh = path_1.default.join(process.cwd(), "CommandFiles", "extensions");
                    if (!fs_1.default.existsSync(pathh)) {
                        console.log(`📂 Creating directory: ${pathh}`);
                        fs_1.default.mkdirSync(pathh, { recursive: true });
                    }
                    const filePath = path_1.default.join(pathh, file.name);
                    if (fs_1.default.existsSync(filePath)) {
                        console.warn(`⚠️ File already exists: ${filePath}, skipping.`);
                    }
                    else {
                        console.log(`💾 Saving file: ${filePath}`);
                        await fs_1.default.promises.writeFile(filePath, content);
                    }
                    // const mURL = pathToFileURL(filePath);
                    // mURL.searchParams.set("timestamp", Date.now().toString());
                    console.log(`🚀 Importing module: ${filePath}`);
                    const moduleData = require("../extensions/" + file.name) ?? {};
                    if (moduleData.default) {
                        console.log(`✅ Successfully imported ${file.name}`);
                        this.push(moduleData.default);
                    }
                    else {
                        console.warn(`⚠️ No default export found in ${file.name}`);
                    }
                }
                catch (error) {
                    console.error(`❌ Error processing ${file.name}:`, error);
                }
            }
        }
        catch (error) {
            console.error("❌ Error fetching extensions:", error);
        }
    }
}
exports.CassExtensions = CassExtensions;
exports.registeredExtensions = new CassExtensions([]);
function getEnabledExtensions(userData) {
    const { extensionIDs = [] } = userData;
    const extensions = extensionIDs
        .filter((i) => typeof i === "string")
        .map((i) => exports.registeredExtensions.getID(i));
    return new CassExtensions(extensions);
}
function type(value, target) {
    return target !== undefined ? typeof value === target : typeof value;
}
function sortExtensions(items) {
    return new CassExtensions([...items].sort((a, b) => b.importance - a.importance));
}
