'use strict';

/**
 * Work Command - Work shifts to earn virtual cash
 */

const { abbreviateNumber, formatCash, formatTimeSentence } = require('../func/arielUtils');

const JOBS = [
  { title: 'Software Engineer', desc: 'fixed critical memory leaks in the backend cluster', min: 450, max: 1200 },
  { title: 'Cyber Security Analyst', desc: 'mitigated a zero-day exploit on the server network', min: 500, max: 1350 },
  { title: 'Coffee Barista', desc: 'brewed specialty artisanal espresso for morning commuters', min: 250, max: 650 },
  { title: 'Twitch Streamer', desc: 'hosted an overnight speedrun charity livestream', min: 300, max: 950 },
  { title: 'Freelance Graphic Designer', desc: 'designed a sleek cyberpunk branding identity', min: 350, max: 850 },
  { title: 'Master Chef', desc: 'cooked a 5-course gourmet banquet at a luxury hotel', min: 400, max: 1100 },
  { title: 'Crypto Quantitative Trader', desc: 'arbitraged decentralized liquidity pools profitably', min: 450, max: 1400 },
  { title: 'Stunt Driver', desc: 'performed high-speed drifts in an action film sequence', min: 380, max: 1050 }
];

const COOLDOWN_MS = 60 * 1000; // 60 seconds
const lastWorkMap = new Map();

module.exports = {
  config: {
    name: 'work',
    aliases: ['job', 'shift'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 0,
    role: 0,
    category: 'economy',
    description: 'Work a random shift to earn virtual currency',
    usage: 'work'
  },

  async run({ api, event, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const now = Date.now();
    const last = lastWorkMap.get(senderID) || 0;
    const remaining = COOLDOWN_MS - (now - last);

    if (remaining > 0) {
      const waitMsg = `⏳ 𝐄𝐗𝐇𝐀𝐔𝐒𝐓𝐈𝐎𝐍\nYou are resting from your last shift! Please wait ${formatTimeSentence(remaining)} before working again.`;
      return message?.reply ? message.reply(waitMsg) : api.sendMessage(waitMsg, tid, undefined, event.messageID);
    }

    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const payout = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    if (usersData && typeof usersData.addMoney === 'function') {
      await usersData.addMoney(senderID, payout);
    }

    lastWorkMap.set(senderID, now);

    let newBalance = payout;
    if (usersData && typeof usersData.getMoney === 'function') {
      newBalance = await usersData.getMoney(senderID);
    }

    const text =
      `💼 𝐖𝐎𝐑𝐊 𝐒𝐇𝐈𝐅𝐓 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃\n` +
      `─`.repeat(26) + `\n` +
      `🛠️ Profession: ${job.title}\n` +
      `📝 Task:       ${job.desc}\n` +
      `💰 Earned:     +$${formatCash(payout)} ($${abbreviateNumber(payout)})\n` +
      `💵 Balance:    $${formatCash(newBalance)}\n` +
      `─`.repeat(26) + `\n` +
      `⚡ Next shift available in 60s!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
