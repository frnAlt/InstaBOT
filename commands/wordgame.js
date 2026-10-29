'use strict';

/**
 * Word Game Command - Unscramble words for cash rewards
 */

const fs = require('fs');
const path = require('path');
const { formatCash } = require('../func/arielUtils');

const WORDS_FILE = path.join(__dirname, 'json/words.json');
let wordList = [];
try {
  wordList = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf8'));
} catch (_) {
  wordList = ['INSTAGRAM', 'AUTOMATION', 'FLOPPA', 'COMPUTER', 'ALGORITHM', 'DATABASE', 'NETWORK'];
}

function scramble(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const res = arr.join('');
  return res === word ? scramble(word) : res;
}

module.exports = {
  config: {
    name: 'wordgame',
    aliases: ['scramble', 'unscramble'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 5,
    role: 0,
    category: 'games',
    description: 'Unscramble the jumbled word to win virtual cash prizes',
    usage: 'wordgame'
  },

  async run({ api, event, message }) {
    const tid = event.threadID || event.threadId;

    const rawWord = String(wordList[Math.floor(Math.random() * wordList.length)]).toUpperCase().trim();
    const jumbled = scramble(rawWord);
    const reward = 1000;

    const prompt =
      `🔤 𝐖𝐎𝐑𝐃 𝐔𝐍𝐒𝐂𝐑𝐀𝐌𝐁𝐋𝐄 𝐂𝐇𝐀𝐋𝐋𝐄𝐍𝐆𝐄\n` +
      `─`.repeat(28) + `\n` +
      `🧩 Scrambled: **${jumbled}**\n` +
      `📏 Letters:   ${rawWord.length}\n` +
      `💰 Prize:     +$${formatCash(reward)}\n` +
      `─`.repeat(28) + `\n` +
      `💡 Reply to this message with the unscrambled word!`;

    const sent = message?.reply ? await message.reply(prompt) : await api.sendMessage(prompt, tid, undefined, event.messageID);
    const sentID = sent?.messageID || sent?.id;

    if (sentID && global.GoatBot?.onReply) {
      global.GoatBot.onReply.set(String(sentID), {
        commandName: 'wordgame',
        author: event.senderID,
        word: rawWord,
        reward
      });
    }
  },

  async onReply({ api, event, Reply, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const userGuess = (event.body || '').trim().toUpperCase();

    if (userGuess === Reply.word) {
      if (global.GoatBot?.onReply && Reply.messageID) {
        global.GoatBot.onReply.delete(String(Reply.messageID));
      }

      if (usersData && typeof usersData.addMoney === 'function') {
        await usersData.addMoney(senderID, Reply.reward);
      }

      const winText =
        `🎉 𝐁𝐈𝐍𝐆𝐎!\n` +
        `You correctly solved the word **${Reply.word}**!\n` +
        `💰 Prize: +$${formatCash(Reply.reward)} credited to your wallet!`;

      return message?.reply ? message.reply(winText) : api.sendMessage(winText, tid, undefined, event.messageID);
    } else {
      const hint = `❌ Not quite! That's not the correct word. Keep trying!`;
      return message?.reply ? message.reply(hint) : api.sendMessage(hint, tid, undefined, event.messageID);
    }
  }
};
