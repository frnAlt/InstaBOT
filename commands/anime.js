'use strict';

/**
 * Anime Search Command - Retrieve anime details, synopsis, score, and episodes
 */

const axios = require('axios');

module.exports = {
  config: {
    name: 'anime',
    aliases: ['ani', 'anisearch', 'mal'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 4,
    role: 0,
    category: 'media',
    description: 'Search for anime information and synopsis from MyAnimeList',
    usage: 'anime <title>'
  },

  async run({ api, event, args, message }) {
    const tid = event.threadID || event.threadId;
    const query = args.join(' ').trim();

    if (!query) {
      const err = '❌ Please enter an anime title to search for: *anime Death Note';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`, { timeout: 10000 });
      const anime = res.data?.data?.[0];

      if (!anime) {
        const err = `❌ No anime found matching "${query}".`;
        return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
      }

      const title = anime.title || anime.title_english || query;
      const type = anime.type || 'TV';
      const episodes = anime.episodes || 'Unknown';
      const status = anime.status || 'Finished';
      const score = anime.score || 'N/A';
      const rank = anime.rank ? `#${anime.rank}` : 'Unranked';
      const genres = (anime.genres || []).map(g => g.name).join(', ') || 'General';
      const aired = anime.aired?.string || 'Unknown';
      const synopsis = anime.synopsis
        ? (anime.synopsis.length > 280 ? anime.synopsis.slice(0, 277) + '...' : anime.synopsis)
        : 'No synopsis available.';

      const text =
        `🎬 𝐀𝐍𝐈𝐌𝐄 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍\n` +
        `─`.repeat(26) + `\n` +
        `📺 Title:       **${title}**\n` +
        `⭐ Score:       ${score} / 10 (${rank})\n` +
        `🎞️ Format:      ${type} (${episodes} eps)\n` +
        `📡 Status:      ${status}\n` +
        `📅 Aired:       ${aired}\n` +
        `🏷️ Genres:      ${genres}\n` +
        `─`.repeat(26) + `\n` +
        `📖 **Synopsis:**\n${synopsis}\n` +
        `─`.repeat(26);

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } catch (err) {
      const errText = `❌ Error retrieving anime info: ${err.message}`;
      return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
    }
  }
};
