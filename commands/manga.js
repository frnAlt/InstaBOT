/**
 * Manga Search Command
 * Queries Jikan / MyAnimeList for manga titles, chapters, authors, and synopsis
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "manga",
    aliases: ["manhwa", "manhua"],
    version: "1.1.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search manga and manhwa on MyAnimeList"
    },
    longDescription: {
      en: "Retrieves manga metadata, score, status, chapter volume count, authors, and cover image."
    },
    category: "media",
    guide: {
      en: "{p}manga <manga title>\nExample: {p}manga Solo Leveling"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    const query = args.join(" ");

    if (!query) {
      const prompt = "📖 Please provide a manga or manhwa title (e.g. /manga Berserk).";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    try {
      const { data } = await axios.get(`https://api.jikan.moe/v4/manga`, {
        params: { q: query, limit: 1 },
        timeout: 8000
      });

      if (!data?.data || data.data.length === 0) {
        const notFound = `❌ No manga found matching "${query}".`;
        return message ? message.reply(notFound) : api.sendMessage(notFound, threadID);
      }

      const manga = data.data[0];
      const authors = (manga.authors || []).map(a => a.name).join(", ");
      const genres = (manga.genres || []).map(g => g.name).join(", ");

      let msg = `📖 𝗧𝗶𝘁𝗹𝗲: ${manga.title} (${manga.title_japanese || ""})\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `⭐ 𝗦𝗰𝗼𝗿𝗲: ${manga.score || "N/A"}/10 (Rank #${manga.rank || "N/A"})\n`;
      msg += `📚 𝗩𝗼𝗹𝘂𝗺𝗲𝘀: ${manga.volumes || "N/A"} | 📑 𝗖𝗵𝗮𝗽𝘁𝗲𝗿𝘀: ${manga.chapters || "Ongoing"}\n`;
      msg += `📡 𝗦𝘁𝗮𝘁𝘂𝘀: ${manga.status || "Unknown"} (${manga.type || "Manga"})\n`;
      if (authors) msg += `✍️ 𝗔𝘂𝘁𝗵𝗼𝗿(𝘀): ${authors}\n`;
      if (genres) msg += `📂 𝗚𝗲𝗻𝗿𝗲𝘀: ${genres}\n`;
      msg += `\n📝 𝗦𝘆𝗻𝗼𝗽𝘀𝗶𝘀:\n${(manga.synopsis || "No synopsis available.").slice(0, 700)}...\n\n`;
      msg += `🔗 𝗠𝗔𝗟: ${manga.url}`;

      const coverUrl = manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url;
      if (coverUrl) {
        const coverStream = await global.utils.getStreamFromURL(coverUrl, "manga_cover.jpg").catch(() => null);
        if (coverStream) {
          return message 
            ? message.reply({ body: msg, attachment: coverStream })
            : api.sendMessage({ body: msg, attachment: coverStream }, threadID);
        }
      }

      return message ? message.reply(msg) : api.sendMessage(msg, threadID);
    } catch (err) {
      const errMsg = `❌ Failed to search manga: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
