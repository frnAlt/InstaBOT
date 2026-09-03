const logger = require('../utils/logger');
const config = require('../config');

module.exports = {
  config: { name: 'gc_leave', description: 'Farewell when member leaves' },
  async run(bot, data = {}) {
    try {
      if (config.LOG_EVENTS?.disableAll || !config.LOG_EVENTS?.event) return;
      const { api } = bot || {};
      const { threadID, leftUserId } = data || {};
      if (!threadID || !api || !leftUserId || (bot?.userID && String(leftUserId) === String(bot.userID))) return;
      logger.info(`Member left thread ${threadID}: ${leftUserId}`);
      let name = `User ${leftUserId}`;
      try {
        const info = await api.getUserInfo(leftUserId);
        if (info) { const d = info[leftUserId] || Object.values(info)[0]; if (d) name = d.name || d.fullName || name; }
      } catch (_) {}
      await api.sendMessage(`👋 ${name} has left the group. We'll miss you!`, threadID);
    } catch (e) { logger.error('Error in gc_leave event', { error: e.message }); }
  }
};
