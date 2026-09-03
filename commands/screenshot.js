/**
 * Webpage Screenshot Command
 * Captures rendered screenshots of any webpage URL
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "screenshot",
    aliases: ["ss", "webshot", "capture"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Take a screenshot of a webpage"
    },
    longDescription: {
      en: "Captures a high-resolution snapshot of any valid website URL and returns the image."
    },
    category: "utility",
    guide: {
      en: "{p}screenshot <url>\nExample: {p}screenshot https://google.com"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    let url = args.join(" ").trim();

    if (!url && event.messageReply?.body) {
      const match = event.messageReply.body.match(/https?:\/\/[^\s]+/i);
      if (match) url = match[0];
    }

    if (!url) {
      const prompt = "📸 Please provide a webpage URL (e.g. /screenshot https://github.com) or reply to a link.";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    if (message && typeof message.reaction === 'function') {
      message.reaction("📸", event.messageID);
    }

    try {
      // Primary screenshot endpoint
      const primaryUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${encodeURIComponent(url)}`;
      let stream = await global.utils.getStreamFromURL(primaryUrl, "screenshot.png").catch(() => null);

      if (!stream) {
        // Fallback endpoint
        const fallbackUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
        stream = await global.utils.getStreamFromURL(fallbackUrl, "screenshot.png").catch(() => null);
      }

      if (stream) {
        const caption = `📸 𝗪𝗲𝗯𝗽𝗮𝗴𝗲 𝗦𝗰𝗿𝗲𝗲𝗻𝘀𝗵𝗼𝘁:\n🔗 ${url}`;
        return message 
          ? message.reply({ body: caption, attachment: stream })
          : api.sendMessage({ body: caption, attachment: stream }, threadID);
      }

      const failMsg = `❌ Unable to take screenshot of ${url}. Please make sure the website is publicly accessible.`;
      return message ? message.reply(failMsg) : api.sendMessage(failMsg, threadID);
    } catch (err) {
      const errMsg = `❌ Screenshot capture failed: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
