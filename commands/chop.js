'use strict';

/**
 * Chop Command - Woodcutting lumberjack gathering game
 */

const { abbreviateNumber, formatCash, formatTimeSentence } = require('../func/arielUtils');

const WOOD_TYPES = [
  { name: 'Oak Wood Log', price: 200, tier: 'Common', icon: '🪵', weight: 45 },
  { name: 'Pine Lumber', price: 450, tier: 'Common', icon: '🌲', weight: 30 },
  { name: 'Hard Maple Timber', price: 850, tier: 'Uncommon', icon: '🍁', weight: 15 },
  { name: 'Elderwood Trunk', price: 1800, tier: 'Rare', icon: '🌳', weight: 7 },
  { name: 'Ancient Redwood Core', price: 4000, tier: 'Epic', icon: '🍂', weight: 2.5 },
  { name: 'Enchanted Yggdrasil Branch', price: 16000, tier: 'Mythic', icon: '✨', weight: 0.5 }
];

const COOLDOWN_MS = 30 * 1000;
const lastChopMap = new Map();

module.exports = {
  config: {
    name: 'chop',
    aliases: ['woodcut', 'lumber', 'axe'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 0,
    role: 0,
    category: 'games',
    description: 'Chop down timber in the ancient forest and sell wood logs',
    usage: 'chop'
  },

  async run({ api, event, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const now = Date.now();
    const last = lastChopMap.get(senderID) || 0;
    const remaining = COOLDOWN_MS - (now - last);

    if (remaining > 0) {
      const waitMsg = `⏳ 𝐖𝐎𝐎𝐃𝐂𝐔𝐓𝐓𝐈𝐍𝐆\nYour arms are tired from swinging the axe! Wait ${formatTimeSentence(remaining)} before chopping again.`;
      return message?.reply ? message.reply(waitMsg) : api.sendMessage(waitMsg, tid, undefined, event.messageID);
    }

    let hasTitaniumAxe = false;
    if (usersData && typeof usersData.get === 'function') {
      const udata = await usersData.get(senderID);
      const inv = udata?.data?.inventory || [];
      hasTitaniumAxe = inv.includes('axe_titanium');
    }

    const table = WOOD_TYPES.map(w => {
      let weight = w.weight;
      if (hasTitaniumAxe && (w.tier === 'Rare' || w.tier === 'Epic' || w.tier === 'Mythic')) {
        weight *= 3;
      }
      return { ...w, finalWeight: weight };
    });

    const totalWeight = table.reduce((sum, w) => sum + w.finalWeight, 0);
    let rand = Math.random() * totalWeight;
    let wood = table[0];

    for (const w of table) {
      if (rand < w.finalWeight) {
        wood = w;
        break;
      }
      rand -= w.finalWeight;
    }

    const earned = wood.price;
    if (usersData && typeof usersData.addMoney === 'function') {
      await usersData.addMoney(senderID, earned);
    }

    lastChopMap.set(senderID, now);

    let newBalance = earned;
    if (usersData && typeof usersData.getMoney === 'function') {
      newBalance = await usersData.getMoney(senderID);
    }

    const toolName = hasTitaniumAxe ? 'Titanium Lumber Axe 🪓' : 'Rusty Hatchet 🪓';

    const text =
      `🌲 𝐋𝐔𝐌𝐁𝐄𝐑𝐉𝐀𝐂𝐊 𝐄𝐗𝐏𝐄𝐃𝐈𝐓𝐈𝐎𝐍\n` +
      `─`.repeat(26) + `\n` +
      `🛠️ Tool:       ${toolName}\n` +
      `🪵 Harvested:  ${wood.icon} **${wood.name}**\n` +
      `⭐ Grade:      ${wood.tier}\n` +
      `💰 Sold For:   +$${formatCash(earned)} ($${abbreviateNumber(earned)})\n` +
      `💵 Balance:    $${formatCash(newBalance)}\n` +
      `─`.repeat(26) + `\n` +
      `💡 Buy a Titanium Axe in *shop to unlock rare elderwoods!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
