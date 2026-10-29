'use strict';

/**
 * EmojiMix Command - Mix and fuse two emojis into a unique custom sticker/image
 */

const axios = require('axios');

async function getEmojimixUrl(e1, e2) {
  try {
    const res = await axios.get('https://toshiro-api-editz6t9.vercel.app/api/tools/emojimix', {
      params: { emoji1: e1, emoji2: e2, size: 256 },
      timeout: 10000
    });
    if (res.data?.success && res.data?.result?.image) {
      return res.data.result.image;
    }
  } catch (_) {}
  return null;
}

module.exports = {
  config: {
    name: 'emojimix',
    aliases: ['mixemoji', 'emojicombine'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 3,
    role: 0,
    category: 'fun',
    description: 'Combines two emojis into a custom sticker image',
    usage: 'emojimix <emoji1> <emoji2>'
  },

  async run({ api, event, args, message }) {
    const tid = event.threadID || event.threadId;
    const e1 = args[0];
    const e2 = args[1];

    if (!e1 || !e2) {
      const err = '❌ Please provide two emojis to mix: *emojimix 🐱 🚀 (or *emojimix 🐶 🔥)';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    const imgUrl = await getEmojimixUrl(e1, e2) || await getEmojimixUrl(e2, e1);

    if (!imgUrl) {
      const fallback = `✨ Emoji Fusion: ${e1} + ${e2} = ${e1}${e2}\n(No official emoji kitchen sticker found for this combination).`;
      return message?.reply ? message.reply(fallback) : api?.sendMessage(fallback, tid, undefined, event.messageID);
    }

    const replyPayload = {
      body: `✨ 𝐄𝐌𝐎𝐉𝐈 𝐌𝐈𝐗: ${e1} + ${e2}`,
      attachment: imgUrl
    };

    if (message?.reply) {
      return message.reply(replyPayload);
    }
    return api?.sendMessage(replyPayload, tid, undefined, event.messageID);
  }
};
