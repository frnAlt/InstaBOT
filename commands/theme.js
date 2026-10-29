'use strict';

/**
 * Chat Theme Command
 * Change Instagram Direct chat themes using the verified catalog of presets
 */

const { VERIFIED_THEMES, searchThemes, resolveTheme } = require('../ica/src/methods/themes');

module.exports = {
  config: {
    name: 'theme',
    aliases: ['themes', 'chattheme', 'color'],
    version: '2.0.0',
    author: 'frnAlt',
    cooldown: 3,
    role: 0,
    category: 'utility',
    description: 'View and change the Instagram Direct chat theme for this thread',
    usage: 'theme [list | search <query> | reset | <theme_name_or_id>]'
  },

  async run({ api, event, args, message }) {
    const tid = String(event.threadID || event.threadId || '');
    const action = (args[0] || '').toLowerCase();

    // 1. List available themes
    if (!action || action === 'list' || action === 'all') {
      const themes = (api && typeof api.getChatThemes === 'function')
        ? api.getChatThemes()
        : VERIFIED_THEMES;

      const sample = themes.slice(0, 15);
      let listText =
        `🎨 𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌 𝐂𝐇𝐀𝐓 𝐓𝐇𝐄𝐌𝐄𝐒 (${themes.length} Available)\n` +
        `─`.repeat(28) + `\n`;

      sample.forEach(t => {
        listText += `• **${t.name}** (ID: \`${t.id}\`)\n`;
      });

      listText +=
        `─`.repeat(28) + `\n` +
        `💡 To apply: *theme <name_or_id>\n` +
        `🔍 To search: *theme search <query>\n` +
        `🔄 To reset: *theme reset`;

      return message?.reply ? message.reply(listText) : api.sendMessage(listText, tid, undefined, event.messageID);
    }

    // 2. Search themes
    if (action === 'search' || action === 'find') {
      const query = args.slice(1).join(' ').trim();
      if (!query) {
        const err = '❌ Please enter a search query: *theme search <keyword>';
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }

      const matches = searchThemes(query);
      if (matches.length === 0) {
        const err = `❌ No themes found matching "${query}". Use *theme list to view all themes.`;
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }

      let res = `🔍 𝐌𝐀𝐓𝐂𝐇𝐈𝐍𝐆 𝐓𝐇𝐄𝐌𝐄𝐒 (${matches.length})\n` + '─'.repeat(26) + '\n';
      matches.slice(0, 8).forEach(t => {
        res += `• **${t.name}** (ID: \`${t.id}\`)\n`;
      });
      res += '─'.repeat(26) + '\n💡 Apply with: *theme ' + matches[0].name.toLowerCase();

      return message?.reply ? message.reply(res) : api.sendMessage(res, tid, undefined, event.messageID);
    }

    // 3. Reset theme
    if (action === 'reset' || action === 'default') {
      try {
        if (api && typeof api.resetChatTheme === 'function') {
          await api.resetChatTheme(tid);
        } else if (api && typeof api.changeThreadColor === 'function') {
          await api.changeThreadColor('0', tid);
        }
        const text = '🔄 Chat theme has been reset to default!';
        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      } catch (err) {
        const text = `❌ Failed to reset chat theme: ${err.message}`;
        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      }
    }

    // 4. Set theme
    const themeTarget = args.join(' ').trim();
    const resolved = resolveTheme(themeTarget) || (api && typeof api.resolveTheme === 'function' ? api.resolveTheme(themeTarget) : null) || { id: themeTarget, name: themeTarget };

    if (!resolved) {
      const err = `❌ Unknown theme "${themeTarget}". Use *theme list or *theme search to find valid themes.`;
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    try {
      if (api && typeof api.setChatTheme === 'function') {
        await api.setChatTheme(tid, resolved.id);
      } else if (api && typeof api.changeThreadColor === 'function') {
        await api.changeThreadColor(resolved.id, tid);
      }

      const text =
        `🎨 𝐂𝐇𝐀𝐓 𝐓𝐇𝐄𝐌𝐄 𝐔𝐏𝐃𝐀𝐓𝐄𝐃\n` +
        `─`.repeat(26) + `\n` +
        `✨ Theme:   **${resolved.name}**\n` +
        `🆔 ID:      \`${resolved.id}\`\n` +
        `─`.repeat(26) + `\n` +
        `Applied to this Instagram Direct conversation!`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } catch (err) {
      const text = `❌ Failed to set chat theme: ${err.message}`;
      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    }
  }
};
