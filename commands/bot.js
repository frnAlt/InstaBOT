const config = require('../config');

module.exports = {
  config: {
    name: 'bot',
    aliases: ['botcontrol', 'botmode', 'togglebot'],
    version: '2.0',
    author: 'Jisan && frnAlt',
    cooldown: 3,
    role: 0,
    category: 'config',
    description: 'Turn bot ON/OFF or toggle admin-only mode for this chat or globally',
    usage: 'bot [on | off | autotalk on/off | status | global on/off]'
  },

  async onStart({ message, event, args, database, PermissionManager, bot, api }) {
    const threadID = event.threadId || event.threadID;
    const uid = event.senderID;
    const threadData = database.getThreadData(threadID) || {};
    if (!threadData.settings) threadData.settings = {};

    const threadInfo = await (api?.getThreadInfo ? api.getThreadInfo(threadID) : (bot?.getThreadInfo ? bot.getThreadInfo(threadID) : null)).catch(() => null);
    const hasAdminPerm = await PermissionManager.hasPermission(uid, 2, threadInfo);

    const subCmd = args[0] ? args[0].toLowerCase() : 'status';

    // Global toggle (Developer / Super Admin only - role >= 4)
    if (subCmd === 'global') {
      if (PermissionManager.getUserRole(uid) < 4) {
        return message.reply('🔒 Only Bot Developers can toggle global bot status.');
      }
      const gMode = args[1] ? args[1].toLowerCase() : null;
      if (gMode === 'off' || gMode === 'disable' || gMode === 'admin') {
        config.ADMIN_ONLY_ENABLE = true;
        return message.reply('🔒 Global Bot Status: DISABLED for non-admins (Admin-Only mode activated globally).');
      }
      if (gMode === 'on' || gMode === 'enable') {
        config.ADMIN_ONLY_ENABLE = false;
        return message.reply('✅ Global Bot Status: ENABLED globally for all users.');
      }
      return message.reply(`🌐 Global Bot Mode: ${config.ADMIN_ONLY_ENABLE ? 'ADMIN-ONLY 🔒' : 'PUBLIC ✅'}\nUsage: !bot global [on | off]`);
    }

    // Turn Bot OFF for non-admins (Admin-Only mode for this chat)
    if (subCmd === 'off' || subCmd === 'disable' || subCmd === 'admin' || subCmd === 'adminonly') {
      if (!hasAdminPerm) {
        return message.reply('❌ Access Denied! Only Chat/Bot Admins can turn the bot OFF.');
      }
      threadData.settings.adminOnly = true;
      threadData.settings.botOff = true;
      database.setThreadData(threadID, threadData);
      database.save();
      return message.reply('🔒 Bot has been turned OFF for non-admins in this chat!\nOnly Bot Admins can use commands now.');
    }

    // Turn Bot ON for everyone in this chat
    if (subCmd === 'on' || subCmd === 'enable') {
      if (!hasAdminPerm) {
        return message.reply('❌ Access Denied! Only Chat/Bot Admins can turn the bot ON.');
      }
      threadData.settings.adminOnly = false;
      threadData.settings.botOff = false;
      database.setThreadData(threadID, threadData);
      database.save();
      return message.reply('✅ Bot has been turned ON for all users in this chat!');
    }

    // Toggle Auto-Talk
    if (subCmd === 'autotalk' || subCmd === 'talk' || subCmd === 'atalk') {
      const mode = args[1] ? args[1].toLowerCase() : null;
      if (mode === 'on' || mode === 'enable') {
        if (!hasAdminPerm) return message.reply('❌ Only Admins can enable auto-talk.');
        threadData.settings.autotalk = true;
        database.setThreadData(threadID, threadData);
        database.save();
        return message.reply('🗣️ Auto-Talk Chatbot has been ENABLED for this chat!');
      }
      if (mode === 'off' || mode === 'disable') {
        if (!hasAdminPerm) return message.reply('❌ Only Admins can disable auto-talk.');
        threadData.settings.autotalk = false;
        database.setThreadData(threadID, threadData);
        database.save();
        return message.reply('🔇 Auto-Talk Chatbot has been DISABLED for this chat.');
      }
      const atState = threadData.settings.autotalk === true;
      return message.reply(`🗣️ Auto-Talk Status: ${atState ? 'ENABLED ✅' : 'DISABLED ❌'}\nUsage: !bot autotalk [on | off]`);
    }

    // Show Bot Status for this thread
    const isBotOff = threadData.settings.adminOnly === true || threadData.settings.botOff === true;
    const isGlobalOff = config.ADMIN_ONLY_ENABLE === true;
    const autoTalkState = threadData.settings.autotalk === true;

    let statusMsg = `🤖 Bot Status Control Panel\n\n`;
    statusMsg += `📍 Chat Bot Status: ${isBotOff ? 'OFF 🔒 (Admin Only)' : 'ON ✅ (Public)'}\n`;
    statusMsg += `🌐 Global Status: ${isGlobalOff ? 'ADMIN ONLY 🔒' : 'ACTIVE ✅'}\n`;
    statusMsg += `🗣️ Auto-Talk AI: ${autoTalkState ? 'ON ✅' : 'OFF ❌'}\n\n`;
    statusMsg += `🛠️ Admin Usage:\n`;
    statusMsg += `• !bot off - Turn bot OFF for non-admins\n`;
    statusMsg += `• !bot on - Turn bot ON for everyone\n`;
    statusMsg += `• !bot autotalk [on|off] - Toggle AI chat auto-talk\n`;
    statusMsg += `• !bot global [on|off] - Global developer bot toggle`;

    return message.reply(statusMsg);
  }
};
