import axios from "axios";

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
export const Deku = axios.create({
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
export const DekuAlt = axios.create({
  baseURL: "http://87.106.100.187:6312/",
  headers: {
    Cookie: process.env.deku_cookie ?? "",
  },
});

export default { Deku, DekuAlt };
