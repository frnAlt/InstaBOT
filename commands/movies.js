/**
 * Movies Search Command
 * Queries OMDB API for film ratings, cast, synopsis, and poster
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "movies",
    aliases: ["movie", "imdb", "film"],
    version: "1.1.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search movies and TV shows on IMDb/OMDb"
    },
    longDescription: {
      en: "Fetches detailed film info including IMDb score, genre, runtime, plot summary, and poster."
    },
    category: "media",
    guide: {
      en: "{p}movies <movie title>\nExample: {p}movies Inception"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    const query = args.join(" ");

    if (!query) {
      const prompt = "🎬 Please provide a movie or TV show title to search (e.g. /movies Interstellar).";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    try {
      const apiKey = "ec7115";
      const { data: movie } = await axios.get("http://www.omdbapi.com/", {
        params: {
          t: query,
          plot: "full",
          apikey: apiKey
        },
        timeout: 8000
      });

      if (!movie || movie.Response === "False") {
        const notFound = `❌ Movie not found: "${query}". Please check the spelling.`;
        return message ? message.reply(notFound) : api.sendMessage(notFound, threadID);
      }

      let msg = `🎬 𝗧𝗶𝘁𝗹𝗲: ${movie.Title} (${movie.Year})\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `⭐ 𝗜𝗠𝗗𝗯 𝗥𝗮𝘁𝗶𝗻𝗴: ${movie.imdbRating}/10 (${movie.imdbVotes || 0} votes)\n`;
      msg += `📂 𝗚𝗲𝗻𝗿𝗲: ${movie.Genre}\n`;
      msg += `⏱️ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: ${movie.Runtime} | 🔞 𝗥𝗮𝘁𝗲𝗱: ${movie.Rated}\n`;
      msg += `🎬 𝗗𝗶𝗿𝗲𝗰𝘁𝗼𝗿: ${movie.Director}\n`;
      msg += `🎭 𝗔𝗰𝘁𝗼𝗿𝘀: ${movie.Actors}\n`;
      msg += `🌐 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲: ${movie.Language} | 🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆: ${movie.Country}\n`;
      if (movie.Awards && movie.Awards !== "N/A") msg += `🏆 𝗔𝘄𝗮𝗿𝗱𝘀: ${movie.Awards}\n`;
      if (movie.BoxOffice && movie.BoxOffice !== "N/A") msg += `💰 𝗕𝗼𝘅 𝗢𝗳𝗳𝗶𝗰𝗲: ${movie.BoxOffice}\n`;
      msg += `\n📝 𝗣𝗹𝗼𝘁:\n${movie.Plot}`;

      if (movie.Poster && movie.Poster !== "N/A") {
        const posterStream = await global.utils.getStreamFromURL(movie.Poster, "poster.jpg").catch(() => null);
        if (posterStream) {
          return message 
            ? message.reply({ body: msg, attachment: posterStream })
            : api.sendMessage({ body: msg, attachment: posterStream }, threadID);
        }
      }

      return message ? message.reply(msg) : api.sendMessage(msg, threadID);
    } catch (err) {
      const errMsg = `❌ Failed to fetch movie details: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
