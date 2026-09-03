/**
 * Word Game / Scramble Command
 * Word unscrambler puzzle game with coin rewards
 */

const WORDS = [
  { word: "instagram", hint: "Popular photo & video sharing social platform" },
  { word: "algorithm", hint: "Step-by-step procedure for calculations" },
  { word: "javascript", hint: "The programming language of the web" },
  { word: "database", hint: "Organized collection of structured data" },
  { word: "developer", hint: "A person that creates computer software" },
  { word: "artificial", hint: "Made or produced by human beings rather than naturally" },
  { word: "intelligence", hint: "The ability to acquire and apply knowledge and skills" },
  { word: "cybersecurity", hint: "Practice of protecting systems from digital attacks" },
  { word: "encryption", hint: "Process of converting information into secret code" },
  { word: "framework", hint: "Essential supporting structure for software applications" },
  { word: "repository", hint: "Storage location for software packages and source code" },
  { word: "automation", hint: "Execution of processes by automatic means" },
  { word: "technology", hint: "Application of scientific knowledge for practical purposes" },
  { word: "blockchain", hint: "Decentralized, distributed, and public digital ledger" },
  { word: "architecture", hint: "Complex or carefully designed structure of something" },
  { word: "application", hint: "A program designed for end users to perform tasks" },
  { word: "interface", hint: "A device or program enabling a user to communicate with a computer" },
  { word: "serverless", hint: "Cloud computing execution model where provider allocates resources" },
  { word: "responsive", hint: "Reacting quickly and positively; adaptable web design" },
  { word: "asynchronous", hint: "Not occurring at the same time; non-blocking code" }
];

function scramble(word) {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const result = letters.join('');
  return result === word ? scramble(word) : result;
}

module.exports = {
  config: {
    name: "wordgame",
    aliases: ["scramble", "wordscramble", "unscramble"],
    version: "1.1.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Word scramble puzzle guessing game"
    },
    longDescription: {
      en: "Unscramble the letters to reveal the secret word and win currency rewards."
    },
    category: "game",
    guide: {
      en: "{p}wordgame"
    }
  },

  onStart: async function ({ api, event, message, database }) {
    const threadID = event.threadId || event.threadID;
    const target = WORDS[Math.floor(Math.random() * WORDS.length)];
    const scrambledWord = scramble(target.word);

    let msg = `🧩 𝗪𝗢𝗥𝗗 𝗦𝗖𝗥𝗔𝗠𝗕𝗟𝗘 𝗚𝗔𝗠𝗘\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🔤 𝗦𝗰𝗿𝗮𝗺𝗯𝗹𝗲𝗱 𝗪𝗼𝗿𝗱: ｢ ${scrambledWord.toUpperCase()} ｣\n`;
    msg += `💡 𝗛𝗶𝗻𝘁: ${target.hint}\n`;
    msg += `💰 𝗥𝗲𝘄𝗮𝗿𝗱: +$250\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👉 Reply to this message with the correct word within 60 seconds!`;

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
        commandName: "wordgame",
        author: event.senderID,
        targetWord: target.word.toLowerCase(),
        reward: 250,
        createdAt: Date.now()
      });
    }
  },

  onReply: async function ({ api, event, Reply, message, database }) {
    const threadID = event.threadId || event.threadID;
    if (event.senderID !== Reply.author) return;

    const answer = (event.body || "").trim().toLowerCase();
    if (!answer) return;

    if (global.GoatBot?.onReply) {
      global.GoatBot.onReply.delete(event.messageReply?.messageID || Reply.messageID);
    }

    if (answer === Reply.targetWord) {
      const winMsg = `🎉 𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡𝗦!\n\n✅ Correct Word: ${Reply.targetWord.toUpperCase()}\n💰 Reward: +$${Reply.reward} added to your balance!`;
      if (database && typeof database.addMoney === 'function') {
        database.addMoney(event.senderID, Reply.reward);
      }
      return message ? message.reply(winMsg) : api.sendMessage(winMsg, threadID);
    } else {
      const failMsg = `❌ 𝗜𝗡𝗖𝗢𝗥𝗥𝗘𝗖𝗧! The correct word was: ${Reply.targetWord.toUpperCase()}`;
      return message ? message.reply(failMsg) : api.sendMessage(failMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
