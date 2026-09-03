/**
 * YouTube Music & Song Downloader Command
 * Searches YouTube tracks and downloads audio
 */

const yts = require("yt-search");
const ytdl = require("@distube/ytdl-core");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "sing",
    aliases: ["song", "music", "play"],
    version: "2.1.0",
    author: "Gtajisan && frnAlt",
    cooldown: 5,
    role: 0,
    shortDescription: {
      en: "Search and download YouTube audio"
    },
    longDescription: {
      en: "Searches YouTube for songs and streams high quality MP3 audio directly."
    },
    category: "media",
    usage: "{p}sing <song name>"
  },

  onStart: async function ({ message, args, event, api, commandName }) {
    const threadID = event.threadId || event.threadID;
    const query = args.join(" ").trim();

    if (!query) {
      const prompt = "🎵 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗠𝘂𝘀𝗶𝗰 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n\n📌 Usage: /sing <song name>\nExample: /sing Faded Alan Walker";
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
        const noRes = "❌ No songs found. Please try another query.";
        return message ? message.reply(noRes) : api.sendMessage(noRes, threadID);
      }

      let msg = "🎵 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗠𝘂𝘀𝗶𝗰 𝗦𝗲𝗮𝗿𝗰𝗵:\n━━━━━━━━━━━━━━━━━━━━━\n\n";
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
          commandName: "sing",
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

    const tempPath = path.join(os.tmpdir(), `sing_${Date.now()}.mp3`);

    try {
      // 1. Native ytdl-core stream download
      try {
        const stream = ytdl(selected.url, { filter: 'audioonly', quality: 'highestaudio' });
        const writer = fs.createWriteStream(tempPath);
        stream.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const stats = await fs.stat(tempPath);
        if (stats.size > 1000) {
          if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);
          const caption = `🎵 𝗡𝗼𝘄 𝗣𝗹𝗮𝘆𝗶𝗻𝗴: ${selected.title}\n⏱️ [${selected.duration}]`;
          await message.reply({ body: caption, attachment: tempPath });
          setTimeout(() => fs.remove(tempPath).catch(() => {}), 30000);
          return;
        }
      } catch (_) {}

      // 2. Cobalt / API Fallbacks
      const dlEndpoints = [
        `https://api.cobalt.tools/api/json`,
        `https://kaiz-apis.gleeze.com/api/ytdl?url=${encodeURIComponent(selected.url)}`
      ];

      for (const ep of dlEndpoints) {
        try {
          let audioUrl = '';
          if (ep.includes('cobalt')) {
            const cobRes = await axios.post(ep, { url: selected.url, downloadMode: 'audio' }, { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, timeout: 15000 });
            audioUrl = cobRes.data?.url;
          } else {
            const res = await axios.get(ep, { timeout: 15000 });
            audioUrl = res.data?.audio || res.data?.downloadUrl;
          }

          if (audioUrl) {
            if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);
            const caption = `🎵 𝗡𝗼𝘄 𝗣𝗹𝗮𝘆𝗶𝗻𝗴: ${selected.title}`;
            return message ? message.reply({ body: caption, attachment: audioUrl }) : api.sendMessage({ body: caption, attachment: audioUrl }, threadID);
          }
        } catch (_) {}
      }

      throw new Error("Could not fetch audio stream");
    } catch (error) {
      if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
      const errMsg = `❌ Download error: ${error.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
