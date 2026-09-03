/**
 * Universal Multi-Platform Downloader Command
 * Downloads video and audio from Instagram, TikTok, Facebook, YouTube, Twitter/X
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "alldl",
    aliases: ["fbdl", "igdl", "ttdl", "ytdl", "dl", "download"],
    version: "2.8.0",
    author: "Gtajisan && frnAlt",
    cooldown: 5,
    role: 0,
    shortDescription: {
      en: "Multi-platform video & audio downloader"
    },
    longDescription: {
      en: "Universal media downloader for TikTok, Instagram, Facebook, YouTube, Twitter, and Pinterest."
    },
    category: "media",
    usage: "{p}alldl <url> [--audio] or reply to a message containing a media link"
  },

  onStart: async function ({ message, args, event, api }) {
    const threadID = event.threadId || event.threadID;

    let url = args[0];
    let isAudio = args.includes("--audio") || args.includes("--a");

    if (event.type === "message_reply" && event.messageReply?.body) {
      const urlMatch = event.messageReply.body.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        url = urlMatch[0];
        if (args.includes("--audio") || args.includes("--a")) isAudio = true;
      }
    }

    if (!url || !url.startsWith("http")) {
      const prompt = "📥 𝗨𝗻𝗶𝘃𝗲𝗿𝘀𝗮𝗹 𝗠𝗲𝗱𝗶𝗮 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n\n📌 Usage:\n• /alldl <url>\n• /alldl <url> --audio\n• Reply to any message containing a video link with /alldl";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    if (message && typeof message.reaction === 'function') {
      message.reaction("⏳", event.messageID);
    }

    try {
      let downloadUrl = null;
      let title = "Media Download";

      // 1. TikTok Fast Path
      if (/tiktok\.com/i.test(url)) {
        try {
          const ttRes = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, { timeout: 10000 });
          const ttData = ttRes.data?.data;
          if (ttData) {
            downloadUrl = isAudio ? (ttData.music || ttData.play) : (ttData.play || ttData.wmplay);
            title = ttData.title || "TikTok Video";
          }
        } catch (_) {}
      }

      // 2. Siputzx Universal API
      if (!downloadUrl) {
        try {
          const sipRes = await axios.get(`https://api.siputzx.my.id/api/d/all?url=${encodeURIComponent(url)}`, { timeout: 15000 });
          const data = sipRes.data?.data || sipRes.data?.result;
          if (data) {
            downloadUrl = isAudio ? (data.audio || data.url || data.video) : (data.video || data.url || data.hd || data.sd);
            title = data.title || title;
          }
        } catch (_) {}
      }

      // 3. Cobalt API
      if (!downloadUrl) {
        try {
          const cobRes = await axios.post(`https://api.cobalt.tools/api/json`, {
            url,
            downloadMode: isAudio ? "audio" : "auto"
          }, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            timeout: 15000
          });
          if (cobRes.data?.url) {
            downloadUrl = cobRes.data.url;
          }
        } catch (_) {}
      }

      // 4. Neoaz fallback API
      if (!downloadUrl) {
        try {
          const neoRes = await axios.get(`https://neoaz.is-a.dev/api/download?url=${encodeURIComponent(url)}`, { timeout: 15000 });
          const data = neoRes.data?.data;
          if (data?.formats && data.formats.length > 0) {
            downloadUrl = isAudio
              ? (data.formats.find(f => f.quality === 'audio_only')?.url || data.formats[0].url)
              : (data.formats.find(f => f.quality === 'hd_no_watermark' || f.quality === 'HD' || f.quality === '720p')?.url || data.formats[0].url);
            title = data.title || title;
          }
        } catch (_) {}
      }

      if (!downloadUrl) {
        throw new Error("Unable to extract downloadable stream from this URL");
      }

      const caption = `✅ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗱 [${isAudio ? 'AUDIO' : 'VIDEO'}]\n📝 ${title}`;
      if (message && typeof message.reaction === 'function') message.reaction("✅", event.messageID);

      return message 
        ? message.reply({ body: caption, attachment: downloadUrl })
        : api.sendMessage({ body: caption, attachment: downloadUrl }, threadID);
    } catch (err) {
      if (message && typeof message.reaction === 'function') message.reaction("❌", event.messageID);
      const errMsg = `❌ Download failed: ${err.message}. Please check if the link is public and valid.`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
