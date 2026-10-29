'use strict';

/**
 * Quote Command - Philosophical, inspirational, and wisdom quotes
 */

const QUOTES = [
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
  { text: 'The happiness of your life depends upon the quality of your thoughts.', author: 'Marcus Aurelius' },
  { text: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
  { text: 'In the midst of chaos, there is also opportunity.', author: 'Sun Tzu' },
  { text: 'Life is not a problem to be solved, but a reality to be experienced.', author: 'Søren Kierkegaard' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle' },
  { text: 'I think, therefore I am.', author: 'René Descartes' },
  { text: 'The only true wisdom is in knowing you know nothing.', author: 'Socrates' },
  { text: 'Imagination is more important than knowledge.', author: 'Albert Einstein' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Waste no more time arguing what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'Difficulties strengthen the mind, as labor does the body.', author: 'Seneca' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'Happiness is not something ready made. It comes from your own actions.', author: 'Dalai Lama' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Turn your wounds into wisdom.', author: 'Oprah Winfrey' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' }
];

module.exports = {
  config: {
    name: 'quote',
    aliases: ['motivate', 'wisdom', 'inspiration'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 2,
    role: 0,
    category: 'fun',
    description: 'Get an inspiring philosophical quote or word of wisdom',
    usage: 'quote'
  },

  async run({ api, event, message }) {
    const tid = event.threadID || event.threadId;

    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    const text =
      `📜 𝐖𝐎𝐑𝐃𝐒 𝐎𝐅 𝐖𝐈𝐒𝐃𝐎𝐌\n` +
      `─`.repeat(26) + `\n` +
      `💬 "${random.text}"\n` +
      `─`.repeat(26) + `\n` +
      `✍️ — **${random.author}**`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
