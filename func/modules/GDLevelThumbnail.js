"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quality = void 0;
exports.fetchThumbnail = fetchThumbnail;
const axios_1 = __importDefault(require("axios"));
var Quality;
(function (Quality) {
    Quality[Quality["Small"] = 0] = "Small";
    Quality[Quality["Medium"] = 1] = "Medium";
    Quality[Quality["High"] = 2] = "High";
})(Quality || (exports.Quality = Quality = {}));
/**
 * Builds thumbnail URL
 */
function buildThumbnailURL(levelID, quality, options) {
    const baseURL = options?.baseURL ?? "https://levelthumbs.prevter.me";
    const legacy = options?.legacy ?? false;
    if (legacy) {
        return `${baseURL}/${levelID}.png`;
    }
    if (quality === Quality.High) {
        return `${baseURL}/thumbnail/${levelID}`;
    }
    return `${baseURL}/thumbnail/${levelID}/${quality}`;
}
/**
 * Fetches thumbnail as stream
 * Returns Readable stream or null if not found
 */
async function fetchThumbnail(levelID, quality, options) {
    const url = buildThumbnailURL(levelID, quality, options);
    try {
        const response = await axios_1.default.get(url, {
            responseType: "stream",
            validateStatus: (status) => status === 200 || status === 404,
        });
        if (response.status === 404) {
            return null;
        }
        return response.data;
    }
    catch (err) {
        console.warn(`Failed to fetch thumbnail from ${url}:`, err);
        return null;
    }
}
