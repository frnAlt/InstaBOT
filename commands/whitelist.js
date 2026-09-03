module.exports = {
  config: {
    name: 'whitelist',
    aliases: ['wl'],
    description: 'Manage the user and thread whitelist (Bot Admin only)',
    usage: 'whitelist <on|off|add|remove|list> [user|thread] [id]',
    role: 2,
    cooldown: 3,
    category: 'admin'
  },

  async run({ api, event, args, config, ConfigManager }) {
    if (args.length === 0) return this.showStatus(api, event, config);

    const action = args[0].toLowerCase();

    if (action === 'on' || action === 'off') {
      return this.toggleMode(api, event, args, action, ConfigManager);
    }

    if (action === 'list') {
      return this.listEntries(api, event, args, ConfigManager);
    }

    if (action === 'add' || action === 'remove') {
      return this.modifyEntry(api, event, args, action, ConfigManager);
    }

    return api.sendMessage(
      '📋 Whitelist Commands\n\n' +
      '• whitelist — show current status\n' +
      '• whitelist on user — enable user whitelist\n' +
      '• whitelist off user — disable user whitelist\n' +
      '• whitelist on thread — enable thread whitelist\n' +
      '• whitelist off thread — disable thread whitelist\n' +
      '• whitelist add user <id> — add a user\n' +
      '• whitelist remove user <id> — remove a user\n' +
      '• whitelist add thread <id> — add a thread\n' +
      '• whitelist remove thread <id> — remove a thread\n' +
      '• whitelist list user — list whitelisted users\n' +
      '• whitelist list thread — list whitelisted threads',
      event.threadId
    );
  },

  showStatus(api, event, config) {
    const c = ConfigManager_load();
    const userIds   = c.whiteListMode?.whiteListIds || [];
    const threadIds = c.whiteListModeThread?.whiteListThreadIds || [];

    return api.sendMessage(
      '📋 Whitelist Status\n\n' +
      `User whitelist:   ${config.WHITELIST_ENABLE ? '✅ ON' : '❌ OFF'} (${userIds.length} entries)\n` +
      `Thread whitelist: ${config.WHITELIST_THREAD_ENABLE ? '✅ ON' : '❌ OFF'} (${threadIds.length} entries)\n\n` +
      'Use "whitelist on/off user|thread" to toggle.',
      event.threadId
    );
  },

  toggleMode(api, event, args, action, ConfigManager) {
    const scope = (args[1] || '').toLowerCase();
    if (!['user', 'thread'].includes(scope)) {
      return api.sendMessage('⚠️ Specify scope: whitelist on/off user|thread', event.threadId);
    }

    const cfg = ConfigManager.loadConfig();
    const enable = action === 'on';

    if (scope === 'user') {
      if (!cfg.whiteListMode) cfg.whiteListMode = { enable: false, whiteListIds: [] };
      cfg.whiteListMode.enable = enable;
    } else {
      if (!cfg.whiteListModeThread) cfg.whiteListModeThread = { enable: false, whiteListThreadIds: [] };
      cfg.whiteListModeThread.enable = enable;
    }

    ConfigManager.saveConfig(cfg);
    return api.sendMessage(
      `✅ ${scope.charAt(0).toUpperCase() + scope.slice(1)} whitelist turned ${enable ? 'ON' : 'OFF'}.\n` +
      '⚠️ Restart the bot for this change to take full effect.',
      event.threadId
    );
  },

  modifyEntry(api, event, args, action, ConfigManager) {
    const scope = (args[1] || '').toLowerCase();
    const id    = args[2];

    if (!['user', 'thread'].includes(scope)) {
      return api.sendMessage(`⚠️ Specify scope: whitelist ${action} user|thread <id>`, event.threadId);
    }
    if (!id || !/^\d+$/.test(id)) {
      return api.sendMessage('⚠️ Please provide a valid numeric ID.', event.threadId);
    }

    const cfg = ConfigManager.loadConfig();

    if (scope === 'user') {
      if (!cfg.whiteListMode) cfg.whiteListMode = { enable: false, whiteListIds: [] };
      if (!cfg.whiteListMode.whiteListIds) cfg.whiteListMode.whiteListIds = [];
      const list = cfg.whiteListMode.whiteListIds;

      if (action === 'add') {
        if (list.includes(id)) return api.sendMessage(`ℹ️ User ${id} is already whitelisted.`, event.threadId);
        list.push(id);
      } else {
        const idx = list.indexOf(id);
        if (idx === -1) return api.sendMessage(`ℹ️ User ${id} is not in the whitelist.`, event.threadId);
        list.splice(idx, 1);
      }
    } else {
      if (!cfg.whiteListModeThread) cfg.whiteListModeThread = { enable: false, whiteListThreadIds: [] };
      if (!cfg.whiteListModeThread.whiteListThreadIds) cfg.whiteListModeThread.whiteListThreadIds = [];
      const list = cfg.whiteListModeThread.whiteListThreadIds;

      if (action === 'add') {
        if (list.includes(id)) return api.sendMessage(`ℹ️ Thread ${id} is already whitelisted.`, event.threadId);
        list.push(id);
      } else {
        const idx = list.indexOf(id);
        if (idx === -1) return api.sendMessage(`ℹ️ Thread ${id} is not in the whitelist.`, event.threadId);
        list.splice(idx, 1);
      }
    }

    ConfigManager.saveConfig(cfg);
    const verb = action === 'add' ? 'added to' : 'removed from';
    return api.sendMessage(`✅ ${scope.charAt(0).toUpperCase() + scope.slice(1)} ${id} ${verb} the whitelist.`, event.threadId);
  },

  listEntries(api, event, args, ConfigManager) {
    const scope = (args[1] || 'user').toLowerCase();
    const cfg = ConfigManager.loadConfig();

    if (scope === 'thread') {
      const list = cfg.whiteListModeThread?.whiteListThreadIds || [];
      if (list.length === 0) return api.sendMessage('ℹ️ Thread whitelist is empty.', event.threadId);
      return api.sendMessage(`📋 Whitelisted Threads (${list.length}):\n\n${list.join('\n')}`, event.threadId);
    }

    const list = cfg.whiteListMode?.whiteListIds || [];
    if (list.length === 0) return api.sendMessage('ℹ️ User whitelist is empty.', event.threadId);
    return api.sendMessage(`📋 Whitelisted Users (${list.length}):\n\n${list.join('\n')}`, event.threadId);
  }
};

function ConfigManager_load() {
  const ConfigManager = require('../utils/configManager');
  return ConfigManager.loadConfig();
}
