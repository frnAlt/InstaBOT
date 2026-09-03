const logger = require('../utils/logger');

module.exports = {
  config: { name: 'error', description: 'Handle bot errors' },
  async run(bot, error) {
    const errorMsg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error || 'Unknown error'));
    logger.error('Bot error occurred', { error: errorMsg, stack: error?.stack || '' });
    if (bot.shouldReconnect) {
      logger.info('Attempting to reconnect...');
      setTimeout(() => { if (bot.reconnect) bot.reconnect(); }, 5000);
    }
  }
};
