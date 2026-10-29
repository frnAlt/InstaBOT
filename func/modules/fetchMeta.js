const axios = require("axios");
const cheerio = require("cheerio");
// Jr

const cache = {};

async function fetchMeta(uid, force) {
  if (process.env.DEV) {
    return {
      name: "Dev",
      image: "https://www.facebook.com/images/fb_icon_325x325.png",
      url: "https://web.facebook.com/",
      desc: "Not found",
    };
  }
  if (cache[uid] && !force) {
    return cache[uid];
  }
  const url = `https://www.facebook.com/profile.php?id=${encodeURIComponent(
    uid
  )}`;
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Referer: "https://www.facebook.com/",
    Connection: "keep-alive",
    DNT: "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Upgrade-Insecure-Requests": "1",
  };

  try {
    const { data } = await axios.get(url, { headers });
    const $ = cheerio.load(data);

    const meta = {
      name: $('meta[property="og:title"]').attr("content") ?? "Not found",
      image: $('meta[property="og:image"]').attr("content") ?? "Not found",
      url: $('meta[property="og:url"]').attr("content") ?? url,
      desc: $('meta[property="og:description"]').attr("content") ?? "Not found",
    };

    cache[uid] = meta;

    // console.log(meta);

    return cache[uid];
  } catch (err) {
    console.error(err);
    return null;
  }
}

module.exports = fetchMeta;
