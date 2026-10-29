'use strict';

/**
 * Mine Command - Mine subterranean caverns for ores and precious gems
 */

const { abbreviateNumber, formatCash, formatTimeSentence } = require('../func/arielUtils');

const ORES_TABLE = [
  { name: 'Stone & Gravel', price: 60, tier: 'Common', icon: '🪨', weight: 45 },
  { name: 'Coal Chunk', price: 150, tier: 'Common', icon: '⚫', weight: 35 },
  { name: 'Copper Vein', price: 320, tier: 'Common', icon: '🟤', weight: 30 },
  { name: 'Iron Ore', price: 650, tier: 'Uncommon', icon: '⚙️', weight: 20 },
  { name: 'Silver Deposit', price: 1100, tier: 'Uncommon', icon: '🥈', weight: 15 },
  { name: 'Gold Nugget', price: 2400, tier: 'Rare', icon: '🪙', weight: 8 },
  { name: 'Emerald Cluster', price: 4500, tier: 'Rare', icon: '💚', weight: 4 },
  { name: 'Pure Diamond', price: 9000, tier: 'Epic', icon: '💎', weight: 2 },
  { name: 'Ancient Netherite', price: 25000, tier: 'Mythic', icon: '🔮', weight: 1 }
];

const COOLDOWN_MS = 30 * 1000;
const lastMineMap = new Map();

module.exports = {
  config: {
    name: 'mine',
    aliases: ['mining', 'ore'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 0,
    role: 0,
    category: 'games',
    description: 'Mine subterranean caves for minerals and gemstones',
    usage: 'mine'
  },

  async run({ api, event, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const now = Date.now();
    const last = lastMineMap.get(senderID) || 0;
    const remaining = COOLDOWN_MS - (now - last);

    if (remaining > 0) {
      const waitMsg = `⏳ 𝐌𝐈𝐍𝐈𝐍𝐆\nYour arms are tired from swinging! Please wait ${formatTimeSentence(remaining)} before digging deeper.`;
      return message?.reply ? message.reply(waitMsg) : api.sendMessage(waitMsg, tid, undefined, event.messageID);
    }

    let hasDiamondPick = false;
    let hasIronPick = false;

    if (usersData && typeof usersData.get === 'function') {
      const udata = await usersData.get(senderID);
      const inv = udata?.data?.inventory || [];
      hasDiamondPick = inv.includes('pickaxe_diamond');
      hasIronPick = inv.includes('pickaxe_iron');
    }

    const table = ORES_TABLE.map(o => {
      let w = o.weight;
      if (hasDiamondPick && (o.tier === 'Rare' || o.tier === 'Epic' || o.tier === 'Mythic')) w *= 3.5;
      if (hasIronPick && o.tier === 'Uncommon') w *= 2;
      return { ...o, finalWeight: w };
    });

    const totalWeight = table.reduce((sum, o) => sum + o.finalWeight, 0);
    let rand = Math.random() * totalWeight;
    let ore = table[0];

    for (const o of table) {
      if (rand < o.finalWeight) {
        ore = o;
        break;
      }
      rand -= o.finalWeight;
    }

    const earned = ore.price;
    if (usersData && typeof usersData.addMoney === 'function') {
      await usersData.addMoney(senderID, earned);
    }

    lastMineMap.set(senderID, now);

    let newBalance = earned;
    if (usersData && typeof usersData.getMoney === 'function') {
      newBalance = await usersData.getMoney(senderID);
    }

    const pickName = hasDiamondPick ? 'Diamond Pickaxe 💎' : hasIronPick ? 'Iron Pickaxe ⛏️' : 'Rusty Chisel 🔨';

    const text =
      `⛏️ 𝐌𝐈𝐍𝐈𝐍𝐆 𝐄𝐗𝐂𝐀𝐕𝐀𝐓𝐈𝐎𝐍\n` +
      `─`.repeat(26) + `\n` +
      `🛠️ Tool:       ${pickName}\n` +
      `⛏️ Extracted:  ${ore.icon} **${ore.name}**\n` +
      `⭐ Quality:    ${ore.tier}\n` +
      `💰 Sold For:   +$${formatCash(earned)} ($${abbreviateNumber(earned)})\n` +
      `💵 Balance:    $${formatCash(newBalance)}\n` +
      `─`.repeat(26) + `\n` +
      `💡 Buy a Diamond Pickaxe in *shop to excavate rare gems!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
