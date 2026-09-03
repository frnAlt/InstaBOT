/**
 * YouTube Downloader Command (Audio & Video)
 * High-speed YouTube audio and video downloads with interactive selection
 */

const yts = require("yt-search");
const ytdl = require("@distube/ytdl-core");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "ytb",
    aliases: ["youtube", "ytdl2"],
    version: "2.0.0",
    author: "Gtajisan && frnAlt",
    cooldown: 5,
    role: 0,
    shortDescription: {
      en: "YouTube video and audio downloader"
    },
    longDescription: {
      en: "Search YouTube and download MP3 audio or MP4 video files directly."
    },
    category: "media",
    usage: "{p}ytb -a <query> (Audio) or {p}ytb -v <query> (Video)"
  },

  onStart: async function ({ message, args, event, api, commandName }) {
    const threadID = event.threadId || event.threadID;
    const type = (args[0] || "").toLowerCase();
    const query = args.slice(1).join(" ").trim();

    if (!["-a", "-v", "audio", "video"].includes(type) || !query) {
      const syntax = `📺 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n\n📌 Usage:\n• /ytb -a <song name> (Download Audio)\n• /ytb -v <video title> (Download Video)\n\nExample: /ytb -a Alan Walker Faded`;
      return message ? message.reply(syntax) : api.sendMessage(syntax, threadID);
    }

    const downloadType = (type === "-a" || type === "audio") ? "audio" : "video";

    if (message && typeof message.reaction === 'function') {
      message.reaction("⏳", event.messageID);
    }

    try {
      const search = await yts(query);
      const results = (search?.videos || []).slice(0, 6);

      if (results.length === 0) {
        if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
        const noRes = `❌ No YouTube results found for "${query}".`;
        return message ? message.reply(noRes) : api.sendMessage(noRes, threadID);
      }

      let msg = `📺 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗦𝗲𝗮𝗿𝗰𝗵 [${downloadType.toUpperCase()}]:\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
      results.forEach((v, i) => {
        msg += `${i + 1}. ${v.title}\n   ⏱️ ${v.timestamp || 'N/A'} | 👤 ${v.author?.name || 'YouTube'}\n\n`;
      });
      msg += `👉 Reply with number (1-${results.length}) to download!`;

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
          commandName: "ytb",
          author: event.senderID,
          results,
          downloadType
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

    const isAudio = Reply.downloadType === "audio";
    const ext = isAudio ? "mp3" : "mp4";
    const tempPath = path.join(os.tmpdir(), `ytb_${Date.now()}.${ext}`);

    try {
      // 1. Native ytdl-core stream download
      try {
        const stream = ytdl(selected.url, {
          filter: isAudio ? 'audioonly' : 'videoandaudio',
          quality: isAudio ? 'highestaudio' : 'highestvideo'
        });
        const writer = fs.createWriteStream(tempPath);
        stream.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const stats = await fs.stat(tempPath);
        if (stats.size > 1000) {
          if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);
          const caption = `✅ 𝗬𝗼𝘂𝗧𝘂𝗯𝗲: ${selected.title}\n⏱️ Duration: ${selected.timestamp || 'N/A'}`;
          await message.reply({ body: caption, attachment: tempPath });
          setTimeout(() => fs.remove(tempPath).catch(() => {}), 30000);
          return;
        }
      } catch (_) {}

      // 2. Cobalt API Fallback
      try {
        const cobRes = await axios.post(`https://api.cobalt.tools/api/json`, {
          url: selected.url,
          downloadMode: isAudio ? "audio" : "auto"
        }, {
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          timeout: 15000
        });
        if (cobRes.data?.url) {
          if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);
          const caption = `✅ 𝗬𝗼𝘂𝗧𝘂𝗯𝗲: ${selected.title}`;
          return message ? message.reply({ body: caption, attachment: cobRes.data.url }) : api.sendMessage({ body: caption, attachment: cobRes.data.url }, threadID);
        }
      } catch (_) {}

      throw new Error("Could not download stream");
    } catch (err) {
      if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
      const errMsg = `❌ Download failed: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
