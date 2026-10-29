'use strict';

/**
 * Pair Command - Matchmaker pairing with fellow group chat members
 */

const COMMENTARY = [
  { min: 90, title: 'Soulmates 💍', desc: 'A celestial match written in the stars! You two belong together forever.' },
  { min: 75, title: 'Passionate Lovers 🔥', desc: 'Sparks fly whenever you two are in the same room. Great chemistry!' },
  { min: 60, title: 'Sweet Couple 🥰', desc: 'A wonderful dynamic full of laughter and affectionate teasing.' },
  { min: 45, title: 'Best Friends 🤝', desc: 'Better off as trusty companions, but romantic tension is always lurking.' },
  { min: 0, title: 'Chaotic Frenemies ⚡', desc: 'Total opposites! Prepare for constant drama and fiery arguments.' }
];

module.exports = {
  config: {
    name: 'pair',
    aliases: ['pairing', 'ship', 'match'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 5,
    role: 0,
    category: 'fun',
    description: 'Find your random love match and compatibility in the group chat',
    usage: 'pair'
  },

  async run({ api, event, message, usersData, threadsData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    // Get thread participant IDs
    let participants = [];
    if (threadsData && typeof threadsData.get === 'function') {
      const tInfo = await threadsData.get(tid);
      participants = tInfo?.participantIDs || tInfo?.members || [];
    } else if (api && typeof api.getThreadInfo === 'function') {
      try {
        const info = await new Promise((resolve, reject) => {
          api.getThreadInfo(tid, (err, data) => (err ? reject(err) : resolve(data)));
        });
        participants = (info?.userInfo || []).map(u => String(u.id || u.userID));
      } catch (_) {
        participants = [];
      }
    }

    // Filter out sender and bot
    const currentBotID = api?.getCurrentUserID ? String(api.getCurrentUserID()) : '';
    const pool = participants.filter(id => id !== senderID && id !== currentBotID);

    let partnerID = null;
    let partnerName = 'A Secret Admirer';

    if (pool.length > 0) {
      partnerID = pool[Math.floor(Math.random() * pool.length)];
    }

    let senderName = 'You';
    if (usersData && typeof usersData.getName === 'function') {
      senderName = await usersData.getName(senderID);
      if (partnerID) partnerName = await usersData.getName(partnerID);
    }

    // Pseudo-random but deterministic daily score between these two IDs, or fresh random
    const score = Math.floor(Math.random() * 51) + 50; // 50% - 100%
    const verdict = COMMENTARY.find(c => score >= c.min) || COMMENTARY[COMMENTARY.length - 1];

    const hearts = '💖'.repeat(Math.round(score / 10));

    const text =
      `💘 𝐂𝐔𝐏𝐈𝐃'𝐒 𝐌𝐀𝐓𝐂𝐇𝐌𝐀𝐊𝐄𝐑\n` +
      `─`.repeat(26) + `\n` +
      `👤 First:        ${senderName}\n` +
      `❤️ Second:       ${partnerName}\n` +
      `─`.repeat(26) + `\n` +
      `💞 Score:        ${score}% ${hearts}\n` +
      `💍 Status:       ${verdict.title}\n` +
      `💬 Commentary:   "${verdict.desc}"\n` +
      `─`.repeat(26) + `\n` +
      `✨ Congratulate the happy couple!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
