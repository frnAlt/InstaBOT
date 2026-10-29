"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GDBrowserAPI = void 0;
const axios_1 = __importDefault(require("axios"));
var GDBrowserAPI;
(function (GDBrowserAPI) {
    GDBrowserAPI.baseUrl = "https://gdbrowser.com/api";
    GDBrowserAPI.mainUrl = "https://gdbrowser.com";
    async function level(levelId, params) {
        return (await get("level", levelId, params)).data;
    }
    GDBrowserAPI.level = level;
    async function getLevelIDFromPage(url) {
        const html = (await axios_1.default.get(url)).data;
        const match = html.match(/<title>.*\((\d+)\)<\/title>/);
        return match ? match[1] : null;
    }
    GDBrowserAPI.getLevelIDFromPage = getLevelIDFromPage;
    async function profile(username, params) {
        return (await get("profile", username, params)).data;
    }
    GDBrowserAPI.profile = profile;
    async function search(query, params) {
        return (await get("search", query, params)).data;
    }
    GDBrowserAPI.search = search;
    async function comments(levelId, params) {
        return (await get("comments", levelId, params)).data;
    }
    GDBrowserAPI.comments = comments;
    GDBrowserAPI.headers = {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
        Connection: "keep-alive",
        Cookie: "_ga_3EHJW0BL52=deleted; _ga=GA1.1.1844855046.1754459322; _ga_3EHJW0BL52=GS2.1.s1760537977$o1$g1$t1760538844$j60$l0$h0; _ga_JRGBZWQKV5=GS2.1.s1760536259$o5$g1$t1760538844$j60$l0$h0",
        Host: "gdbrowser.com",
        "If-None-Match": 'W/"295c-iXe7fbF0PSHkd/SKE2Ds2SGxNBc"',
        "Sec-CH-UA": '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    };
    async function get(endpoint, identifier, params) {
        const start = Date.now();
        let response;
        try {
            response = await axios_1.default.get(`${GDBrowserAPI.baseUrl}/${endpoint}/${encodeURIComponent(identifier)}`, {
                params: params,
                headers: GDBrowserAPI.headers,
            });
        }
        catch (err) {
            throw err;
        }
        const end = Date.now();
        if (response.data === "-1") {
            throw new Error("The server response was '-1'");
        }
        return { data: response.data, ping: end - start };
    }
})(GDBrowserAPI || (exports.GDBrowserAPI = GDBrowserAPI = {}));
