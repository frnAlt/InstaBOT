module.exports = {
  config: {
    name: 'ban',
    aliases: ['unban', 'blacklist'],
    description: 'Ban or unban a user from using the bot (Bot Admin only)',
    usage: 'ban <userID> | unban <userID>',
    role: 2,
    cooldown: 3,
    author: 'Gtajisan && frnAlt',
    category: 'admin'
  },

  async run({ api, event, args, commandName, database, logger, message }) {
    const targetId = args[0];

    if (!targetId || !/^\d+$/.test(targetId)) {
      return message.reply('⚠️ Please provide a valid user ID.\n\nUsage:\n• ban <userID>\n• unban <userID>');
    }

    if (commandName === 'unban' || (args[0] === 'unban' && args[1])) {
      const id = commandName === 'unban' ? targetId : args[1];
      if (!database.isBanned(id)) {
        return message.reply(`ℹ️ User ${id} is not currently banned.`);
      }
      database.unbanUser(id);
      database.save();
      logger.info(`User ${id} unbanned by ${event.senderID}`);
      return message.reply(`✅ User ${id} has been unbanned.`);
    }

    if (database.isBanned(targetId)) {
      return message.reply(`ℹ️ User ${targetId} is already banned.`);
    }

    // Don't ban self or admins
    if (targetId === api.getCurrentUserID()) return message.reply('❌ Cannot ban the bot.');

    database.banUser(targetId);
    database.save();
    logger.info(`User ${targetId} banned by ${event.senderID}`);
    return message.reply(`🚫 User ${targetId} has been banned from using the bot.`);
  }
};
