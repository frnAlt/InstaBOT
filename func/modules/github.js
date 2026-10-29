"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.originalRepo = exports.GithubFileClass = void 0;
exports.fetchFileContents = fetchFileContents;
exports.bulkFetch = bulkFetch;
const axios_1 = __importDefault(require("axios"));
const node_url_1 = require("node:url");
class GithubFileClass {
    name;
    path;
    sha;
    size;
    url;
    html_url;
    git_url;
    download_url;
    type;
    _links;
    constructor(file) {
        Object.assign(this, file);
    }
    async download(key) {
        if (typeof key === "string") {
            // @ts-ignore
            const res = await axios_1.default.get(this[key], { responseType: "text" });
            return res.data;
        }
        const res = await axios_1.default.get(this.download_url, { responseType: "text" });
        return res.data;
    }
}
exports.GithubFileClass = GithubFileClass;
exports.originalRepo = "lianecagara/CassidyRedux";
async function fetchFileContents(folder = "", repo = exports.originalRepo) {
    try {
        folder = folder.replace(/^\/+/, "");
        const url = new node_url_1.URL(`${repo}/contents/${folder}`, "https://api.github.com/repos/").toString();
        const res = await axios_1.default.get(url);
        return res.data.map((i) => new GithubFileClass(i));
    }
    catch (error) {
        console.error("❌ Error fetching GitHub file contents:", error);
        throw new Error("Failed to fetch file contents. Check the repository or folder path.");
    }
}
async function bulkFetch(...urls) {
    return Promise.all(urls.map(async (url) => {
        try {
            const res = await axios_1.default.get(url, { responseType: "text" });
            return res.data;
        }
        catch (error) {
            console.error(`❌ Error fetching ${url}:`, error);
            return null;
        }
    }));
}
