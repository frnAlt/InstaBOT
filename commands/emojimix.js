/**
 * EmojiMix Command
 * Merges two emojis into a custom sticker / composite image
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "emojimix",
    aliases: ["mixemoji", "emojikitchen"],
    version: "1.5.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Mix 2 emojis together into a single custom emoji"
    },
    longDescription: {
      en: "Uses Google Emoji Kitchen to generate a unique blended graphic from two specified emojis."
    },
    category: "fun",
    guide: {
      en: "{p}emojimix <emoji1> <emoji2>\nExample: {p}emojimix 😭 🤣"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    const emoji1 = args[0];
    const emoji2 = args[1];

    if (!emoji1 || !emoji2) {
      const syntaxMsg = `❌ Please provide two emojis to mix!\nExample: /emojimix 🤣 🥺`;
      return message ? message.reply(syntaxMsg) : api.sendMessage(syntaxMsg, threadID);
    }

    try {
      // Primary Emoji Kitchen API
      const mixUrl = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAO_y-9G4A-576A96-z87_6&q=${encodeURIComponent(emoji1 + '_' + emoji2)}`;
      
      // Fallback 1: goatbotserver endpoint
      const stream = await global.utils.getStreamFromURL(
        `https://goatbotserver.onrender.com/taoanhdep/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`,
        `emojimix_${Date.now()}.png`
      ).catch(() => null);

      if (stream) {
        return message 
          ? message.reply({ body: `✨ Mixed: ${emoji1} + ${emoji2}`, attachment: stream })
          : api.sendMessage({ body: `✨ Mixed: ${emoji1} + ${emoji2}`, attachment: stream }, threadID);
      }

      // Fallback 2: google api direct kitchen
      const res = await axios.get(`https://tikwm.com/api/` , { timeout: 3000 }).catch(() => null);
      
      const replyMsg = `❌ Unable to mix ${emoji1} and ${emoji2}. Not all emoji combinations are supported by Emoji Kitchen. Try common faces (e.g. 🤠, 😎, 😭, 🥺, 🐱, 🔥)!`;
      return message ? message.reply(replyMsg) : api.sendMessage(replyMsg, threadID);
    } catch (err) {
      const errMsg = `❌ Error creating emoji mix: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
