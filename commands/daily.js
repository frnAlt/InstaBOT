'use strict';

/**
 * Daily Command - Claim 24-hour reward bonuses and build streaks
 */

const { abbreviateNumber, formatCash, formatTimeSentence } = require('../func/arielUtils');

const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const dailyClaims = new Map(); // senderID -> { lastClaim, streak }

module.exports = {
  config: {
    name: 'daily',
    aliases: ['claim', 'streak'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 0,
    role: 0,
    category: 'economy',
    description: 'Claim your daily cash reward and increase your streak multiplier',
    usage: 'daily'
  },

  async run({ api, event, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const now = Date.now();
    let record = dailyClaims.get(senderID);

    if (usersData && typeof usersData.get === 'function') {
      const udata = await usersData.get(senderID);
      if (udata?.data?.daily) {
        record = udata.data.daily;
      }
    }

    if (!record) {
      record = { lastClaim: 0, streak: 0 };
    }

    const diff = now - record.lastClaim;
    if (diff < DAILY_COOLDOWN_MS) {
      const wait = DAILY_COOLDOWN_MS - diff;
      const text = `⏳ 𝐃𝐀𝐈𝐋𝐘 𝐑𝐄𝐖𝐀𝐑𝐃\nYou already claimed your daily reward! Come back in ${formatTimeSentence(wait)}.`;
      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    }

    // Check if streak broke (>48 hours)
    if (diff > 48 * 60 * 60 * 1000 && record.lastClaim > 0) {
      record.streak = 0;
    }
    record.streak += 1;
    record.lastClaim = now;

    const baseReward = 5000;
    const streakBonus = Math.min(record.streak * 500, 15000);
    const totalReward = baseReward + streakBonus;

    if (usersData) {
      if (typeof usersData.addMoney === 'function') {
        await usersData.addMoney(senderID, totalReward);
      }
      if (typeof usersData.set === 'function') {
        await usersData.set(senderID, { daily: record }, 'data.daily');
      }
    }
    dailyClaims.set(senderID, record);

    let newBalance = totalReward;
    if (usersData && typeof usersData.getMoney === 'function') {
      newBalance = await usersData.getMoney(senderID);
    }

    const text =
      `🎁 𝐃𝐀𝐈𝐋𝐘 𝐑𝐄𝐖𝐀𝐑𝐃 𝐂𝐋𝐀𝐈𝐌𝐄𝐃\n` +
      `─`.repeat(26) + `\n` +
      `📦 Base Reward:  +$${formatCash(baseReward)}\n` +
      `🔥 Streak (${record.streak}d):   +$${formatCash(streakBonus)}\n` +
      `💰 Total Claim:  +$${formatCash(totalReward)} ($${abbreviateNumber(totalReward)})\n` +
      `💵 New Balance:  $${formatCash(newBalance)}\n` +
      `─`.repeat(26) + `\n` +
      `✨ Don't forget to claim tomorrow to keep your streak!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
