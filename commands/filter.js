module.exports = {
  config: {
    name: 'filter',
    aliases: ['filters', 'addfilter', 'stopfilter', 'stop'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 3,
    role: 1, // Admin or Thread Admin
    category: 'Group',
    description: 'Rose-bot style keyword filters: auto-respond when specific phrases are typed in group chat',
    usage: 'filter <trigger> - <reply> | filters | stop <trigger>'
  },

  onStart: async function ({ api, event, args, message, database }) {
    const threadID = event.threadId || event.threadID;
    const threadData = database.getThreadData(threadID) || {};
    if (!threadData.filters) threadData.filters = {};

    if (args.length === 0 || args[0] === 'list' || event.body.toLowerCase().startsWith('!filters')) {
      const activeKeys = Object.keys(threadData.filters);
      if (activeKeys.length === 0) {
        return message.reply('ℹ️ No active keyword filters in this thread.\nAdd one using: !filter <keyword> - <reply>');
      }
      let listMsg = '📜 **Active Rose Filters in this Thread:**\n\n';
      activeKeys.forEach((key, idx) => {
        listMsg += `${idx + 1}. **${key}** → "${threadData.filters[key]}"\n`;
      });
      listMsg += '\nRemove filter with: !stop <keyword>';
      return message.reply(listMsg);
    }

    const fullText = args.join(' ');

    if (args[0] === 'remove' || args[0] === 'delete' || event.body.toLowerCase().startsWith('!stop')) {
      const keyToRemove = (event.body.toLowerCase().startsWith('!stop') ? args.join(' ') : args.slice(1).join(' ')).toLowerCase().trim();
      if (!keyToRemove) return message.reply('❌ Please specify a filter keyword to stop.\nExample: !stop hello');

      if (!threadData.filters[keyToRemove]) {
        return message.reply(`❌ Filter "${keyToRemove}" does not exist in this thread.`);
      }

      delete threadData.filters[keyToRemove];
      database.setThreadData(threadID, threadData);
      return message.reply(`✅ Removed filter for **"${keyToRemove}"**.`);
    }

    // Adding a filter: <trigger> - <reply>
    const parts = fullText.split(/\s*-\s*/);
    if (parts.length < 2) {
      return message.reply('❌ Invalid format!\nUsage: !filter <trigger> - <reply>\nExample: !filter hello - Welcome to our group!');
    }

    const trigger = parts[0].toLowerCase().trim();
    const replyText = parts.slice(1).join(' - ').trim();

    threadData.filters[trigger] = replyText;
    database.setThreadData(threadID, threadData);

    return message.reply(`✅ Added Rose filter!\n\n🔹 **Trigger:** "${trigger}"\n💬 **Response:** "${replyText}"`);
  },

  onChat: async function ({ api, event, message, database }) {
    if (!event.body || typeof event.body !== 'string') return;
    const threadID = event.threadId || event.threadID;
    const threadData = database.getThreadData(threadID);
    if (!threadData || !threadData.filters) return;

    const lowerBody = event.body.toLowerCase().trim();

    for (const [trigger, replyText] of Object.entries(threadData.filters)) {
      if (lowerBody.includes(trigger)) {
        return message.reply(replyText);
      }
    }
  }
};
