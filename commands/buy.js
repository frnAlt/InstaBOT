'use strict';

/**
 * Buy Command - Purchase equipment and items from the merchant shop
 */

const { findItem } = require('../func/shopCatalog');
const { abbreviateNumber, formatCash } = require('../func/arielUtils');

module.exports = {
  config: {
    name: 'buy',
    aliases: ['purchase'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 2,
    role: 0,
    category: 'economy',
    description: 'Purchase an item from the merchant shop',
    usage: 'buy <item_id>'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const query = args.join(' ').trim();
    if (!query) {
      const err = '❌ Please specify an item to buy: *buy <item_id> (view items with *shop)';
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    const item = findItem(query);
    if (!item) {
      const err = `❌ Item "${query}" not found in the shop! Use *shop to view available items.`;
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    let walletMoney = 0;
    let inventory = [];

    if (usersData) {
      if (typeof usersData.getMoney === 'function') {
        walletMoney = Number(await usersData.getMoney(senderID)) || 0;
      }
      if (typeof usersData.get === 'function') {
        const udata = await usersData.get(senderID);
        inventory = Array.isArray(udata?.data?.inventory) ? [...udata.data.inventory] : [];
      }
    }

    if (walletMoney < item.price) {
      const err = `❌ You cannot afford ${item.name}! Price: $${formatCash(item.price)}, but your wallet only has $${formatCash(walletMoney)}.`;
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    inventory.push(item.id);

    if (usersData) {
      if (typeof usersData.subtractMoney === 'function') {
        await usersData.subtractMoney(senderID, item.price);
      }
      if (typeof usersData.set === 'function') {
        await usersData.set(senderID, { inventory }, 'data.inventory');
      }
    }

    const remaining = walletMoney - item.price;
    const text =
      `🛍️ 𝐏𝐔𝐑𝐂𝐇𝐀𝐒𝐄 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋\n` +
      `─`.repeat(26) + `\n` +
      `📦 Item:     ${item.icon} ${item.name}\n` +
      `🏷️ Cost:     -$${formatCash(item.price)} ($${abbreviateNumber(item.price)})\n` +
      `💵 Balance:  $${formatCash(remaining)}\n` +
      `─`.repeat(26) + `\n` +
      `✨ Added to your inventory!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
