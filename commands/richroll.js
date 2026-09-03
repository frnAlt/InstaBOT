/**
 * Rich Roll High Stakes Gambling Command
 * Roll high-stakes dice for multipliers and progressive jackpots
 */

module.exports = {
  config: {
    name: "richroll",
    aliases: ["rr", "gamble", "rollfortune"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "High-stakes fortune roll casino game"
    },
    longDescription: {
      en: "Gamble currency on high-stakes lucky fortune dice rolls with multipliers up to 10x."
    },
    category: "game",
    guide: {
      en: "{p}richroll <amount>\nExample: {p}richroll 500"
    }
  },

  onStart: async function ({ api, event, args, message, database }) {
    const threadID = event.threadId || event.threadID;
    const bet = parseInt(args[0], 10);

    if (isNaN(bet) || bet <= 0) {
      const prompt = "🌪️ 𝗥𝗜𝗖𝗛 𝗥𝗢𝗟𝗟 𝗚𝗔𝗠𝗕𝗟𝗘\n\n📌 Usage: /richroll <bet_amount>\nExample: /richroll 200";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    const userBalance = database?.getUser ? (database.getUser(event.senderID)?.money || 0) : 1000;
    if (userBalance < bet) {
      const err = `❌ Insufficient balance! You have $${userBalance.toLocaleString()}, but tried to bet $${bet.toLocaleString()}.`;
      return message ? message.reply(err) : api.sendMessage(err, threadID);
    }

    // Roll random outcome (1-100)
    const roll = Math.floor(Math.random() * 100) + 1;
    let multiplier = 0;
    let outcomeText = "";

    if (roll >= 98) {
      // Mega Jackpot 5x
      multiplier = 5.0;
      outcomeText = `💎 𝗠𝗘𝗚𝗔 𝗝𝗔𝗖𝗞𝗣𝗢𝗧! The gods of fortune smiled upon you! (5.0x)`;
    } else if (roll >= 85) {
      // Big Win 3x
      multiplier = 3.0;
      outcomeText = `🔔 𝗕𝗜𝗚 𝗪𝗜𝗡! Lucky roll! (3.0x)`;
    } else if (roll >= 60) {
      // Win 1.8x
      multiplier = 1.8;
      outcomeText = `💰 𝗪𝗜𝗡𝗡𝗘𝗥! Great roll! (1.8x)`;
    } else if (roll >= 45) {
      // Small Win 1.2x
      multiplier = 1.2;
      outcomeText = `✨ 𝗖𝗟𝗢𝗦𝗘 𝗖𝗔𝗟𝗟! You rolled a modest profit! (1.2x)`;
    } else {
      // Loss
      multiplier = 0;
      outcomeText = `💥 𝗧𝗛𝗨𝗗... The dice turned against you. You lost your bet.`;
    }

    const winAmount = Math.floor(bet * multiplier);
    const net = winAmount - bet;

    if (multiplier > 0) {
      if (database && typeof database.addMoney === 'function') {
        database.addMoney(event.senderID, net);
      }
    } else {
      if (database && typeof database.decreaseMoney === 'function') {
        database.decreaseMoney(event.senderID, bet);
      }
    }

    const currentBal = database?.getUser ? (database.getUser(event.senderID)?.money || 0) : userBalance + net;

    let replyMsg = `🎲 𝗥𝗜𝗖𝗛 𝗥𝗢𝗟𝗟 — Score: [ ${roll} / 100 ]\n`;
    replyMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    replyMsg += `${outcomeText}\n\n`;
    replyMsg += `💵 𝗕𝗲𝘁: $${bet.toLocaleString()}\n`;
    replyMsg += `🏆 𝗣𝗮𝘆𝗼𝘂𝘁: $${winAmount.toLocaleString()} (${multiplier.toFixed(1)}x)\n`;
    replyMsg += `💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: $${currentBal.toLocaleString()}`;

    return message ? message.reply(replyMsg) : api.sendMessage(replyMsg, threadID);
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
