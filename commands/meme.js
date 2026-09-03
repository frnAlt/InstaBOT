/**
 * Random Meme Command
 * Fetches hilarious viral memes from top communities
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "meme",
    aliases: ["memes", "dankmeme"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Fetches a random funny meme"
    },
    longDescription: {
      en: "Retrieves high-rated trending memes from popular communities."
    },
    category: "fun",
    guide: {
      en: "{p}meme"
    }
  },

  onStart: async function ({ api, event, message }) {
    const threadID = event.threadId || event.threadID;

    try {
      // Primary API: meme-api.com
      const res = await axios.get("https://meme-api.com/gimme", { timeout: 6000 }).catch(() => null);

      if (res?.data && res.data.url) {
        const title = res.data.title;
        const postLink = res.data.postLink;
        const ups = res.data.ups;
        const stream = await global.utils.getStreamFromURL(res.data.url, "meme.jpg").catch(() => null);

        if (stream) {
          const caption = `🐸 ${title}\n👍 ${ups.toLocaleString()} upvotes | r/${res.data.subreddit}`;
          return message 
            ? message.reply({ body: caption, attachment: stream })
            : api.sendMessage({ body: caption, attachment: stream }, threadID);
        }
      }

      // Fallback API
      const fallbackRes = await axios.get("https://api.popcat.xyz/meme", { timeout: 6000 }).catch(() => null);
      if (fallbackRes?.data?.image) {
        const stream = await global.utils.getStreamFromURL(fallbackRes.data.image, "meme.jpg").catch(() => null);
        if (stream) {
          const caption = `🐸 ${fallbackRes.data.title || 'Meme'}\n👍 ${fallbackRes.data.upvotes || 0} upvotes`;
          return message 
            ? message.reply({ body: caption, attachment: stream })
            : api.sendMessage({ body: caption, attachment: stream }, threadID);
        }
      }

      const errMsg = "❌ Could not fetch a fresh meme right now. Please try again in a few moments!";
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    } catch (err) {
      const errMsg = `❌ Error retrieving meme: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
