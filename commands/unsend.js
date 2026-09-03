module.exports = {
  config: {
    name: "unsend",
    aliases: ["u", "un", "del", "delete", "unsent", "unsendall"],
    version: "2.0",
    author: "NTKhang, Gtajisan && frnAlt",
    cooldown: 1,
    role: 0,
    description: "Unsend bot's message or multiple messages in thread",
    category: "utility",
    usage: "{pn} | {pn} all | {pn} <count> | reply to a message"
  },

  async onStart({ message, event, api, args, database }) {
    const threadID = event.threadId || event.threadID;

    // Check if command is 'all' or 'unsendall'
    const isAll = (args[0] && (args[0].toLowerCase() === 'all' || args[0].toLowerCase() === 'every')) || (event.body && event.body.toLowerCase().includes('unsendall'));
    const countArg = args[0] ? parseInt(args[0], 10) : null;

    if (isAll || (countArg && !isNaN(countArg) && countArg > 0)) {
      const limit = isAll ? 20 : Math.min(countArg, 20);
      const sentMsgs = database.getAllSentMessages ? database.getAllSentMessages(threadID) : [];
      if (!sentMsgs || sentMsgs.length === 0) {
        return message.reply('ℹ️ No recent bot messages found to unsend.');
      }

      let count = 0;
      const msgsToUnsend = sentMsgs.slice(-limit).reverse();
      for (const m of msgsToUnsend) {
        const mID = m.itemId || m.messageID || m.messageId || m;
        if (mID) {
          const ok = await api.unsendMessage(mID, threadID).catch(() => false);
          if (ok !== false) {
            count++;
            database.removeSentMessage(threadID, mID);
          }
        }
      }
      return message.reply(`🗑️ Unsourced/unsent ${count} recent message(s).`);
    }

    let targetID = null;
    if (event.messageReply) {
      targetID = event.messageReply.messageID || event.messageReply.messageId || event.messageReply.item_id;
    } else if (event.replyToItemId) {
      targetID = event.replyToItemId;
    }

    if (!targetID) {
      const last = database.getLastSentMessage(threadID);
      if (last) {
        targetID = last.itemId || last.messageID || last.messageId;
      }
    }

    if (!targetID) {
      return message.reply('ℹ️ No recent bot message to unsend. Reply to a message to unsend it.');
    }

    try {
      const res = await api.unsendMessage(targetID, threadID);
      if (res !== false) {
        database.removeSentMessage(threadID, targetID);
        api.setMessageReaction('✅', event.messageID, () => {}, true);
      } else {
        message.reply('⚠️ Could not unsend that message (it may be too old or already deleted).');
      }
    } catch (_) {
      message.reply('⚠️ Could not unsend message.');
    }
  }
};