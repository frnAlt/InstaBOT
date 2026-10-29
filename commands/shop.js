'use strict';

/**
 * Shop Command - Browse equipment, weapons, and tools
 */

const { ITEMS } = require('../func/shopCatalog');
const { abbreviateNumber, formatCash } = require('../func/arielUtils');

module.exports = {
  config: {
    name: 'shop',
    aliases: ['store', 'market'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 2,
    role: 0,
    category: 'economy',
    description: 'Browse tools, weapons, and gear available in the merchant shop',
    usage: 'shop [category]'
  },

  async run({ api, event, args, message }) {
    const tid = event.threadID || event.threadId;

    let text = '🛒 𝐅𝐋𝐎𝐏𝐏𝐀 𝐌𝐄𝐑𝐂𝐇𝐀𝐍𝐓 𝐒𝐇𝐎𝐏\n' + '─'.repeat(28) + '\n';
    ITEMS.forEach((it) => {
      text += `${it.icon} **${it.name}**\n`;
      text += `   ├ ID: \`${it.id}\` | 🏷️ Price: $${formatCash(it.price)} ($${abbreviateNumber(it.price)})\n`;
      text += `   └ ${it.desc}\n\n`;
    });
    text += '─'.repeat(28) + '\n';
    text += '💡 To purchase an item: *buy <item_id>';

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
