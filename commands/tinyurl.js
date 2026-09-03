/**
 * TinyURL & Link Shortener Command
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "tinyurl",
    aliases: ["shorturl", "shorten", "isgd"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Shorten long URLs using TinyURL or is.gd"
    },
    longDescription: {
      en: "Compresses lengthy links into clean short URLs with click tracking."
    },
    category: "utility",
    guide: {
      en: "{p}tinyurl <url> or reply to a message containing a URL"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    let targetUrl = args[0];

    if (!targetUrl && event.messageReply?.body) {
      const match = event.messageReply.body.match(/https?:\/\/[^\s]+/i);
      if (match) targetUrl = match[0];
    }

    if (!targetUrl) {
      const promptMsg = "❌ Please provide a URL to shorten (e.g. /tinyurl https://example.com) or reply to a message containing a link.";
      return message ? message.reply(promptMsg) : api.sendMessage(promptMsg, threadID);
    }

    try {
      // Primary: tinyurl
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(targetUrl)}`, { timeout: 6000 });
      if (res.data && res.data.startsWith('http')) {
        const replyText = `🔗 𝗦𝗵𝗼𝗿𝘁𝗲𝗻𝗲𝗱 𝗨𝗥𝗟:\n${res.data}\n\n📍 Original: ${targetUrl}`;
        return message ? message.reply(replyText) : api.sendMessage(replyText, threadID);
      }
      throw new Error("Invalid response from TinyURL");
    } catch (e) {
      try {
        // Fallback: is.gd
        const fallbackRes = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(targetUrl)}`, { timeout: 6000 });
        if (fallbackRes.data && fallbackRes.data.startsWith('http')) {
          const replyText = `🔗 𝗦𝗵𝗼𝗿𝘁𝗲𝗻𝗲𝗱 𝗨𝗥𝗟 (is.gd):\n${fallbackRes.data}\n\n📍 Original: ${targetUrl}`;
          return message ? message.reply(replyText) : api.sendMessage(replyText, threadID);
        }
      } catch (err2) {}

      const errMsg = "❌ Could not shorten this URL. Please verify the link format and try again.";
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
