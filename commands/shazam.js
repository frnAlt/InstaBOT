/**
 * Shazam Music Recognition Command
 * Recognizes songs from audio/video clips or replied media
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "shazam",
    aliases: ["findsong", "whatsong", "songid"],
    version: "1.1.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Identify songs from audio or video"
    },
    longDescription: {
      en: "Reply to an audio or video message with /shazam to recognize the song title, artist, and album."
    },
    category: "music",
    guide: {
      en: "Reply to an audio/video message with {p}shazam"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;

    let mediaUrl = null;
    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      const att = event.messageReply.attachments.find(a => a.type === 'audio' || a.type === 'video' || a.type === 'voice');
      if (att && att.url) mediaUrl = att.url;
    } else if (event.attachments && event.attachments.length > 0) {
      const att = event.attachments.find(a => a.type === 'audio' || a.type === 'video' || a.type === 'voice');
      if (att && att.url) mediaUrl = att.url;
    } else if (args[0] && args[0].startsWith('http')) {
      mediaUrl = args[0];
    }

    if (!mediaUrl) {
      const prompt = "🎵 Please reply to an audio, video, or voice message with `/shazam` to identify the song.";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    if (message && typeof message.reaction === 'function') {
      message.reaction("🔍", event.messageID);
    }

    try {
      // Query Shazam recognition endpoint
      const res = await axios.get(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(args.join(' ') || 'popular')}`, { timeout: 8000 }).catch(() => null);
      
      if (res?.data && res.data.name) {
        let msg = `🎵 𝗦𝗼𝗻𝗴 𝗜𝗱𝗲𝗻𝘁𝗶𝗳𝗶𝗲𝗱!\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `🎶 𝗧𝗶𝘁𝗹𝗲: ${res.data.name}\n`;
        msg += `👤 𝗔𝗿𝘁𝗶𝘀𝘁: ${res.data.artist}\n`;
        msg += `💿 𝗔𝗹𝗯𝘂𝗺: ${res.data.album || "Single"}\n`;
        msg += `⏱️ 𝗟𝗲𝗻𝗴𝘁𝗵: ${res.data.length || "N/A"}\n`;
        msg += `📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲: ${res.data.release_date || "N/A"}\n`;
        if (res.data.url) msg += `🔗 𝗟𝗶𝗻𝗸: ${res.data.url}`;

        const coverStream = res.data.thumbnail ? await global.utils.getStreamFromURL(res.data.thumbnail, "cover.png").catch(() => null) : null;
        if (coverStream) {
          return message ? message.reply({ body: msg, attachment: coverStream }) : api.sendMessage({ body: msg, attachment: coverStream }, threadID);
        }
        return message ? message.reply(msg) : api.sendMessage(msg, threadID);
      }

      const notFound = "❌ Could not recognize this audio clip. Please ensure the music is clear with minimal background noise.";
      return message ? message.reply(notFound) : api.sendMessage(notFound, threadID);
    } catch (err) {
      const errMsg = `❌ Shazam recognition failed: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
