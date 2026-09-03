/**
 * YouTube Video Downloader Command
 * Searches and downloads MP4 videos from YouTube
 */

const yts = require("yt-search");
const ytdl = require("@distube/ytdl-core");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "video",
    aliases: ["vdo", "ytvideo"],
    version: "2.1.0",
    author: "Gtajisan && frnAlt",
    cooldown: 10,
    role: 0,
    shortDescription: {
      en: "Search and download YouTube video"
    },
    longDescription: {
      en: "Searches YouTube for videos and streams high definition MP4 video files."
    },
    category: "media",
    usage: "{p}video <query>\nExample: {p}video Faded Alan Walker"
  },

  onStart: async function ({ message, args, event, api, commandName }) {
    const threadID = event.threadId || event.threadID;
    const query = args.join(" ").trim();

    if (!query) {
      const prompt = "🎥 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗩𝗶𝗱𝗲𝗼 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n\n📌 Usage: /video <video title>\nExample: /video Alan Walker Faded";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    if (message && typeof message.reaction === 'function') {
      message.reaction("⏳", event.messageID);
    }

    try {
      const search = await yts(query);
      const searchResults = (search?.videos || []).slice(0, 6).map(v => ({
        title: v.title,
        url: v.url,
        duration: v.timestamp || `${Math.floor(v.seconds / 60)}:${v.seconds % 60}`,
        author: v.author?.name || 'YouTube'
      }));

      if (searchResults.length === 0) {
        if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
        const noRes = "❌ No videos found. Please try another query.";
        return message ? message.reply(noRes) : api.sendMessage(noRes, threadID);
      }

      let msg = "🎥 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗩𝗶𝗱𝗲𝗼 𝗦𝗲𝗮𝗿𝗰𝗵:\n━━━━━━━━━━━━━━━━━━━━━\n\n";
      searchResults.forEach((v, i) => {
        msg += `${i + 1}. ${v.title}\n   ⏱️ [${v.duration}] | 👤 ${v.author}\n\n`;
      });
      msg += `👉 Reply with number (1-${searchResults.length}) to download!`;

      let sentMessageID;
      if (message && typeof message.reply === 'function') {
        const sent = await message.reply(msg);
        sentMessageID = sent?.messageID;
      } else {
        const sent = await api.sendMessage(msg, threadID);
        sentMessageID = sent?.messageID;
      }

      if (sentMessageID && global.GoatBot?.onReply) {
        global.GoatBot.onReply.set(sentMessageID, {
          commandName: "video",
          author: event.senderID,
          results: searchResults
        });
      }

      if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);
    } catch (e) {
      if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
      const errMsg = `❌ Search error: ${e.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  onReply: async function ({ message, event, Reply, api }) {
    const threadID = event.threadId || event.threadID;
    if (Reply.author && event.senderID !== Reply.author) return;

    const choice = parseInt(event.body?.trim(), 10);
    if (isNaN(choice) || choice < 1 || choice > Reply.results.length) {
      return message ? message.reply(`⚠️ Please reply with a number between 1 and ${Reply.results.length}!`) : api.sendMessage(`⚠️ Please reply with a number between 1 and ${Reply.results.length}!`, threadID);
    }

    const selected = Reply.results[choice - 1];
    if (global.GoatBot?.onReply) {
      global.GoatBot.onReply.delete(event.messageReply?.messageID || Reply.messageID);
    }

    if (message && typeof message.reaction === 'function') message.reaction("⏳", event.messageID);

    const tempPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);

    try {
      // 1. Native ytdl-core stream download
      try {
        const stream = ytdl(selected.url, { filter: 'videoandaudio', quality: 'highestvideo' });
        const writer = fs.createWriteStream(tempPath);
        stream.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const stats = await fs.stat(tempPath);
        if (stats.size > 1000) {
          if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);
          const caption = `🎥 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗩𝗶𝗱𝗲𝗼: ${selected.title}\n⏱️ [${selected.duration}]`;
          await message.reply({ body: caption, attachment: tempPath });
          setTimeout(() => fs.remove(tempPath).catch(() => {}), 30000);
          return;
        }
      } catch (_) {}

      // 2. Cobalt API Fallback
      try {
        const cobRes = await axios.post(`https://api.cobalt.tools/api/json`, {
          url: selected.url,
          downloadMode: "auto"
        }, {
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          timeout: 15000
        });
        if (cobRes.data?.url) {
          if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);
          const caption = `🎥 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗩𝗶𝗱𝗲𝗼: ${selected.title}`;
          return message ? message.reply({ body: caption, attachment: cobRes.data.url }) : api.sendMessage({ body: caption, attachment: cobRes.data.url }, threadID);
        }
      } catch (_) {}

      throw new Error("Could not download video stream");
    } catch (err) {
      if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
      const errMsg = `❌ Download error: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
