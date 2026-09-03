/**
 * TikTok Video & Audio Downloader Command
 * Search videos by keywords or download directly from TikTok links
 */

const axios = require('axios');

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt", "tik", "tiktokdl"],
    version: "2.1.0",
    author: "Gtajisan && frnAlt",
    cooldown: 5,
    role: 0,
    shortDescription: {
      en: "Search & download TikTok videos without watermark"
    },
    longDescription: {
      en: "Downloads HD TikTok videos or extracts audio from links or keyword search queries."
    },
    category: "media",
    usage: "{p}tiktok <search query or video url>"
  },

  onStart: async function ({ api, args, event, message, commandName }) {
    const threadID = event.threadId || event.threadID;
    let query = args.join(" ").trim();

    if (!query && event.messageReply?.body) {
      const match = event.messageReply.body.match(/https?:\/\/(?:vt\.|vm\.|www\.)?tiktok\.com\/[^\s]+/i);
      if (match) query = match[0];
    }

    if (!query) {
      const prompt = "📱 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n\n📌 Usage:\n• /tiktok <search query> (e.g. /tiktok anime edit)\n• /tiktok <video link>";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    if (message && typeof message.reaction === 'function') {
      message.reaction("⏳", event.messageID);
    }

    // Direct Link Mode
    if (query.startsWith("http://") || query.startsWith("https://")) {
      try {
        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(query)}`, { timeout: 15000 });
        const data = res.data?.data;
        if (!data || (!data.play && !data.wmplay)) {
          throw new Error("Video not found or is private");
        }

        const videoUrl = data.play || data.wmplay;
        const caption = `✅ 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱\n\n👤 Author: @${data.author?.unique_id || 'creator'}\n📝 Title: ${data.title || 'TikTok Video'}\n👍 Likes: ${(data.digg_count || 0).toLocaleString()} | 💬 Comments: ${(data.comment_count || 0).toLocaleString()}`;

        if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);
        return message 
          ? message.reply({ body: caption, attachment: videoUrl })
          : api.sendMessage({ body: caption, attachment: videoUrl }, threadID);
      } catch (err) {
        if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
        const errMsg = `❌ Failed to download TikTok video: ${err.message}`;
        return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
      }
    }

    // Search Query Mode
    try {
      const searchRes = await axios.post(`https://www.tikwm.com/api/feed/search`, {
        keywords: query,
        count: 6,
        cursor: 0,
        web: 1
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000
      }).catch(() => null);

      const results = searchRes?.data?.data?.videos || searchRes?.data?.data || [];
      if (!results || results.length === 0) {
        if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
        const noRes = `❌ No TikTok videos found for "${query}".`;
        return message ? message.reply(noRes) : api.sendMessage(noRes, threadID);
      }

      let menu = `📱 𝗧𝗶𝗸𝗧𝗼𝗸 𝗦𝗲𝗮𝗿𝗰𝗵: "${query}"\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
      results.slice(0, 6).forEach((v, i) => {
        const title = (v.title || 'TikTok Video').substring(0, 60);
        const author = v.author?.unique_id || v.author?.nickname || 'creator';
        menu += `${i + 1}. ${title}\n   • @${author} | ⏱️ ${v.duration || 0}s\n\n`;
      });
      menu += `👉 Reply with number (1-${Math.min(results.length, 6)}) to download!`;

      let sentMessageID;
      if (message && typeof message.reply === 'function') {
        const sent = await message.reply(menu);
        sentMessageID = sent?.messageID;
      } else {
        const sent = await api.sendMessage(menu, threadID);
        sentMessageID = sent?.messageID;
      }

      if (sentMessageID && global.GoatBot?.onReply) {
        global.GoatBot.onReply.set(sentMessageID, {
          commandName: "tiktok",
          author: event.senderID,
          results: results.slice(0, 6)
        });
      }

      if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);
    } catch (err) {
      if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
      const errMsg = `❌ Error searching TikTok: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  onReply: async function ({ event, api, Reply, message }) {
    const threadID = event.threadId || event.threadID;
    if (Reply.author && event.senderID !== Reply.author) return;

    const selection = parseInt(event.body?.trim(), 10);
    if (isNaN(selection) || selection < 1 || selection > Reply.results.length) {
      return message ? message.reply(`⚠️ Please reply with a number between 1 and ${Reply.results.length}!`) : api.sendMessage(`⚠️ Please reply with a number between 1 and ${Reply.results.length}!`, threadID);
    }

    const video = Reply.results[selection - 1];
    if (global.GoatBot?.onReply) {
      global.GoatBot.onReply.delete(event.messageReply?.messageID || Reply.messageID);
    }

    if (message && typeof message.reaction === 'function') message.reaction("⏳", event.messageID);

    try {
      const videoUrl = video.play || video.wmplay || `https://www.tikwm.com${video.play}`;
      const caption = `✅ 𝗧𝗶𝗸𝗧𝗼𝗸: ${video.title || 'Video'}\n👤 Creator: @${video.author?.unique_id || 'creator'}`;

      if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);
      return message 
        ? message.reply({ body: caption, attachment: videoUrl })
        : api.sendMessage({ body: caption, attachment: videoUrl }, threadID);
    } catch (err) {
      if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
      const errMsg = `❌ Failed to download selected video: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
