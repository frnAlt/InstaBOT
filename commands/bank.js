'use strict';

/**
 * Bank Command - Secure savings vault with deposits and withdrawals
 */

const { abbreviateNumber, formatCash, parseBet } = require('../func/arielUtils');

module.exports = {
  config: {
    name: 'bank',
    aliases: ['vault', 'atm'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 2,
    role: 0,
    category: 'economy',
    description: 'Deposit, withdraw, and manage your bank savings vault',
    usage: 'bank [deposit <amount> | withdraw <amount> | info]'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const sub = (args[0] || 'info').toLowerCase();

    let walletMoney = 0;
    let bankMoney = 0;
    let userDataObj = null;

    if (usersData) {
      if (typeof usersData.getMoney === 'function') {
        walletMoney = Number(await usersData.getMoney(senderID)) || 0;
      }
      if (typeof usersData.get === 'function') {
        userDataObj = await usersData.get(senderID);
        if (userDataObj) {
          bankMoney = Number(userDataObj.data?.bank || userDataObj.bank || 0);
        }
      }
    }

    if (sub === 'deposit' || sub === 'dep') {
      const amountStr = args[1];
      if (!amountStr) {
        const err = '❌ Specify amount to deposit: *bank deposit <amount | all>';
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }

      const amount = parseBet(amountStr, walletMoney);
      if (isNaN(amount) || amount <= 0) {
        const err = '❌ Invalid deposit amount.';
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }

      if (walletMoney < amount) {
        const err = `❌ Insufficient wallet funds! You only have $${formatCash(walletMoney)} in your wallet.`;
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }

      const newWallet = walletMoney - amount;
      const newBank = bankMoney + amount;

      if (usersData) {
        if (typeof usersData.subtractMoney === 'function') {
          await usersData.subtractMoney(senderID, amount);
        }
        if (typeof usersData.set === 'function') {
          await usersData.set(senderID, { bank: newBank }, 'data.bank');
        }
      }

      const text =
        `🏦 𝐁𝐀𝐍𝐊 𝐃𝐄𝐏𝐎𝐒𝐈𝐓\n` +
        `─`.repeat(26) + `\n` +
        `📥 Deposited:  +$${formatCash(amount)} ($${abbreviateNumber(amount)})\n` +
        `💵 Wallet:     $${formatCash(newWallet)}\n` +
        `🏛️ Vault:      $${formatCash(newBank)}\n` +
        `─`.repeat(26) + `\n` +
        `🔒 Your savings are protected from casino bets and theft!`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    }

    if (sub === 'withdraw' || sub === 'with') {
      const amountStr = args[1];
      if (!amountStr) {
        const err = '❌ Specify amount to withdraw: *bank withdraw <amount | all>';
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }

      const amount = parseBet(amountStr, bankMoney);
      if (isNaN(amount) || amount <= 0) {
        const err = '❌ Invalid withdrawal amount.';
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }

      if (bankMoney < amount) {
        const err = `❌ Insufficient vault savings! You only have $${formatCash(bankMoney)} in your bank.`;
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }

      const newWallet = walletMoney + amount;
      const newBank = bankMoney - amount;

      if (usersData) {
        if (typeof usersData.addMoney === 'function') {
          await usersData.addMoney(senderID, amount);
        }
        if (typeof usersData.set === 'function') {
          await usersData.set(senderID, { bank: newBank }, 'data.bank');
        }
      }

      const text =
        `🏦 𝐁𝐀𝐍𝐊 𝐖𝐈𝐓𝐇𝐃𝐑𝐀𝐖𝐀𝐋\n` +
        `─`.repeat(26) + `\n` +
        `📤 Withdrawn:  -$${formatCash(amount)} ($${abbreviateNumber(amount)})\n` +
        `💵 Wallet:     $${formatCash(newWallet)}\n` +
        `🏛️ Vault:      $${formatCash(newBank)}\n` +
        `─`.repeat(26) + `\n` +
        `💸 Cash returned to your active wallet!`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    }

    // Default: info
    const text =
      `🏛️ 𝐍𝐀𝐓𝐈𝐎𝐍𝐀𝐋 𝐑𝐄𝐒𝐄𝐑𝐕𝐄 𝐁𝐀𝐍𝐊\n` +
      `─`.repeat(26) + `\n` +
      `💵 Active Wallet:  $${formatCash(walletMoney)} ($${abbreviateNumber(walletMoney)})\n` +
      `🔒 Savings Vault:  $${formatCash(bankMoney)} ($${abbreviateNumber(bankMoney)})\n` +
      `💎 Total Assets:   $${formatCash(walletMoney + bankMoney)}\n` +
      `─`.repeat(26) + `\n` +
      `📌 Commands:\n` +
      `  • *bank deposit <amount | all>\n` +
      `  • *bank withdraw <amount | all>`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
