module.exports = {
  config: {
    name: 'uid',
    aliases: ['userid', 'getuid', 'id'],
    description: 'Get Instagram User ID from username',
    usage: 'uid [username | @username | reply | @tag]',
    cooldown: 5,
    role: 0,
    author: 'Gtajisan && frnAlt',
    category: 'utility'
  },

  async run({ api, event, args, logger, message }) {
    try {
      let targetInput = null;
      let isUid = false;

      if (args.length > 0) {
        targetInput = args[0].replace(/^@+/, '').trim();
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetInput = Object.keys(event.mentions)[0];
        isUid = true;
      } else if (event.replyToItemId) {
        const reply = event.messageReply || {};
        const replySender = reply.senderID || reply.senderId;
        if (replySender) {
          targetInput = replySender;
          isUid = true;
        }
      }

      if (!targetInput) {
        targetInput = event.senderID;
        isUid = true;
      }

      if (!isUid && /^\d+$/.test(targetInput)) {
        isUid = true;
      }

      if (isUid) {
        return message.reply(String(targetInput));
      }

      const userInfo = await api.getUserInfoByUsername(targetInput);
      if (!userInfo) {
        return message.reply(`❌ User @${targetInput} not found!`);
      }

      const userId = userInfo.userID || userInfo.userId || userInfo.pk;
      if (!userId) {
        return message.reply(`❌ Could not resolve User ID for @${targetInput}.`);
      }

      return message.reply(String(userId));

    } catch (error) {
      logger.error('Error in uid command', { error: error.message });
      return message.reply(`❌ Error: ${error.message}`);
    }
  }
};
