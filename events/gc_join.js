const logger = require('../utils/logger');
const config = require('../config');

module.exports = {
  config: { name: 'gc_join', description: 'Welcome new members' },
  async run(bot, data = {}) {
    try {
      if (config.LOG_EVENTS?.disableAll || !config.LOG_EVENTS?.event) return;
      const { api } = bot || {};
      const { threadID, addedParticipants } = data || {};
      if (!threadID || !api || !addedParticipants || !addedParticipants.length) return;
      for (const p of addedParticipants) {
        const name = p.fullName || p.name || `User ${p.userFbId || p.userId || ''}`;
        await api.sendMessage(`👋 Welcome to the group, ${name}!\n\nType ${config.PREFIX}help to see what I can do.`, threadID);
      }
    } catch (e) { logger.error('Error in gc_join event', { error: e.message }); }
  }
};
