'use strict';

/**
 * Poll Command - Create interactive DM polls in Instagram threads
 */

function parsePollArgs(raw) {
  // Support pipe format: Question | opt1 | opt2
  if (raw.includes('|')) {
    const parts = raw.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return { question: parts[0], options: parts.slice(1) };
    }
  }

  // Support quote format: "Question" "Option 1" "Option 2"
  const matches = [...raw.matchAll(/"([^"]+)"|'([^']+)'/g)].map(m => m[1] || m[2]);
  if (matches.length >= 3) {
    return { question: matches[0], options: matches.slice(1) };
  }

  return null;
}

module.exports = {
  config: {
    name: 'poll',
    aliases: ['createpoll', 'vote'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 5,
    role: 0,
    category: 'instagram',
    description: 'Create an interactive native poll in the current group chat',
    usage: 'poll <Question> | <Option 1> | <Option 2> ... (or use quotes)'
  },

  async run({ api, event, args, message }) {
    const tid = String(event.threadID || event.threadId || '');
    const raw = args.join(' ').trim();

    if (!raw) {
      const usage =
        `📊 𝐂𝐑𝐄𝐀𝐓𝐄 𝐀 𝐏𝐎𝐋𝐋\n` +
        `─`.repeat(26) + `\n` +
        `Usage Format 1:\n` +
        `*poll Best Food? | Pizza | Burger | Sushi\n\n` +
        `Usage Format 2:\n` +
        `*poll "Best Food?" "Pizza" "Burger" "Sushi"`;
      return message?.reply ? message.reply(usage) : api?.sendMessage(usage, tid, undefined, event.messageID);
    }

    const parsed = parsePollArgs(raw);
    if (!parsed || parsed.options.length < 2) {
      const err = '❌ A poll requires a question and at least 2 options.\nExample: *poll Movie night? | Friday | Saturday';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    if (parsed.options.length > 10) {
      const err = '❌ Instagram polls allow a maximum of 10 options.';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    if (!api || typeof api.createPoll !== 'function') {
      const err = '❌ Native Poll creation is not supported by the current client adapter.';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    try {
      await api.createPoll(tid, parsed.question, parsed.options);
      const confirmText =
        `📊 𝐏𝐎𝐋𝐋 𝐂𝐑𝐄𝐀𝐓𝐄𝐃\n` +
        `─`.repeat(26) + `\n` +
        `❓ **${parsed.question}**\n` +
        parsed.options.map((opt, i) => `   ${i + 1}. ${opt}`).join('\n') + `\n` +
        `─`.repeat(26) + `\n` +
        `✨ Tap the poll buttons directly in Instagram to cast your vote!`;

      return message?.reply ? message.reply(confirmText) : api.sendMessage(confirmText, tid, undefined, event.messageID);
    } catch (err) {
      const errText = `❌ Failed to create poll: ${err.message}`;
      return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
    }
  }
};
