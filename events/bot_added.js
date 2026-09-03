const logger = require('../utils/logger');
const config = require('../config');

module.exports = {
  config: { name: 'bot_added', description: 'Introduction when bot is added to a group' },
  async run(bot, data = {}) {
    try {
      const { api } = bot || {};
      const { threadID, addedBy } = data || {};
      if (!threadID || !api) return;
      logger.info(`Bot added to thread: ${threadID} by ${addedBy}`);
      await api.sendMessage(
        `👋 Hello! I'm ${config.NICK_NAME_BOT || 'InstaBOT'}.\n\nThanks for adding me!\n\n📌 Prefix: ${config.PREFIX}\n💡 Type ${config.PREFIX}help to see all commands. 🚀`,
        threadID
      );
    } catch (e) { logger.error('Error in bot_added event', { error: e.message }); }
  }
};
