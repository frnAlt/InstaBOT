'use strict';

/**
 * Adventure Command - Explore dangerous realms, fight beasts, and claim treasure
 */

const { abbreviateNumber, formatCash, formatTimeSentence } = require('../func/arielUtils');

const ZONES = [
  {
    name: 'Whispering Woods',
    minPower: 10,
    monsters: ['Shadow Goblin', 'Dire Wolf', 'Corrupted Sprite'],
    minReward: 400,
    maxReward: 1200,
    exp: 25
  },
  {
    name: 'Crystal Caverns',
    minPower: 30,
    monsters: ['Cave Troll', 'Crystal Golem', 'Obsidian Wyrm'],
    minReward: 1200,
    maxReward: 3500,
    exp: 65
  },
  {
    name: 'Dragon Spire',
    minPower: 60,
    monsters: ['Flame Drake', 'Dread Knight', 'Ancient Red Dragon'],
    minReward: 5000,
    maxReward: 16000,
    exp: 150
  }
];

const COOLDOWN_MS = 45 * 1000;
const lastAdventureMap = new Map();

module.exports = {
  config: {
    name: 'adventure',
    aliases: ['adv', 'dungeon', 'explore'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 0,
    role: 0,
    category: 'games',
    description: 'Embark on an adventure into dangerous realms for gold and glory',
    usage: 'adventure [1 | 2 | 3]'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const now = Date.now();
    const last = lastAdventureMap.get(senderID) || 0;
    const remaining = COOLDOWN_MS - (now - last);

    if (remaining > 0) {
      const waitMsg = `⏳ 𝐀𝐃𝐕𝐄𝐍𝐓𝐔𝐑𝐄\nYour hero is resting by the campfire! Wait ${formatTimeSentence(remaining)} before adventuring again.`;
      return message?.reply ? message.reply(waitMsg) : api.sendMessage(waitMsg, tid, undefined, event.messageID);
    }

    let zoneIdx = 0;
    if (args[0]) {
      const parsed = parseInt(args[0], 10) - 1;
      if (!isNaN(parsed) && parsed >= 0 && parsed < ZONES.length) {
        zoneIdx = parsed;
      }
    }
    const zone = ZONES[zoneIdx];

    let hasSword = false;
    let hasShield = false;
    let inv = [];

    if (usersData && typeof usersData.get === 'function') {
      const udata = await usersData.get(senderID);
      inv = udata?.data?.inventory || [];
      hasSword = inv.includes('sword_flame');
      hasShield = inv.includes('shield_aegis');
    }

    const playerPower = 20 + (hasSword ? 50 : 0) + (hasShield ? 40 : 0);
    const monster = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];

    // Outcome calculation
    const successRate = Math.min(0.85, Math.max(0.35, playerPower / (zone.minPower + 40)));
    const victory = Math.random() < successRate;

    lastAdventureMap.set(senderID, now);

    if (victory) {
      const gold = Math.floor(Math.random() * (zone.maxReward - zone.minReward + 1)) + zone.minReward;
      if (usersData && typeof usersData.addMoney === 'function') {
        await usersData.addMoney(senderID, gold);
      }

      let newBalance = gold;
      if (usersData && typeof usersData.getMoney === 'function') {
        newBalance = await usersData.getMoney(senderID);
      }

      const text =
        `⚔️ 𝐀𝐃𝐕𝐄𝐍𝐓𝐔𝐑𝐄 𝐕𝐈𝐂𝐓𝐎𝐑𝐘\n` +
        `─`.repeat(26) + `\n` +
        `🗺️ Realm:     ${zone.name}\n` +
        `👹 Foe Slain: **${monster}**\n` +
        `⚡ Gear:      ${hasSword ? 'Flame Katana ⚔️' : 'Basic Dagger 🗡️'} ${hasShield ? '| Aegis Shield 🛡️' : ''}\n` +
        `💰 Booty:     +$${formatCash(gold)} ($${abbreviateNumber(gold)})\n` +
        `✨ EXP:       +${zone.exp} XP\n` +
        `💵 Balance:   $${formatCash(newBalance)}\n` +
        `─`.repeat(26) + `\n` +
        `🛡️ Prepare for your next raid with gear from *shop!`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } else {
      const hospitalBill = Math.min(300, Math.floor(zone.minReward * 0.3));
      if (usersData && typeof usersData.subtractMoney === 'function') {
        await usersData.subtractMoney(senderID, hospitalBill);
      }

      const text =
        `💀 𝐀𝐃𝐕𝐄𝐍𝐓𝐔𝐑𝐄 𝐃𝐄𝐅𝐄𝐀𝐓\n` +
        `─`.repeat(26) + `\n` +
        `🗺️ Realm:     ${zone.name}\n` +
        `👹 Defeated:  **${monster}** overpowered your defense!\n` +
        `🩹 Medic:     -$${formatCash(hospitalBill)} in recovery costs.\n` +
        `─`.repeat(26) + `\n` +
        `💡 Upgrade your weapons in *shop to conquer higher tier dungeons!`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    }
  }
};
