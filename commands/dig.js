'use strict';

/**
 * Dig Command - Archeological relic excavation gathering game
 */

const { abbreviateNumber, formatCash, formatTimeSentence } = require('../func/arielUtils');

const ARTIFACTS = [
  { name: 'Broken Pottery Shards', price: 180, tier: 'Common', icon: '🏺', weight: 40 },
  { name: 'Ancient Roman Bronze Coin', price: 420, tier: 'Common', icon: '🪙', weight: 30 },
  { name: 'Ceremonial Bronze Dagger', price: 950, tier: 'Uncommon', icon: '🗡️', weight: 16 },
  { name: 'Gilded Pharaoh Mask', price: 2200, tier: 'Rare', icon: '👑', weight: 8 },
  { name: 'Prehistoric T-Rex Fossil', price: 5500, tier: 'Epic', icon: '🦖', weight: 4 },
  { name: 'Cursed Atlantis Relic', price: 18000, tier: 'Mythic', icon: '🔱', weight: 1 }
];

const COOLDOWN_MS = 30 * 1000;
const lastDigMap = new Map();

module.exports = {
  config: {
    name: 'dig',
    aliases: ['excavate', 'archeology', 'shovel'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 0,
    role: 0,
    category: 'games',
    description: 'Excavate buried archeological treasures and relics',
    usage: 'dig'
  },

  async run({ api, event, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const now = Date.now();
    const last = lastDigMap.get(senderID) || 0;
    const remaining = COOLDOWN_MS - (now - last);

    if (remaining > 0) {
      const waitMsg = `⏳ 𝐄𝐗𝐂𝐀𝐕𝐀𝐓𝐈𝐎𝐍\nThe excavation site is refilling with soil! Wait ${formatTimeSentence(remaining)} before digging again.`;
      return message?.reply ? message.reply(waitMsg) : api.sendMessage(waitMsg, tid, undefined, event.messageID);
    }

    let hasSteelShovel = false;
    if (usersData && typeof usersData.get === 'function') {
      const udata = await usersData.get(senderID);
      const inv = udata?.data?.inventory || [];
      hasSteelShovel = inv.includes('shovel_steel');
    }

    const table = ARTIFACTS.map(a => {
      let weight = a.weight;
      if (hasSteelShovel && (a.tier === 'Rare' || a.tier === 'Epic' || a.tier === 'Mythic')) {
        weight *= 3;
      }
      return { ...a, finalWeight: weight };
    });

    const totalWeight = table.reduce((sum, a) => sum + a.finalWeight, 0);
    let rand = Math.random() * totalWeight;
    let relic = table[0];

    for (const a of table) {
      if (rand < a.finalWeight) {
        relic = a;
        break;
      }
      rand -= a.finalWeight;
    }

    const earned = relic.price;
    if (usersData && typeof usersData.addMoney === 'function') {
      await usersData.addMoney(senderID, earned);
    }

    lastDigMap.set(senderID, now);

    let newBalance = earned;
    if (usersData && typeof usersData.getMoney === 'function') {
      newBalance = await usersData.getMoney(senderID);
    }

    const toolName = hasSteelShovel ? 'Steel Excavation Shovel 🪙' : 'Old Trowel 🥄';

    const text =
      `🏺 𝐀𝐑𝐂𝐇𝐄𝐎𝐋𝐎𝐆𝐈𝐂𝐀𝐋 𝐃𝐈𝐆\n` +
      `─`.repeat(26) + `\n` +
      `🛠️ Tool:       ${toolName}\n` +
      `⚱️ Unearthed:  ${relic.icon} **${relic.name}**\n` +
      `⭐ Rarity:     ${relic.tier}\n` +
      `💰 Sold For:   +$${formatCash(earned)} ($${abbreviateNumber(earned)})\n` +
      `💵 Balance:    $${formatCash(newBalance)}\n` +
      `─`.repeat(26) + `\n` +
      `💡 Buy a Steel Shovel in *shop to unearth lost treasures!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
