/**
 * Guess The Number Game Command
 * Interactive number guessing with higher/lower hints
 */

module.exports = {
  config: {
    name: "guessnumber",
    aliases: ["guessnum", "gn", "numbergame"],
    version: "1.1.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Number guessing game with hints"
    },
    longDescription: {
      en: "Guess a hidden secret number between 1 and 100 within 6 attempts."
    },
    category: "game",
    guide: {
      en: "{p}guessnumber"
    }
  },

  onStart: async function ({ api, event, message }) {
    const threadID = event.threadId || event.threadID;
    const secret = Math.floor(Math.random() * 100) + 1;

    let msg = `🔢 𝗚𝗨𝗘𝗦𝗦 𝗧𝗛𝗘 𝗡𝗨𝗠𝗕𝗘𝗥 𝗚𝗔𝗠𝗘\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🎯 I'm thinking of a secret number between 1 and 100.\n`;
    msg += `❤️ You have 6 attempts to find it!\n`;
    msg += `💰 Prize: +$350\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👉 Reply with your first guess (1-100):`;

    let sentMessageID;
    if (message && typeof message.reply === 'function') {
      const sent = await message.reply(msg);
      sentMessageID = sent?.messageID;
    } else {
      const sent = await api.sendMessage(msg, threadID);
      sentMessageID = sent?.messageID;
    }

    if (sentMessageID && global.GoatBot?.onReply) {
      global.GoatBot.onReply.set(sentMessageID, {
        commandName: "guessnumber",
        author: event.senderID,
        secret,
        attemptsLeft: 5,
        history: [],
        createdAt: Date.now()
      });
    }
  },

  onReply: async function ({ api, event, Reply, message, database }) {
    const threadID = event.threadId || event.threadID;
    if (event.senderID !== Reply.author) return;

    const guess = parseInt(event.body?.trim(), 10);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      return message ? message.reply("⚠️ Please reply with a valid number between 1 and 100!") : api.sendMessage("⚠️ Please reply with a valid number between 1 and 100!", threadID);
    }

    if (global.GoatBot?.onReply) {
      global.GoatBot.onReply.delete(event.messageReply?.messageID || Reply.messageID);
    }

    if (guess === Reply.secret) {
      const win = `🎉 𝗕𝗜𝗡𝗚𝗢! You guessed it correctly!\n\n🎯 Secret Number: ${Reply.secret}\n💰 Prize: +$350 added to your account!`;
      if (database && typeof database.addMoney === 'function') {
        database.addMoney(event.senderID, 350);
      }
      return message ? message.reply(win) : api.sendMessage(win, threadID);
    }

    if (Reply.attemptsLeft <= 0) {
      const loss = `💀 𝗚𝗔𝗠𝗘 𝗢𝗩𝗘𝗥! You ran out of attempts.\n\n🎯 The secret number was: ${Reply.secret}`;
      return message ? message.reply(loss) : api.sendMessage(loss, threadID);
    }

    const hint = guess < Reply.secret ? "⬆️ HIGHER! The secret number is greater." : "⬇️ LOWER! The secret number is smaller.";
    let nextMsg = `🔢 𝗬𝗼𝘂𝗿 𝗚𝘂𝗲𝘀𝘀: ${guess}\n💡 𝗛𝗶𝗻𝘁: ${hint}\n❤️ 𝗔𝘁𝘁𝗲𝗺𝗽𝘁𝘀 𝗟𝗲𝗳𝘁: ${Reply.attemptsLeft}\n\n👉 Reply with your next guess:`;

    let newSentID;
    if (message && typeof message.reply === 'function') {
      const sent = await message.reply(nextMsg);
      newSentID = sent?.messageID;
    } else {
      const sent = await api.sendMessage(nextMsg, threadID);
      newSentID = sent?.messageID;
    }

    if (newSentID && global.GoatBot?.onReply) {
      Reply.attemptsLeft--;
      global.GoatBot.onReply.set(newSentID, Reply);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
