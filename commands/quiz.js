'use strict';

/**
 * Quiz Command - Trivia quiz game with cash prizes
 */

const fs = require('fs');
const path = require('path');
const { formatCash } = require('../func/arielUtils');

const QUIZ_FILE = path.join(__dirname, 'json/quiz.json');
let questions = [];
try {
  questions = JSON.parse(fs.readFileSync(QUIZ_FILE, 'utf8'));
} catch (_) {
  questions = [
    { question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], answer: 2 },
    { question: 'What is 7 x 8?', options: ['54', '56', '58', '64'], answer: 1 }
  ];
}

module.exports = {
  config: {
    name: 'quiz',
    aliases: ['trivia'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 5,
    role: 0,
    category: 'games',
    description: 'Answer trivia questions to earn virtual cash prizes',
    usage: 'quiz'
  },

  async run({ api, event, message }) {
    const tid = event.threadID || event.threadId;
    const q = questions[Math.floor(Math.random() * questions.length)];

    const letterOptions = ['A', 'B', 'C', 'D'];
    let optionsText = '';
    q.options.forEach((opt, idx) => {
      optionsText += `  ${letterOptions[idx]}. ${opt}\n`;
    });

    const reward = 800;
    const prompt =
      `🧠 𝐓𝐑𝐈𝐕𝐈𝐀 𝐐𝐔𝐈𝐙 𝐓𝐈𝐌𝐄\n` +
      `─`.repeat(26) + `\n` +
      `❓ ${q.question}\n\n` +
      `${optionsText}\n` +
      `─`.repeat(26) + `\n` +
      `💰 Prize: +$${formatCash(reward)}\n` +
      `💡 Reply to this message with A, B, C, or D to claim!`;

    const sent = message?.reply ? await message.reply(prompt) : await api.sendMessage(prompt, tid, undefined, event.messageID);
    const sentID = sent?.messageID || sent?.id;

    if (sentID && global.GoatBot?.onReply) {
      global.GoatBot.onReply.set(String(sentID), {
        commandName: 'quiz',
        author: event.senderID,
        correctIdx: q.answer,
        reward,
        options: q.options
      });
    }
  },

  async onReply({ api, event, Reply, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    const userAns = (event.body || '').trim().toUpperCase();
    const letterMap = { A: 0, B: 1, C: 2, D: 3, 1: 0, 2: 1, 3: 2, 4: 3 };

    const selectedIdx = letterMap[userAns];
    if (selectedIdx === undefined) {
      const hint = '💡 Please reply with A, B, C, or D!';
      return message?.reply ? message.reply(hint) : api.sendMessage(hint, tid, undefined, event.messageID);
    }

    if (global.GoatBot?.onReply && Reply.messageID) {
      global.GoatBot.onReply.delete(String(Reply.messageID));
    }

    if (selectedIdx === Reply.correctIdx) {
      if (usersData && typeof usersData.addMoney === 'function') {
        await usersData.addMoney(senderID, Reply.reward);
      }
      const winText = `🎉 𝐂𝐎𝐑𝐑𝐄𝐂𝐓!\nThe answer was indeed **${Reply.options[Reply.correctIdx]}**!\n💰 Prize: +$${formatCash(Reply.reward)} added to your wallet!`;
      return message?.reply ? message.reply(winText) : api.sendMessage(winText, tid, undefined, event.messageID);
    } else {
      const loseText = `❌ 𝐈𝐍𝐂𝐎𝐑𝐑𝐄𝐂𝐓!\nThe correct answer was **${Reply.options[Reply.correctIdx]}**. Better luck next time!`;
      return message?.reply ? message.reply(loseText) : api.sendMessage(loseText, tid, undefined, event.messageID);
    }
  }
};
