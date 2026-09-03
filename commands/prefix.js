module.exports = {
  config: { name: 'prefix', aliases: ['setprefix'], version: '1.0', author: 'Gtajisan && frnAlt', role: 0, cooldown: 5, category: 'config', description: 'Change bot prefix for this chat', usage: 'prefix [new] | prefix reset' },
  async run({ api, event, args, config, database, PermissionManager, ConfigManager }) {
    const threadId = event.threadId, userId = event.senderID;
    const currentPrefix = config.PREFIX;
    if (args.length === 0) return api.sendMessage(`📌 Current prefix: ${currentPrefix}\n\nUsage:\n• ${currentPrefix}prefix <new> — change for this chat\n• ${currentPrefix}prefix reset — reset to default\n• ${currentPrefix}prefix <new> -g — change globally (admin only)`, threadId);
    if (args[0].toLowerCase() === 'reset') {
      database.setThreadData(threadId, { prefix: null });
      return api.sendMessage(`✅ Prefix reset to: ${currentPrefix}`, threadId);
    }
    const newPrefix = args[0], isGlobal = args[1] === '-g' || args[1] === '--global';
    if (newPrefix.length > 5) return api.sendMessage('❌ Prefix must be 5 chars or less!', threadId);
    if (newPrefix.includes(' ')) return api.sendMessage('❌ Prefix cannot contain spaces!', threadId);
    if (isGlobal) {
      if (!await PermissionManager.hasPermission(userId, 2)) return api.sendMessage('❌ Only admins can change global prefix.', threadId);
      ConfigManager.updateConfig('prefix', newPrefix);
      return api.sendMessage(`✅ Global prefix changed to: ${newPrefix}`, threadId);
    }
    database.setThreadData(threadId, { prefix: newPrefix });
    return api.sendMessage(`✅ Thread prefix changed to: ${newPrefix}\n💡 Example: ${newPrefix}help`, threadId);
  }
};
