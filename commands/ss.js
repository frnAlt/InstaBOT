const axios = require('axios');

module.exports = {
  config: {
    name: "screenshot",
    aliases: ["ss", "webss"],
    version: "1.0",
    author: "NeoKEX && frnAlt",
    cooldown: 10,
    role: 0,
    description: "Captures a screenshot of a given website URL.",
    category: "tools",
    usage: "ss <URL>"
  },

  onStart: async function ({ args, message, event, api }) {
    const userUrl = args[0];

    if (!userUrl) {
      return message.reply("❌ Please provide a URL. Example: `ss https://google.com`");
    }

    if (!userUrl.startsWith('http')) {
        return message.reply("❌ Invalid URL. Please include `http://` or `https://`.");
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const fullApiUrl = `https://image.thum.io/get/width/1200/crop/800/${encodeURIComponent(userUrl)}`;

      await message.reply({
        body: `✨ Screenshot of ${userUrl}:`,
        attachment: fullApiUrl
      });
      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(`❌ Error: ${error.message}`);
    }
  }
};
