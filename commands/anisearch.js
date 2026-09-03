/**
 * Anime Edit Video Search Command
 * Fetches trending anime edits, AMVs, and short clips
 */

const axios = require('axios');

module.exports = {
  config: {
    name: 'anisearch',
    aliases: ['animeedit', 'anivid', 'amv', 'animesearch'],
    version: '1.2.0',
    author: 'Gtajisan && frnAlt',
    cooldown: 5,
    role: 0,
    shortDescription: {
      en: 'Search and download anime video edits'
    },
    longDescription: {
      en: 'Fetches high-energy anime edits and AMVs for any queried anime title.'
    },
    category: 'media',
    usage: '{p}anisearch <anime title>\nExample: {p}anisearch jujutsu kaisen'
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    const query = args.join(' ').trim();

    if (!query) {
      const prompt = '🎬 Please provide an anime title (e.g. /anisearch Naruto).';
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    if (message && typeof message.reaction === 'function') {
      message.reaction('⏳', event.messageID);
    }

    try {
      let videoUrl = null;

      // 1. Primary Anime Edit API
      try {
        const response = await axios.get(`https://api.jisan-official.com/anisearch?query=${encodeURIComponent(query)}`, { timeout: 10000 });
        const videos = response.data?.results || response.data;
        if (Array.isArray(videos) && videos.length > 0) {
          const selected = videos[Math.floor(Math.random() * videos.length)];
          videoUrl = typeof selected === 'string' ? selected : (selected?.url || selected?.videoUrl || selected?.link);
        }
      } catch (_) {}

      // 2. Fallback: TikWM Anime Edit Search
      if (!videoUrl) {
        try {
          const ttRes = await axios.post(`https://www.tikwm.com/api/feed/search`, {
            keywords: `${query} anime edit 4k`,
            count: 5,
            cursor: 0,
            web: 1
          }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10000
          });
          const videos = ttRes.data?.data?.videos || [];
          if (videos.length > 0) {
            const v = videos[Math.floor(Math.random() * videos.length)];
            videoUrl = v.play || v.wmplay;
          }
        } catch (_) {}
      }

      if (!videoUrl) {
        if (message && typeof message.reaction === 'function') message.reaction('❌', event.messageID);
        const notFound = `❌ No anime edits found for: "${query}".`;
        return message ? message.reply(notFound) : api.sendMessage(notFound, threadID);
      }

      const caption = `✨ 𝗔𝗻𝗶𝗺𝗲 𝗘𝗱𝗶𝘁: ${query.toUpperCase()}`;
      if (message && typeof message.reaction === 'function') message.reaction('✅', event.messageID);

      return message 
        ? message.reply({ body: caption, attachment: videoUrl })
        : api.sendMessage({ body: caption, attachment: videoUrl }, threadID);
    } catch (err) {
      if (message && typeof message.reaction === 'function') message.reaction('❌', event.messageID);
      const errMsg = `❌ Error fetching anime edit: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
