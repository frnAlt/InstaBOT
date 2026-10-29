"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DekuAlt = exports.Deku = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * An Axios instance configured to interact with the Deku API.
 *
 * @constant
 * @default
 * var baseURL = "https://api.zetsu.xyz";
 * @example
 * const res = await Deku.get("/download/all", {
 *  params: {
 *    url: "https://example.com"
 *   }
 * })
 */
exports.Deku = axios_1.default.create({
    baseURL: "https://api.zetsu.xyz",
    headers: {
        Cookie: process.env.deku_cookie ?? "",
    },
});
/**
 * An Axios instance configured to interact with the Deku API.
 *
 * @constant
 * @default
 * var baseURL = "http://87.106.100.187:6312/";
 * @example
 * const res = await Deku.get("/download/all", {
 *  params: {
 *    url: "https://example.com"
 *   }
 * })
 */
exports.DekuAlt = axios_1.default.create({
    baseURL: "http://87.106.100.187:6312/",
    headers: {
        Cookie: process.env.deku_cookie ?? "",
    },
});
exports.default = { Deku: exports.Deku, DekuAlt: exports.DekuAlt };
