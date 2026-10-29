'use strict';

/**
 * Flip Coin Command - Heads or Tails casino gamble
 */

const { abbreviateNumber, formatCash, parseBet } = require('../func/arielUtils');

module.exports = {
  config: {
    name: 'flipcoin',
    aliases: ['coinflip', 'cf', 'toss', 'flip'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 2,
    role: 0,
    category: 'games',
    description: 'Flip a coin and bet on Heads or Tails',
    usage: 'flipcoin <heads|tails> <amount|all>'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    let balance = 0;
    if (usersData && typeof usersData.getMoney === 'function') {
      balance = Number(await usersData.getMoney(senderID)) || 0;
    }

    const choiceInput = (args[0] || '').toLowerCase();
    const betInput = args[1];

    if (!choiceInput || !betInput || (!['heads', 'tails', 'h', 't'].includes(choiceInput))) {
      const usage =
        `🪙 𝐂𝐎𝐈𝐍 𝐓𝐎𝐒𝐒 𝐆𝐀𝐌𝐁𝐋𝐄\n` +
        `─`.repeat(26) + `\n` +
        `Usage: *flipcoin <heads|tails> <bet|all>\n` +
        `💵 Balance: $${formatCash(balance)}\n` +
        `─`.repeat(26) + `\n` +
        `Example: *flipcoin heads 500`;
      return message?.reply ? message.reply(usage) : api.sendMessage(usage, tid, undefined, event.messageID);
    }

    const bet = parseBet(betInput, balance);
    if (isNaN(bet) || bet <= 0) {
      const err = '❌ Invalid bet amount.';
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    if (balance < bet) {
      const err = `❌ Insufficient balance! You have $${formatCash(balance)}, bet was $${formatCash(bet)}.`;
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    const chosenSide = (choiceInput === 'heads' || choiceInput === 'h') ? 'heads' : 'tails';
    const coinFlip = Math.random() < 0.5 ? 'heads' : 'tails';
    const isWin = chosenSide === coinFlip;

    const coinEmoji = coinFlip === 'heads' ? '🪙 Heads' : '🦅 Tails';

    if (isWin) {
      if (usersData && typeof usersData.addMoney === 'function') {
        await usersData.addMoney(senderID, bet);
      }
      const newBal = balance + bet;
      const text =
        `🪙 𝐅𝐋𝐈𝐏 𝐂𝐎𝐈𝐍: 𝐕𝐈𝐂𝐓𝐎𝐑𝐘!\n` +
        `─`.repeat(26) + `\n` +
        `🎯 Result:     ${coinEmoji}\n` +
        `✨ Your Pick:  ${chosenSide.toUpperCase()}\n` +
        `💰 Profit:     +$${formatCash(bet)} ($${abbreviateNumber(bet)})\n` +
        `💵 Balance:    $${formatCash(newBal)}\n` +
        `─`.repeat(26) + `\n` +
        `🎉 Congratulations on your lucky call!`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } else {
      if (usersData && typeof usersData.subtractMoney === 'function') {
        await usersData.subtractMoney(senderID, bet);
      }
      const newBal = balance - bet;
      const text =
        `🪙 𝐅𝐋𝐈𝐏 𝐂𝐎𝐈𝐍: 𝐃𝐄𝐅𝐄𝐀𝐓\n` +
        `─`.repeat(26) + `\n` +
        `🎯 Result:     ${coinEmoji}\n` +
        `❌ Your Pick:  ${chosenSide.toUpperCase()}\n` +
        `💸 Lost:       -$${formatCash(bet)}\n` +
        `💵 Balance:    $${formatCash(newBal)}\n` +
        `─`.repeat(26) + `\n` +
        `💔 Better luck next flip!`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    }
  }
};
