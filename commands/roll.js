'use strict';

/**
 * Roll Dice Command - Roll dice against the dealer with virtual cash bets
 */

const { abbreviateNumber, formatCash, parseBet } = require('../func/arielUtils');

const DICE_FACES = ['⚀ (1)', '⚁ (2)', '⚂ (3)', '⚃ (4)', '⚄ (5)', '⚅ (6)'];

module.exports = {
  config: {
    name: 'roll',
    aliases: ['dice', 'rolldice'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 2,
    role: 0,
    category: 'games',
    description: 'Roll dice against the dealer to win virtual cash',
    usage: 'roll <bet | all>'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    let balance = 0;
    if (usersData && typeof usersData.getMoney === 'function') {
      balance = Number(await usersData.getMoney(senderID)) || 0;
    }

    const betInput = args[0];
    if (!betInput) {
      const usage =
        `🎲 𝐃𝐈𝐂𝐄 𝐑𝐎𝐋𝐋 𝐂𝐀𝐒𝐈𝐍𝐎\n` +
        `─`.repeat(26) + `\n` +
        `Usage: *roll <amount | all>\n` +
        `💵 Balance: $${formatCash(balance)}\n` +
        `─`.repeat(26) + `\n` +
        `Roll higher than the dealer to double your bet!`;
      return message?.reply ? message.reply(usage) : api.sendMessage(usage, tid, undefined, event.messageID);
    }

    const bet = parseBet(betInput, balance);
    if (isNaN(bet) || bet <= 0) {
      const err = '❌ Invalid bet amount.';
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    if (balance < bet) {
      const err = `❌ Insufficient balance! Wallet: $${formatCash(balance)}, Bet: $${formatCash(bet)}.`;
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;

    const pFace = DICE_FACES[playerRoll - 1];
    const bFace = DICE_FACES[botRoll - 1];

    if (playerRoll > botRoll) {
      // Win
      if (usersData && typeof usersData.addMoney === 'function') {
        await usersData.addMoney(senderID, bet);
      }
      const newBal = balance + bet;
      const text =
        `🎲 𝐃𝐈𝐂𝐄 𝐑𝐎𝐋𝐋: 𝐘𝐎𝐔 𝐖𝐎𝐍!\n` +
        `─`.repeat(26) + `\n` +
        `👤 Your Roll:   ${pFace}\n` +
        `🤖 Bot Roll:    ${bFace}\n` +
        `─`.repeat(26) + `\n` +
        `💰 Profit:      +$${formatCash(bet)} ($${abbreviateNumber(bet)})\n` +
        `💵 Balance:     $${formatCash(newBal)}`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } else if (playerRoll < botRoll) {
      // Loss
      if (usersData && typeof usersData.subtractMoney === 'function') {
        await usersData.subtractMoney(senderID, bet);
      }
      const newBal = balance - bet;
      const text =
        `🎲 𝐃𝐈𝐂𝐄 𝐑𝐎𝐋𝐋: 𝐘𝐎𝐔 𝐋𝐎𝐒𝐓!\n` +
        `─`.repeat(26) + `\n` +
        `👤 Your Roll:   ${pFace}\n` +
        `🤖 Bot Roll:    ${bFace}\n` +
        `─`.repeat(26) + `\n` +
        `💸 Lost:        -$${formatCash(bet)}\n` +
        `💵 Balance:     $${formatCash(newBal)}`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } else {
      // Tie
      const text =
        `🎲 𝐃𝐈𝐂𝐄 𝐑𝐎𝐋𝐋: 𝐈𝐓'𝐒 𝐀 𝐓𝐈𝐄!\n` +
        `─`.repeat(26) + `\n` +
        `👤 Your Roll:   ${pFace}\n` +
        `🤖 Bot Roll:    ${bFace}\n` +
        `─`.repeat(26) + `\n` +
        `🤝 Bets refunded! Wallet remains $${formatCash(balance)}.`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    }
  }
};
