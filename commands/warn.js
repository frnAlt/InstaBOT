module.exports = {
  config: {
    name: 'warn',
    aliases: ['warns', 'resetwarn', 'unwarn'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 3,
    role: 1, // Admin or Thread Admin
    category: 'Group',
    description: 'Rose-bot style user warning system (Auto-kick at 3 warnings)',
    usage: 'warn @user <reason> | warns @user | resetwarn @user'
  },

  onStart: async function ({ api, event, args, message, database }) {
    const threadID = event.threadId || event.threadID;
    const commandUsed = event.body.trim().split(/ +/)[0].slice(1).toLowerCase();

    // Determine target user
    let targetID = null;
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.messageReply && event.messageReply.senderID) {
      targetID = event.messageReply.senderID;
    } else if (args[0] && /^\d+$/.test(args[0])) {
      targetID = args[0];
    }

    const threadData = database.getThreadData(threadID) || {};
    if (!threadData.warns) threadData.warns = {};

    // View warnings (!warns)
    if (commandUsed === 'warns' || args[0] === 'list') {
      if (!targetID) targetID = event.senderID;
      const userWarns = threadData.warns[targetID] || [];
      if (userWarns.length === 0) {
        return message.reply(`ℹ️ User ${targetID} has 0 warnings.`);
      }
      let warnMsg = `⚠️ **Warnings for User ${targetID} (${userWarns.length}/3):**\n\n`;
      userWarns.forEach((w, idx) => {
        warnMsg += `${idx + 1}. Reason: ${w.reason} (By: ${w.warnedBy})\n`;
      });
      return message.reply(warnMsg);
    }

    // Reset warnings (!resetwarn / !unwarn)
    if (commandUsed === 'resetwarn' || commandUsed === 'unwarn') {
      if (!targetID) return message.reply('❌ Please mention or reply to the user whose warnings you want to reset.');
      threadData.warns[targetID] = [];
      database.setThreadData(threadID, threadData);
      return message.reply(`✅ Reset all warnings for user ${targetID}.`);
    }

    // Warn user (!warn)
    if (!targetID) {
      return message.reply('❌ Please mention (@user), reply to a message, or provide userID to warn.\nExample: !warn @user Spamming in chat');
    }

    const reason = args.filter(a => !a.startsWith('@') && a !== targetID).join(' ') || 'No reason provided';

    if (!threadData.warns[targetID]) threadData.warns[targetID] = [];
    threadData.warns[targetID].push({
      reason,
      warnedBy: event.senderID,
      timestamp: Date.now()
    });

    const currentCount = threadData.warns[targetID].length;
    database.setThreadData(threadID, threadData);

    if (currentCount >= 3) {
      // Auto-kick user at 3 warnings
      try {
        await api.removeUserFromGroup(targetID, threadID);
        delete threadData.warns[targetID];
        database.setThreadData(threadID, threadData);
        return message.reply(`🚨 **AUTO-KICK**: User ${targetID} reached 3/3 warnings and has been removed from the group!\n\nReason for last warning: "${reason}"`);
      } catch (e) {
        return message.reply(`⚠️ User ${targetID} reached 3/3 warnings!\nReason: "${reason}"\n(Failed to auto-kick: ${e.message})`);
      }
    } else {
      return message.reply(`⚠️ **Warning Issued (${currentCount}/3)** to User ${targetID}!\n\nReason: "${reason}"\nReach 3 warnings will result in auto-kick.`);
    }
  }
};
