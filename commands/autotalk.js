const config = require('../config');

module.exports = {
  config: {
    name: 'autotalk',
    aliases: ['atalk', 'chatbot', 'simtalk', 'talk', 'botchat'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 3,
    role: 0,
    category: 'ai',
    description: 'Toggle Auto-Talk AI chatbot system for this chat',
    usage: 'autotalk [on | off | status]'
  },

  async onStart({ message, event, args, database }) {
    const threadID = event.threadId || event.threadID;
    const threadData = database.getThreadData(threadID);
    if (!threadData.settings) threadData.settings = {};

    const mode = args[0] ? args[0].toLowerCase() : null;

    if (mode === 'on' || mode === 'enable') {
      threadData.settings.autotalk = true;
      database.setThreadData(threadID, threadData);
      database.save();
      return message.reply('🗣️ Auto-Talk Chatbot has been ENABLED for this chat! Bot will now automatically converse with users.');
    }

    if (mode === 'off' || mode === 'disable') {
      threadData.settings.autotalk = false;
      database.setThreadData(threadID, threadData);
      database.save();
      return message.reply('🔇 Auto-Talk Chatbot has been DISABLED for this chat.');
    }

    const currentState = threadData.settings.autotalk !== false;
    return message.reply(`🗣️ Auto-Talk Status: ${currentState ? 'ENABLED ✅' : 'DISABLED ❌'}\n\nUsage:\n!autotalk on - Enable auto-talk\n!autotalk off - Disable auto-talk`);
  }
};
