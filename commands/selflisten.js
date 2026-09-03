const { login } = require('../ica');
const setOptions = login?.setOptions || (() => {});

module.exports = {
  config: {
    name: 'selflisten',
    aliases: ['selfmode', 'listenself'],
    description: 'Toggle whether the bot listens to its own messages',
    usage: 'selflisten [on|off]',
    role: 4,
    cooldown: 5,
    category: 'system'
  },

  async run({ api, event, args, config, ConfigManager }) {
    const cfg = ConfigManager.loadConfig();
    if (!cfg.optionsFca) cfg.optionsFca = {};

    const current = cfg.optionsFca.selfListen !== undefined
      ? cfg.optionsFca.selfListen
      : true;

    if (args.length === 0) {
      return api.sendMessage(
        `🔊 Self-listen is currently: ${current ? '✅ ON' : '❌ OFF'}\n\n` +
        'Use "selflisten on" or "selflisten off" to toggle.',
        event.threadId
      );
    }

    const action = args[0].toLowerCase();
    if (!['on', 'off'].includes(action)) {
      return api.sendMessage('⚠️ Usage: selflisten on|off', event.threadId);
    }

    const enable = action === 'on';
    cfg.optionsFca.selfListen = enable;
    ConfigManager.saveConfig(cfg);

    try {
      setOptions({ selfListen: enable });
    } catch (_) {}

    return api.sendMessage(
      `${enable ? '✅' : '❌'} Self-listen turned ${action.toUpperCase()}.\n` +
      'Applied immediately (also saved to config).',
      event.threadId
    );
  }
};
