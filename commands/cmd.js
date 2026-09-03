const fs   = require('fs-extra');
const path = require('path');
const axios = require('axios');

const CMDS_DIR = path.resolve(__dirname, '../commands');

// ── Helpers ───────────────────────────────────────────────────────────────

function isURL(str) {
  try { new URL(str); return true; } catch { return false; }
}

function getDomain(url) {
  const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im);
  return match ? match[1] : null;
}

/** Normalise a GitHub or Pastebin URL to a raw-content URL */
function toRawURL(url) {
  const domain = getDomain(url);
  if (domain === 'pastebin.com') {
    url = url.replace(/\/$/, '');
    url = url.replace(/https:\/\/pastebin\.com\/(?!raw\/)(.*)/, 'https://pastebin.com/raw/$1');
  } else if (domain === 'github.com') {
    url = url.replace(
      /https:\/\/github\.com\/(.*)\/blob\/(.*)/,
      'https://raw.githubusercontent.com/$1/$2'
    );
  }
  return url;
}

/**
 * Load (or reload) a single command file into the commandLoader.
 * Returns { success, name, error? }
 */
function loadCommandFile(commandLoader, fileName) {
  try {
    const filePath = path.join(CMDS_DIR, fileName.endsWith('.js') ? fileName : `${fileName}.js`);

    if (!fs.existsSync(filePath)) {
      return { success: false, name: fileName, error: new Error(`File not found: ${filePath}`) };
    }

    // Clear require cache so hot-reload works
    delete require.cache[require.resolve(filePath)];
    const mod = require(filePath);

    if (!mod.config || !mod.config.name) {
      return { success: false, name: fileName, error: new Error('Missing config.name in module') };
    }

    // Register command (and aliases)
    commandLoader.commands.set(mod.config.name, mod);
    if (Array.isArray(mod.config.aliases)) {
      mod.config.aliases.forEach(alias => commandLoader.commands.set(alias, mod));
    }

    return { success: true, name: mod.config.name };
  } catch (err) {
    return { success: false, name: fileName, error: err };
  }
}

/**
 * Unload a command by name or alias.
 * Returns { success, name, error? }
 */
