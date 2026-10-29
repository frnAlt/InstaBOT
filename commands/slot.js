'use strict';

/**
 * Slot Command - 3-Reel Vegas Slot Machine
 */

const { abbreviateNumber, formatCash, parseBet } = require('../func/arielUtils');

const REELS = [
  { icon: '🍒', multiplier: 2, weight: 35 },
  { icon: '🍋', multiplier: 3, weight: 28 },
  { icon: '🍇', multiplier: 4, weight: 20 },
  { icon: '🔔', multiplier: 7, weight: 12 },
  { icon: '💎', multiplier: 15, weight: 5 },
  { icon: '7️⃣', multiplier: 30, weight: 2 }
];

function spinReel() {
  const total = REELS.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * total;
  for (const r of REELS) {
    if (rand < r.weight) return r;
    rand -= r.weight;
  }
  return REELS[0];
}

module.exports = {
  config: {
    name: 'slot',
    aliases: ['slots', 'spin'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 3,
    role: 0,
    category: 'games',
    description: 'Play the 3-reel casino slot machine with custom bets',
    usage: 'slot <bet | all>'
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
      const err = `🎰 𝐔𝐒𝐀𝐆𝐄: *slot <amount | all>\n💵 Current Balance: $${formatCash(balance)}`;
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    const bet = parseBet(betInput, balance);
    if (isNaN(bet) || bet <= 0) {
      const err = '❌ Invalid bet amount.';
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    if (balance < bet) {
      const err = `❌ Insufficient balance! You bet $${formatCash(bet)}, but you only have $${formatCash(balance)}.`;
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    // Spin 3 reels
    const r1 = spinReel();
    const r2 = spinReel();
    const r3 = spinReel();

    let winMultiplier = 0;
    let resultType = 'loss';

    if (r1.icon === r2.icon && r2.icon === r3.icon) {
      // 3 matching symbols (Jackpot!)
      winMultiplier = r1.multiplier;
      resultType = 'jackpot';
    } else if (r1.icon === r2.icon || r2.icon === r3.icon || r1.icon === r3.icon) {
      // 2 matching symbols
      const match = (r1.icon === r2.icon || r1.icon === r3.icon) ? r1 : r2;
      winMultiplier = Math.max(1.5, Math.floor(match.multiplier / 2));
      resultType = 'two_match';
    }

    let netChange = -bet;
    let newBalance = balance - bet;

    if (winMultiplier > 0) {
      const winnings = Math.floor(bet * winMultiplier);
      netChange = winnings - bet;
      newBalance = balance + netChange;

      if (usersData && typeof usersData.addMoney === 'function') {
        await usersData.addMoney(senderID, netChange);
      }
    } else {
      if (usersData && typeof usersData.subtractMoney === 'function') {
        await usersData.subtractMoney(senderID, bet);
      }
    }

    let outcomeText = '';
    if (resultType === 'jackpot') {
      outcomeText = `🎉 **JACKPOT! 3x ${r1.icon}**\n💰 Won: +$${formatCash(bet * winMultiplier)} (${winMultiplier}x)`;
    } else if (resultType === 'two_match') {
      outcomeText = `✨ **2-OF-A-KIND!**\n💰 Won: +$${formatCash(bet * winMultiplier)} (${winMultiplier}x)`;
    } else {
      outcomeText = `💔 **NO MATCH!**\n💸 Lost: -$${formatCash(bet)}`;
    }

    const text =
      `🎰 𝐅𝐋𝐎𝐏𝐏𝐀 𝐂𝐀𝐒𝐈𝐍𝐎 𝐒𝐋𝐎𝐓𝐒\n` +
      `─`.repeat(26) + `\n` +
      `┌──────────────┐\n` +
      `│  ${r1.icon}  │  ${r2.icon}  │  ${r3.icon}  │\n` +
      `└──────────────┘\n` +
      `─`.repeat(26) + `\n` +
      `${outcomeText}\n` +
      `💵 New Balance: $${formatCash(newBalance)} ($${abbreviateNumber(newBalance)})`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
