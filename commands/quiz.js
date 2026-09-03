/**
 * Trivia Quiz Command
 * Multi-category trivia questions with reward points
 */

const axios = require("axios");

const decodeHTML = (str) => {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&eacute;/g, "é")
    .replace(/&ouml;/g, "ö")
    .replace(/&deg;/g, "°");
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

module.exports = {
  config: {
    name: "quiz",
    aliases: ["trivia", "question"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Interactive trivia quiz game with rewards"
    },
    longDescription: {
      en: "Fetches a multiple-choice trivia question. Reply with the option number (1-4) within 30 seconds to score."
    },
    category: "game",
    guide: {
      en: "{p}quiz [category]"
    }
  },

  onStart: async function ({ api, event, args, message, database }) {
    const threadID = event.threadId || event.threadID;

    try {
      const { data } = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple", { timeout: 6000 });
      if (!data.results || data.results.length === 0) {
        throw new Error("No quiz question available");
      }

      const q = data.results[0];
      const question = decodeHTML(q.question);
      const correctAnswer = decodeHTML(q.correct_answer);
      const incorrectAnswers = q.incorrect_answers.map(decodeHTML);
      const allAnswers = shuffle([correctAnswer, ...incorrectAnswers]);
      const correctIndex = allAnswers.indexOf(correctAnswer) + 1;

      let msg = `🎯 𝗧𝗥𝗜𝗩𝗜𝗔 𝗤𝗨𝗜𝗭 𝗧𝗜𝗠𝗘!\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📚 Category: ${decodeHTML(q.category)}\n`;
      msg += `⚡ Difficulty: ${q.difficulty.toUpperCase()}\n\n`;
      msg += `❓ ${question}\n\n`;
      allAnswers.forEach((ans, idx) => {
        msg += `${idx + 1}. ${ans}\n`;
      });
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `💡 Reply with 1, 2, 3, or 4 within 60 seconds!`;

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
          commandName: "quiz",
          author: event.senderID,
          correctIndex,
          correctAnswer,
          reward: q.difficulty === 'hard' ? 300 : q.difficulty === 'medium' ? 200 : 100,
          createdAt: Date.now()
        });
      }
    } catch (err) {
      const errMsg = `❌ Failed to fetch quiz: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  onReply: async function ({ api, event, Reply, message, database }) {
    const threadID = event.threadId || event.threadID;
    if (event.senderID !== Reply.author) return;

    const answerNum = parseInt(event.body?.trim(), 10);
    if (isNaN(answerNum) || answerNum < 1 || answerNum > 4) {
      return message ? message.reply("⚠️ Please reply with a valid number between 1 and 4!") : api.sendMessage("⚠️ Please reply with a valid number between 1 and 4!", threadID);
    }

    if (global.GoatBot?.onReply) {
      global.GoatBot.onReply.delete(event.messageReply?.messageID || Reply.messageID);
    }

    if (answerNum === Reply.correctIndex) {
      const successMsg = `🎉 𝗖𝗢𝗥𝗥𝗘𝗖𝗧! Well done!\n\n✅ Answer: ${Reply.correctAnswer}\n💰 Reward: +$${Reply.reward}`;
      if (database && typeof database.addMoney === 'function') {
        database.addMoney(event.senderID, Reply.reward);
      }
      return message ? message.reply(successMsg) : api.sendMessage(successMsg, threadID);
    } else {
      const failMsg = `❌ 𝗪𝗥𝗢𝗡𝗚! Better luck next time.\n\n✅ The correct answer was: ${Reply.correctIndex}. ${Reply.correctAnswer}`;
      return message ? message.reply(failMsg) : api.sendMessage(failMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
