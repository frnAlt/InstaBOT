module.exports = {
  config: { name: 'info', aliases: ['about'], description: 'Show bot information', usage: 'info', cooldown: 5, role: 0, category: 'core' },
  async run({ api, event, bot, logger, config }) {
    try {
      const uptime = process.uptime();
      const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60), s = Math.floor(uptime % 60);
      const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      let t = `${config.BOT_NAME || 'InstaBOT'}\n\n`;
      t += `📦 Version: ${config.BOT_VERSION}\n👤 Author: ${config.AUTHOR || 'Gtajisan && frnAlt'}\n⚙️ Prefix: ${config.PREFIX}\n`;
      t += `📚 Commands: ${bot.commandLoader.getAllCommandNames().length}\n`;
      t += `⏱️ Uptime: ${h}h ${m}m ${s}s\n💾 Memory: ${mem}MB\n🟢 Node: ${process.version}\n✅ Status: Online`;
      return api.sendMessage(t, event.threadId);
    } catch (e) { logger.error('Error in info', { error: e.message }); return api.sendMessage('❌ Error.', event.threadId); }
  }
};
