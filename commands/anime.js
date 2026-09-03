/**
 * Anime Search Command
 * Fetches anime metadata, score, synopsis, episodes, and poster via Jikan API
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "anime",
    aliases: ["ani", "myanimelist", "mal"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search anime information on MyAnimeList"
    },
    longDescription: {
      en: "Fetches anime details including MAL score, episodes, status, studio, and poster art."
    },
    category: "media",
    guide: {
      en: "{p}anime <anime title>\nExample: {p}anime Attack on Titan"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    const query = args.join(" ");

    if (!query) {
      const prompt = "🌸 Please provide an anime title to search (e.g. /anime Death Note).";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    try {
      const { data } = await axios.get(`https://api.jikan.moe/v4/anime`, {
        params: { q: query, limit: 1 },
        timeout: 8000
      });

      if (!data?.data || data.data.length === 0) {
        const notFound = `❌ No anime found matching "${query}".`;
        return message ? message.reply(notFound) : api.sendMessage(notFound, threadID);
      }

      const anime = data.data[0];
      const genres = (anime.genres || []).map(g => g.name).join(", ");
      const studios = (anime.studios || []).map(s => s.name).join(", ");

      let msg = `🌸 𝗧𝗶𝘁𝗹𝗲: ${anime.title} (${anime.title_japanese || ""})\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `⭐ 𝗦𝗰𝗼𝗿𝗲: ${anime.score || "N/A"}/10 (Rank #${anime.rank || "N/A"})\n`;
      msg += `📺 𝗘𝗽𝗶𝘀𝗼𝗱𝗲𝘀: ${anime.episodes || "Ongoing"} (${anime.type || "TV"})\n`;
      msg += `📡 𝗦𝘁𝗮𝘁𝘂𝘀: ${anime.status || "Unknown"}\n`;
      msg += `📅 𝗔𝗶𝗿𝗲𝗱: ${anime.aired?.string || "N/A"}\n`;
      if (studios) msg += `🏢 𝗦𝘁𝘂𝗱𝗶𝗼: ${studios}\n`;
      if (genres) msg += `📂 𝗚𝗲𝗻𝗿𝗲𝘀: ${genres}\n`;
      msg += `🔞 𝗥𝗮𝘁𝗶𝗻𝗴: ${anime.rating || "N/A"}\n`;
      msg += `\n📝 𝗦𝘆𝗻𝗼𝗽𝘀𝗶𝘀:\n${(anime.synopsis || "No synopsis available.").slice(0, 700)}...\n\n`;
      msg += `🔗 𝗠𝗔𝗟: ${anime.url}`;

      const posterUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
      if (posterUrl) {
        const posterStream = await global.utils.getStreamFromURL(posterUrl, "anime_poster.jpg").catch(() => null);
        if (posterStream) {
          return message 
            ? message.reply({ body: msg, attachment: posterStream })
            : api.sendMessage({ body: msg, attachment: posterStream }, threadID);
        }
      }

      return message ? message.reply(msg) : api.sendMessage(msg, threadID);
    } catch (err) {
      const errMsg = `❌ Failed to search anime: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
