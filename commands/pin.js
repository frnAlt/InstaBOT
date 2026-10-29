'use strict';

/**
 * Pin & Unpin Command - Pin important messages in Instagram Direct threads
 */

module.exports = {
  config: {
    name: 'pin',
    aliases: ['unpin', 'pinmsg'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 2,
    role: 1, // requires admin/operator in threads
    category: 'moderation',
    description: 'Pin or unpin a message in the current Instagram Direct conversation',
    usage: 'pin (as reply to message) | pin unpin (as reply)'
  },

  async run({ api, event, args, message }) {
    const tid = String(event.threadID || event.threadId || '');

    if (!event.messageReply || !event.messageReply.messageID) {
      const err = '📌 Please reply to the message you want to pin or unpin with *pin or *pin unpin!';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    const targetMsgID = String(event.messageReply.messageID);
    const isUnpin = (args[0] || '').toLowerCase() === 'unpin' || (args[0] || '').toLowerCase() === 'remove';

    if (!api || typeof api.pinMessage !== 'function') {
      const err = '❌ Pinning messages is not supported on this adapter.';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    try {
      if (isUnpin) {
        await api.unpinMessage(tid, targetMsgID);
        const text = '📌 Message has been unpinned from this conversation.';
        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      }

      await api.pinMessage(tid, targetMsgID);
      const text = '📌 Message has been pinned to the top of this conversation!';
      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } catch (err) {
      const errText = `❌ Failed to update pinned message: ${err.message}`;
      return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
    }
  }
};
