'use strict';

/**
 * Farm Command - Raise livestock, harvest crops, and sell produce
 */

const { abbreviateNumber, formatCash, formatTimeSentence } = require('../func/arielUtils');

const FARM_PRODUCE = [
  { name: 'Fresh Chicken Eggs', price: 250, tier: 'Common', icon: '🥚', weight: 40 },
  { name: 'Bottled Cow Milk', price: 500, tier: 'Common', icon: '🥛', weight: 30 },
  { name: 'Pure Wool Bundle', price: 900, tier: 'Uncommon', icon: '🧶', weight: 18 },
  { name: 'Prime Berkshire Ham', price: 1800, tier: 'Rare', icon: '🍖', weight: 8 },
  { name: 'Black Diamond Truffle', price: 4200, tier: 'Epic', icon: '🍄', weight: 3 },
  { name: 'Golden Goose Egg', price: 15000, tier: 'Mythic', icon: '✨', weight: 1 }
];

const COOLDOWN_MS = 60 * 1000; // 1 minute
const lastFarmMap = new Map();

module.exports = {
  config: {
    name: 'farm',
    aliases: ['farming', 'harvest', 'crop'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 0,
    role: 0,
    category: 'games',
    description: 'Tend to your livestock and harvest crops to sell for virtual cash',
    usage: 'farm'
  },

  async run({ api, event, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const now = Date.now();
    const last = lastFarmMap.get(senderID) || 0;
    const remaining = COOLDOWN_MS - (now - last);

    if (remaining > 0) {
      const waitMsg = `⏳ 𝐅𝐀𝐑𝐌 𝐇𝐀𝐑𝐕𝐄𝐒𝐓\nYour animals are still resting! Please wait ${formatTimeSentence(remaining)} before harvesting again.`;
      return message?.reply ? message.reply(waitMsg) : api.sendMessage(waitMsg, tid, undefined, event.messageID);
    }

    // Weighted random selection
    const totalWeight = FARM_PRODUCE.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    let produce = FARM_PRODUCE[0];

    for (const p of FARM_PRODUCE) {
      if (rand < p.weight) {
        produce = p;
        break;
      }
      rand -= p.weight;
    }

    const earned = produce.price;
    if (usersData && typeof usersData.addMoney === 'function') {
      await usersData.addMoney(senderID, earned);
    }

    lastFarmMap.set(senderID, now);

    let newBalance = earned;
    if (usersData && typeof usersData.getMoney === 'function') {
      newBalance = await usersData.getMoney(senderID);
    }

    const text =
      `🚜 𝐅𝐀𝐑𝐌 𝐇𝐀𝐑𝐕𝐄𝐒𝐓 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃\n` +
      `─`.repeat(26) + `\n` +
      `🌾 Yield:      ${produce.icon} **${produce.name}**\n` +
      `⭐ Grade:      ${produce.tier}\n` +
      `💰 Sold For:   +$${formatCash(earned)} ($${abbreviateNumber(earned)})\n` +
      `💵 Balance:    $${formatCash(newBalance)}\n` +
      `─`.repeat(26) + `\n` +
      `💡 Return in 1 minute for your next harvest!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