function unloadCommand(commandLoader, nameOrAlias) {
  const mod = commandLoader.getCommand(nameOrAlias);
  if (!mod) {
    return { success: false, name: nameOrAlias, error: new Error('Command not found') };
  }

  const cmdName = mod.config.name;

  // Remove main entry and all aliases from the Map
  commandLoader.commands.delete(cmdName);
  if (Array.isArray(mod.config.aliases)) {
    mod.config.aliases.forEach(alias => commandLoader.commands.delete(alias));
  }

  // Clear require cache
  const filePath = path.join(CMDS_DIR, `${cmdName}.js`);
  if (require.cache[require.resolve(filePath)]) {
    delete require.cache[require.resolve(filePath)];
  }

  return { success: true, name: cmdName };
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  config: {
    name: 'cmd',
    version: '1.0',
    author: 'NeoKEX && frnAlt',
    description: 'Manage bot command files — load, unload, reload, install',
    usage: 'cmd <load|loadAll|unload|install> [args]',
    cooldown: 5,
    role: 2,
    category: 'owner',
    aliases: ['command']
  },

  async run({ api, event, args, bot, logger }) {
    const { commandLoader } = bot;
    const sub = (args[0] || '').toLowerCase();

    // ── load <filename> ──────────────────────────────────────────────────
    if (sub === 'load') {
      const fileName = args[1];
      if (!fileName) {
        return api.sendMessage('⚠️ Usage: cmd load <filename.js>', event.threadId);
      }

      const result = loadCommandFile(commandLoader, fileName);
      if (result.success) {
        return api.sendMessage(`✅ Command "${result.name}" loaded successfully.`, event.threadId);
      } else {
        return api.sendMessage(
          `❌ Failed to load "${fileName}"\n${result.error.name}: ${result.error.message}`,
          event.threadId
        );
      }
    }

    // ── loadAll ───────────────────────────────────────────────────────────
    if (sub === 'loadall') {
      const files = fs.readdirSync(CMDS_DIR).filter(f => f.endsWith('.js'));
      const success = [];
      const failed  = [];

      for (const file of files) {
        const result = loadCommandFile(commandLoader, file);
        if (result.success) success.push(result.name);
        else failed.push(`  ✗ ${file} — ${result.error.message}`);
      }

      let msg = '';
      if (success.length) msg += `✅ Loaded (${success.length}): ${success.join(', ')}`;
      if (failed.length)  msg += `${msg ? '\n\n' : ''}❌ Failed (${failed.length}):\n${failed.join('\n')}`;
      return api.sendMessage(msg || 'No command files found.', event.threadId);
    }

    // ── unload <name> ─────────────────────────────────────────────────────
    if (sub === 'unload') {
      const name = args[1];
      if (!name) {
        return api.sendMessage('⚠️ Usage: cmd unload <command name>', event.threadId);
      }

      const result = unloadCommand(commandLoader, name);
      if (result.success) {
        return api.sendMessage(`✅ Command "${result.name}" unloaded successfully.`, event.threadId);
      } else {
        return api.sendMessage(
          `❌ Failed to unload "${name}"\n${result.error.message}`,
          event.threadId
        );
      }
    }

    // ── install <url | code> <filename.js> ────────────────────────────────
    if (sub === 'install') {
      let urlOrCode = args[1];
      let fileName  = args[2];

      if (!urlOrCode) {
        return api.sendMessage(
          '⚠️ Usage:\n' +
          '  cmd install <url> <filename.js>\n' +
          '  cmd install <filename.js> <raw code>',
          event.threadId
        );
      }

      let rawCode;

      if (isURL(urlOrCode)) {
        // ── URL install ────────────────────────────────────────────────
        if (!fileName || !fileName.endsWith('.js')) {
          return api.sendMessage('⚠️ Please provide a filename ending in .js', event.threadId);
        }

        const rawURL = toRawURL(urlOrCode);
        try {
          const res = await axios.get(rawURL, { timeout: 10000 });
          rawCode = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        } catch (err) {
          return api.sendMessage(`❌ Failed to download from URL:\n${err.message}`, event.threadId);
        }
      } else {
        // ── Inline code install ────────────────────────────────────────
        // Expect: cmd install <filename.js> <...code...>
        // OR:     cmd install <...code...> <filename.js>
        if (urlOrCode.endsWith('.js') && !isURL(urlOrCode)) {
          fileName = urlOrCode;
          // Everything after "install <filename>" is the code
          const bodyAfterSub = event.body.slice(event.body.toLowerCase().indexOf('install') + 7).trim();
          rawCode = bodyAfterSub.slice(fileName.length).trim();
        } else if (fileName && fileName.endsWith('.js')) {
          const bodyAfterSub = event.body.slice(event.body.toLowerCase().indexOf('install') + 7).trim();
          rawCode = bodyAfterSub.slice(0, bodyAfterSub.lastIndexOf(fileName)).trim();
        } else {
          return api.sendMessage(
            '⚠️ Please include a filename ending in .js\n' +
            'Usage: cmd install <filename.js> <code>',
            event.threadId
          );
        }
      }

      if (!rawCode || !rawCode.trim()) {
        return api.sendMessage('❌ No command code found to install.', event.threadId);
      }

      const destPath = path.join(CMDS_DIR, fileName);

      if (fs.existsSync(destPath)) {
        return api.sendMessage(
          `⚠️ File "${fileName}" already exists.\n` +
          `Use: cmd load ${fileName} to reload it, or delete it first then install again.`,
          event.threadId
        );
      }

      try {
        fs.writeFileSync(destPath, rawCode, 'utf-8');
      } catch (err) {
        return api.sendMessage(`❌ Failed to write file:\n${err.message}`, event.threadId);
      }

      const result = loadCommandFile(commandLoader, fileName);
      if (result.success) {
        return api.sendMessage(
          `✅ Command "${result.name}" installed and loaded successfully.\n📁 Saved to: commands/${fileName}`,
          event.threadId
        );
      } else {
        // Write succeeded but load failed — keep the file for debugging
        return api.sendMessage(
          `⚠️ File saved to commands/${fileName} but failed to load:\n` +
          `${result.error.name}: ${result.error.message}`,
          event.threadId
        );
      }
    }

    // ── No valid subcommand ───────────────────────────────────────────────
    return api.sendMessage(
      `⚠️ Unknown subcommand: "${args[0] || ''}"\n\n` +
      `Available subcommands:\n` +
      `  cmd load <filename.js>\n` +
      `  cmd loadAll\n` +
      `  cmd unload <command name>\n` +
      `  cmd install <url> <filename.js>\n` +
      `  cmd install <filename.js> <raw code>`,
      event.threadId
    );
  }
};
