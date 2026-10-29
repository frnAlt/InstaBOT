'use strict';

/**
 * Balance Command - Check virtual cash and economy rankings
 */

const { abbreviateNumber, formatCash } = require('../func/arielUtils');

module.exports = {
  config: {
    name: 'balance',
    aliases: ['bal', 'money', 'cash'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 3,
    role: 0,
    category: 'economy',
    description: 'Check your virtual cash balance or the economy leaderboard',
    usage: 'balance [top | @user | uid]'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    // Resolve target user
    let targetID = senderID;
    if (args[0] && args[0].toLowerCase() === 'top') {
      let allUsers = [];
      if (usersData && typeof usersData.getAll === 'function') {
        allUsers = await usersData.getAll();
      } else if (global.db && Array.isArray(global.db.allUserData)) {
        allUsers = global.db.allUserData;
      }

      if (!allUsers || allUsers.length === 0) {
        const text = '🏆 𝐄𝐂𝐎𝐍𝐎𝐌𝐘 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃\n\nNo accounts recorded yet!';
        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      }

      const sorted = [...allUsers]
        .map(u => ({
          userID: u.userID,
          name: u.name || `User ${u.userID}`,
          money: Number(u.money || 0)
        }))
        .sort((a, b) => b.money - a.money)
        .slice(0, 10);

      let board = '🏆 𝐄𝐂𝐎𝐍𝐎𝐌𝐘 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 (𝐓𝐎𝐏 𝟏𝟎)\n' + '─'.repeat(28) + '\n';
      sorted.forEach((u, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        board += `${medal} ${u.name}\n   └─ 💵 $${abbreviateNumber(u.money)} (${u.money.toLocaleString()})\n`;
      });
      board += '─'.repeat(28);

      return message?.reply ? message.reply(board) : api.sendMessage(board, tid, undefined, event.messageID);
    }

    if (event.messageReply && event.messageReply.senderID) {
      targetID = String(event.messageReply.senderID);
    } else if (args[0]) {
      const cleanArg = args[0].replace(/[@<>]/g, '').trim();
      if (/^\d+$/.test(cleanArg)) {
        targetID = cleanArg;
      }
    }

    let userMoney = 0;
    let userName = 'User';
    let bankMoney = 0;

    if (usersData) {
      if (typeof usersData.getMoney === 'function') {
        userMoney = Number(await usersData.getMoney(targetID)) || 0;
      }
      if (typeof usersData.getName === 'function') {
        userName = await usersData.getName(targetID);
      }
      if (typeof usersData.get === 'function') {
        const udata = await usersData.get(targetID);
        if (udata) {
          bankMoney = Number(udata.data?.bank || udata.bank || 0);
          userName = udata.name || userName;
        }
      }
    }

    const netWorth = userMoney + bankMoney;
    const isSelf = targetID === senderID;
    const pronoun = isSelf ? 'Your' : `${userName}'s`;

    const text =
      `💳 𝐅𝐈𝐍𝐀𝐍𝐂𝐈𝐀𝐋 𝐎𝐕𝐄𝐑𝐕𝐈𝐄𝐖\n` +
      `👤 Holder: ${userName}\n` +
      `─`.repeat(26) + `\n` +
      `💵 Wallet:     $${formatCash(userMoney)} ($${abbreviateNumber(userMoney)})\n` +
      `🏦 Bank:       $${formatCash(bankMoney)} ($${abbreviateNumber(bankMoney)})\n` +
      `💎 Net Worth:  $${formatCash(netWorth)} ($${abbreviateNumber(netWorth)})\n` +
      `─`.repeat(26) + `\n` +
      `💡 Tip: Use *work or *daily to earn more cash, or *bank deposit to safeguard it!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
