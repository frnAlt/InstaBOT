'use strict';

/**
 * Fish Command - Go fishing in freshwater lakes and deep ocean waters
 */

const { abbreviateNumber, formatCash, formatTimeSentence } = require('../func/arielUtils');

const FISH_TABLE = [
  { name: 'Sardine', price: 120, tier: 'Common', icon: '🐟', weight: 45 },
  { name: 'Freshwater Salmon', price: 280, tier: 'Common', icon: '🐟', weight: 35 },
  { name: 'Spotted Trout', price: 340, tier: 'Common', icon: '🐟', weight: 30 },
  { name: 'Red Snapper', price: 650, tier: 'Uncommon', icon: '🐠', weight: 20 },
  { name: 'Bluefin Tuna', price: 950, tier: 'Uncommon', icon: '🐠', weight: 15 },
  { name: 'Electric Eel', price: 1800, tier: 'Rare', icon: '⚡', weight: 8 },
  { name: 'Golden Koi', price: 3500, tier: 'Rare', icon: '✨', weight: 4 },
  { name: 'Giant Swordfish', price: 6000, tier: 'Epic', icon: '🗡️', weight: 2 },
  { name: 'Legendary Megalodon', price: 20000, tier: 'Mythic', icon: '🦈', weight: 1 }
];

const COOLDOWN_MS = 30 * 1000;
const lastFishMap = new Map();

module.exports = {
  config: {
    name: 'fish',
    aliases: ['fishing'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 0,
    role: 0,
    category: 'games',
    description: 'Cast your rod to catch fish and earn virtual cash',
    usage: 'fish'
  },

  async run({ api, event, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const now = Date.now();
    const last = lastFishMap.get(senderID) || 0;
    const remaining = COOLDOWN_MS - (now - last);

    if (remaining > 0) {
      const waitMsg = `⏳ 𝐅𝐈𝐒𝐇𝐈𝐍𝐆\nThe waters are calm! Please wait ${formatTimeSentence(remaining)} before casting again.`;
      return message?.reply ? message.reply(waitMsg) : api.sendMessage(waitMsg, tid, undefined, event.messageID);
    }

    let hasProRod = false;
    let hasBasicRod = false;

    if (usersData && typeof usersData.get === 'function') {
      const udata = await usersData.get(senderID);
      const inv = udata?.data?.inventory || [];
      hasProRod = inv.includes('rod_pro');
      hasBasicRod = inv.includes('rod_basic');
    }

    // Weighted random selection
    const table = FISH_TABLE.map(f => {
      let w = f.weight;
      if (hasProRod && (f.tier === 'Rare' || f.tier === 'Epic' || f.tier === 'Mythic')) w *= 3;
      if (hasBasicRod && f.tier === 'Uncommon') w *= 2;
      return { ...f, finalWeight: w };
    });

    const totalWeight = table.reduce((sum, f) => sum + f.finalWeight, 0);
    let rand = Math.random() * totalWeight;
    let catchResult = table[0];

    for (const f of table) {
      if (rand < f.finalWeight) {
        catchResult = f;
        break;
      }
      rand -= f.finalWeight;
    }

    const earned = catchResult.price;
    if (usersData && typeof usersData.addMoney === 'function') {
      await usersData.addMoney(senderID, earned);
    }

    lastFishMap.set(senderID, now);

    let newBalance = earned;
    if (usersData && typeof usersData.getMoney === 'function') {
      newBalance = await usersData.getMoney(senderID);
    }

    const rodName = hasProRod ? 'Carbon Fiber Rod 🎣' : hasBasicRod ? 'Wooden Rod 🎣' : 'Hand Line 🪢';

    const text =
      `🎣 𝐅𝐈𝐒𝐇𝐈𝐍𝐆 𝐄𝐗𝐏𝐄𝐃𝐈𝐓𝐈𝐎𝐍\n` +
      `─`.repeat(26) + `\n` +
      `🎣 Equipment:  ${rodName}\n` +
      `🌊 Catch:      ${catchResult.icon} **${catchResult.name}**\n` +
      `⭐ Rarity:     ${catchResult.tier}\n` +
      `💰 Sold For:   +$${formatCash(earned)} ($${abbreviateNumber(earned)})\n` +
      `💵 Balance:    $${formatCash(newBalance)}\n` +
      `─`.repeat(26) + `\n` +
      `💡 Buy better rods in *shop to hook legendary sea beasts!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
