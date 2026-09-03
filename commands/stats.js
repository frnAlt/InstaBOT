module.exports = {
  config: {
    name: 'stats',
    aliases: ['statistics', 'botstats', 'botinfo'],
    description: 'View bot statistics and user info',
    usage: 'stats [user]',
    cooldown: 5,
    role: 0,
    author: 'Gtajisan && frnAlt',
    category: 'info'
  },

  async run({ api, event, bot, logger, database, config }) {
    try {
      const userId = event.senderID;

      // Get user stats
      const user = database.getUser(userId);
      const allUsers = database.getAllUsers();
      const allStats = database.getAllStats();

      // Calculate bot stats
      const totalUsers = allUsers.length;
      const totalMessages = allStats.totalMessages || allUsers.reduce((sum, u) => sum + (u.messageCount || 0), 0);
      const totalCommands = allStats.totalCommands || allUsers.reduce((sum, u) => sum + (u.commandCount || 0), 0);

      // Calculate user rank
      const sortedUsers = allUsers.sort((a, b) => (b.messageCount || 0) - (a.messageCount || 0));
      const userRank = sortedUsers.findIndex(u => String(u.id || u.userID) === String(userId)) + 1;

      // Format dates
      const firstSeen = user.firstSeen ? new Date(user.firstSeen).toLocaleDateString() : 'Unknown';
      const lastSeen = user.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : 'Unknown';

      let message = `📊 Statistics\n\n`;
      message += `Your Stats\n`;
      message += `👤 User ID: ${userId}\n`;
      message += `📨 Messages: ${user.messageCount || 0}\n`;
      message += `⚡ Commands: ${user.commandCount || 0}\n`;
      message += `🏆 Rank: #${userRank} / ${totalUsers}\n`;
      message += `📅 First seen: ${firstSeen}\n`;
      message += `🕐 Last active: ${lastSeen}\n\n`;

      message += `Bot Stats\n`;
      message += `👥 Total users: ${totalUsers}\n`;
      message += `💬 Total messages: ${totalMessages}\n`;
      const cmdCount = bot.commandLoader?.getAllCommandNames ? bot.commandLoader.getAllCommandNames().length : (bot.commandLoader?.commands?.size || 0);
      const evCount = bot.eventLoader?.getAllEventNames ? bot.eventLoader.getAllEventNames().length : (bot.eventLoader?.events?.size || 0);
      message += `📦 Commands: ${cmdCount}\n`;
      message += `🎯 Events: ${evCount}\n\n`;

      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      message += `⏱️ Uptime: ${hours}h ${minutes}m`;

      return api.sendMessage(message, event.threadId);

    } catch (error) {
      logger.error('Error in stats command', { error: error.message });
      return api.sendMessage('❌ Error fetching statistics.', event.threadId);
    }
  }
};
