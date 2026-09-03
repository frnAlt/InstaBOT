module.exports = {
  config: { name: 'help', aliases: ['menu', 'commands', 'h'], version: '1.0', author: 'Gtajisan && frnAlt', description: 'Show all commands or info about one', usage: 'help [command]', cooldown: 3, role: 0, category: 'core' },
  async run({ api, event, args, bot, config, logger }) {
    try {
      const { commandLoader } = bot;
      const prefix = config.PREFIX;
      const allCommands = commandLoader.commands;
      const roleNames = { 0: 'Normal User', 1: 'Group Admin', 2: 'Bot Admin', 3: 'Premium User', 4: 'Developer' };
      const emojiMap = { ai: '🤖', core: '⚙️', fun: '🎮', economy: '💰', media: '🎬', tools: '🛠️', utility: '🛠️', info: 'ℹ️', game: '🎲', admin: '👑', moderation: '🛡️', owner: '👑', config: '🔧', others: '📦' };
      const cleanCat = t => (!t ? 'others' : t.normalize('NFKD').replace(/[^\w\s-]/g,'').trim().toLowerCase()) || 'others';

      if (args.length > 0) {
        const cmd = commandLoader.getCommand(args[0].toLowerCase());
        if (!cmd) return api.sendMessage(`❌ Command "${args[0]}" not found.\n\nType ${prefix}help to see all commands.`, event.threadId);
        const { name, version, author, usage, category, description, aliases, cooldown, role } = cmd.config;
        const usageStr = usage ? usage.replace(/\{pn\}/g, prefix) : `${prefix}${name}`;
        let info = `☠️ COMMAND INFO ☠️\n\n`;
        info += `➥ Name: ${name}\n➥ Version: ${version || '1.0'}\n➥ Category: ${category || 'Uncategorized'}\n`;
        info += `➥ Description: ${description || 'No description'}\n➥ Aliases: ${aliases?.length ? aliases.join(', ') : 'None'}\n`;
        info += `➥ Usage: ${usageStr}\n➥ Cooldown: ${cooldown || 0}s\n➥ Permission: ${role ?? 0} — ${roleNames[role] ?? 'Normal User'}\n➥ Author: ${author || 'Unknown'}`;
        return api.sendMessage(info, event.threadId);
      }

      const categories = {};
      let total = 0;
      for (const [key, cmd] of allCommands) {
        if (cmd.config.name !== key) continue;
        const cat = cleanCat(cmd.config.category);
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd.config.name);
        total++;
      }

      let msg = `━━━☠️ ${config.NICK_NAME_BOT || 'GoatBot-IG'} ☠️━━━\n│ Prefix: ${prefix}  │  Commands: ${total}\n`;
      for (const cat of Object.keys(categories).sort()) {
        const emoji = emojiMap[cat] || '➥';
        msg += `\n╭──『 ${emoji} ${cat.toUpperCase()} 』\n`;
        msg += categories[cat].sort().map(c => `× ${c}`).join('  ') + '\n';
        msg += `╰────────────◊\n`;
      }
      msg += `\n➥ Use: ${prefix}help [command] for details`;
      return api.sendMessage(msg, event.threadId);
    } catch (e) { logger.error('Error in help', { error: e.message }); return api.sendMessage('❌ Error displaying help.', event.threadId); }
  }
};
