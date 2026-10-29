'use strict';

/**
 * Pay Command - Transfer virtual cash to another chat member
 */

const { abbreviateNumber, formatCash, parseBet } = require('../func/arielUtils');

module.exports = {
  config: {
    name: 'pay',
    aliases: ['give', 'transfer', 'sendmoney'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 2,
    role: 0,
    category: 'economy',
    description: 'Transfer virtual cash to another member in the chat',
    usage: 'pay [@user | uid] <amount>'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    let targetID = null;
    let amountStr = null;

    if (event.messageReply && event.messageReply.senderID) {
      targetID = String(event.messageReply.senderID);
      amountStr = args[0];
    } else if (args[0] && args[1]) {
      targetID = args[0].replace(/[@<>]/g, '').trim();
      amountStr = args[1];
    }

    if (!targetID || !amountStr) {
      const usageMsg = '❌ 𝐔𝐒𝐀𝐆𝐄: *pay @user <amount> or reply to a message with *pay <amount>';
      return message?.reply ? message.reply(usageMsg) : api.sendMessage(usageMsg, tid, undefined, event.messageID);
    }

    if (targetID === senderID) {
      const err = '❌ You cannot transfer cash to yourself!';
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    let senderBalance = 0;
    if (usersData && typeof usersData.getMoney === 'function') {
      senderBalance = Number(await usersData.getMoney(senderID)) || 0;
    }

    const amount = parseBet(amountStr, senderBalance);
    if (isNaN(amount) || amount <= 0) {
      const err = '❌ Invalid transfer amount specified.';
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    if (senderBalance < amount) {
      const err = `❌ Insufficient funds! Your balance is only $${formatCash(senderBalance)}.`;
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    let targetName = `User ${targetID}`;
    if (usersData) {
      if (typeof usersData.subtractMoney === 'function') {
        await usersData.subtractMoney(senderID, amount);
      }
      if (typeof usersData.addMoney === 'function') {
        await usersData.addMoney(targetID, amount);
      }
      if (typeof usersData.getName === 'function') {
        targetName = await usersData.getName(targetID);
      }
    }

    const text =
      `💸 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋\n` +
      `─`.repeat(26) + `\n` +
      `📤 Sent:      $${formatCash(amount)} ($${abbreviateNumber(amount)})\n` +
      `📥 Receiver:  ${targetName} (${targetID})\n` +
      `💵 Remaining: $${formatCash(senderBalance - amount)}\n` +
      `─`.repeat(26) + `\n` +
      `✅ Funds credited immediately!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
