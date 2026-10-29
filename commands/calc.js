'use strict';

/**
 * Calculator Command - Safe mathematical expression evaluator
 */

function safeEvaluate(expr) {
  // Clean expression
  let cleaned = String(expr).trim();
  if (!cleaned) return null;

  // Substitute mathematical aliases
  cleaned = cleaned
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\^/g, '**')
    .replace(/\bpi\b/gi, String(Math.PI))
    .replace(/\be\b/gi, String(Math.E));

  // Validate allowed characters: digits, decimal, operators, parens, and standard Math functions
  const safeMathRegex = /^([0-9\.\+\-\*\/\%\(\)\,\s]|Math\.(sin|cos|tan|asin|acos|atan|sqrt|cbrt|abs|log|log10|log2|round|floor|ceil|min|max|pow))+$/;

  // Prepend Math. to allowed functions if missing
  cleaned = cleaned.replace(/\b(sin|cos|tan|asin|acos|atan|sqrt|cbrt|abs|log|log10|log2|round|floor|ceil|min|max|pow)\b/gi, 'Math.$1');

  if (!safeMathRegex.test(cleaned)) {
    throw new Error('Expression contains disallowed characters or functions.');
  }

  // Evaluate inside Function constructor with restricted scope
  // eslint-disable-next-line no-new-func
  const fn = new Function('Math', `"use strict"; return (${cleaned});`);
  const result = fn(Math);

  if (typeof result !== 'number' || isNaN(result)) {
    throw new Error('Could not calculate a valid number.');
  }

  return result;
}

module.exports = {
  config: {
    name: 'calc',
    aliases: ['calculator', 'math'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 1,
    role: 0,
    category: 'utilities',
    description: 'Calculate mathematical expressions safely',
    usage: 'calc <expression> (e.g. *calc (25 * 4) + sqrt(144))'
  },

  async run({ api, event, args, message }) {
    const tid = event.threadID || event.threadId;

    const rawExpr = args.join(' ').trim();
    if (!rawExpr) {
      const err = '❌ Please provide a math expression: *calc <expression>\nExample: *calc 150 * 1.25 + sqrt(64)';
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    try {
      const result = safeEvaluate(rawExpr);
      const formatted = Number.isInteger(result) ? result.toLocaleString() : result.toFixed(4).replace(/\.?0+$/, '');

      const text =
        `🧮 𝐌𝐀𝐓𝐇 𝐄𝐕𝐀𝐋𝐔𝐀𝐓𝐈𝐎𝐍\n` +
        `─`.repeat(24) + `\n` +
        `📝 Input:   ${rawExpr}\n` +
        `💡 Result:  ${formatted}\n` +
        `─`.repeat(24);

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } catch (error) {
      const err = `❌ Calculation Error: ${error.message}`;
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }
  }
};
