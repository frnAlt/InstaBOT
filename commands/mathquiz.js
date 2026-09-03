/**
 * Math Quiz Game Command
 * Generates dynamic arithmetic challenges with cash rewards
 */

module.exports = {
  config: {
    name: "mathquiz",
    aliases: ["math", "maths", "quickmath"],
    version: "1.1.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Speed mental math arithmetic game"
    },
    longDescription: {
      en: "Answer mental arithmetic questions within 30 seconds to win currency rewards."
    },
    category: "game",
    guide: {
      en: "{p}mathquiz [easy|medium|hard]"
    }
  },

  onStart: async function ({ api, event, args, message, database }) {
    const threadID = event.threadId || event.threadID;
    const diff = (args[0] || "medium").toLowerCase();

    let num1, num2, op, answer, reward;

    if (diff === "easy") {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      const ops = ["+", "-"];
      op = ops[Math.floor(Math.random() * ops.length)];
      answer = op === "+" ? num1 + num2 : num1 - num2;
      reward = 100;
    } else if (diff === "hard") {
      num1 = Math.floor(Math.random() * 100) + 10;
      num2 = Math.floor(Math.random() * 25) + 2;
      const ops = ["+", "-", "*"];
      op = ops[Math.floor(Math.random() * ops.length)];
      answer = op === "+" ? num1 + num2 : op === "-" ? num1 - num2 : num1 * num2;
      reward = 400;
    } else {
      // medium
      num1 = Math.floor(Math.random() * 50) + 5;
      num2 = Math.floor(Math.random() * 30) + 2;
      const ops = ["+", "-", "*"];
      op = ops[Math.floor(Math.random() * ops.length)];
      answer = op === "+" ? num1 + num2 : op === "-" ? num1 - num2 : num1 * num2;
      reward = 250;
    }

    let msg = `🧮 𝗠𝗔𝗧𝗛 𝗤𝗨𝗜𝗭 𝗖𝗛𝗔𝗟𝗟𝗘𝗡𝗚𝗘\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `⚡ 𝗗𝗶𝗳𝗳𝗶𝗰𝘂𝗹𝘁𝘆: ${diff.toUpperCase()}\n`;
    msg += `❓ 𝗦𝗼𝗹𝘃𝗲:  ${num1} ${op} ${num2} = ?\n`;
    msg += `💰 𝗥𝗲𝘄𝗮𝗿𝗱: +$${reward}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👉 Reply to this message with your answer within 30 seconds!`;

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
        commandName: "mathquiz",
        author: event.senderID,
        answer,
        reward,
        createdAt: Date.now()
      });
    }
  },

  onReply: async function ({ api, event, Reply, message, database }) {
    const threadID = event.threadId || event.threadID;
    if (event.senderID !== Reply.author) return;

    const userAnswer = parseInt(event.body?.trim(), 10);
    if (isNaN(userAnswer)) return;

    if (global.GoatBot?.onReply) {
      global.GoatBot.onReply.delete(event.messageReply?.messageID || Reply.messageID);
    }

    if (userAnswer === Reply.answer) {
      const win = `🎉 𝗕𝗥𝗜𝗟𝗟𝗜𝗔𝗡𝗧! Correct answer: ${Reply.answer}\n💰 Reward: +$${Reply.reward} added to your wallet!`;
      if (database && typeof database.addMoney === 'function') {
        database.addMoney(event.senderID, Reply.reward);
      }
      return message ? message.reply(win) : api.sendMessage(win, threadID);
    } else {
      const fail = `❌ 𝗜𝗡𝗖𝗢𝗥𝗥𝗘𝗖𝗧! The correct answer was: ${Reply.answer}`;
      return message ? message.reply(fail) : api.sendMessage(fail, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
