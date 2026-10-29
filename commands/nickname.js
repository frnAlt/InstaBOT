'use strict';

/**
 * Nickname Command - View and set member nicknames in Instagram Direct threads
 */

module.exports = {
  config: {
    name: 'nickname',
    aliases: ['nick', 'setnick'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 3,
    role: 0,
    category: 'instagram',
    description: 'View, set, or reset nicknames in this Instagram Direct conversation',
    usage: 'nickname [list | @user <name> | clear @user]'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = String(event.threadID || event.threadId || '');
    const senderID = String(event.senderID || event.author || '');

    if (!api || typeof api.getNicknames !== 'function') {
      const err = '❌ Nicknames API is not supported on this adapter.';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    // 1. List nicknames
    if (!args[0] || args[0].toLowerCase() === 'list') {
      try {
        const nicks = await api.getNicknames(tid);
        const entries = Object.entries(nicks || {});

        if (entries.length === 0) {
          const empty = 'ℹ️ No custom nicknames have been set in this conversation.';
          return message?.reply ? message.reply(empty) : api.sendMessage(empty, tid, undefined, event.messageID);
        }

        let listText = `🏷️ 𝐂𝐔𝐒𝐓𝐎𝐌 𝐍𝐈𝐂𝐊𝐍𝐀𝐌𝐄𝐒\n` + `─`.repeat(26) + `\n`;
        for (const [uid, nick] of entries) {
          let name = `User ${uid}`;
          if (usersData && typeof usersData.getName === 'function') {
            name = await usersData.getName(uid);
          }
          listText += `• **${name}**: "${nick}"\n`;
        }
        listText += `─`.repeat(26) + `\n💡 Set with: *nickname @user <new_name>`;

        return message?.reply ? message.reply(listText) : api.sendMessage(listText, tid, undefined, event.messageID);
      } catch (err) {
        const errText = `❌ Failed to retrieve nicknames: ${err.message}`;
        return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
      }
    }

    // 2. Clear nickname
    if (args[0].toLowerCase() === 'clear' || args[0].toLowerCase() === 'reset') {
      let targetID = null;
      if (event.messageReply && event.messageReply.senderID) {
        targetID = String(event.messageReply.senderID);
      } else if (args[1]) {
        targetID = args[1].replace(/[@<>]/g, '').trim();
      } else {
        targetID = senderID;
      }

      try {
        if (typeof api.clearNickname === 'function') {
          await api.clearNickname(tid, targetID);
        } else {
          await api.setNickname(tid, targetID, '');
        }

        const confirm = '🏷️ Nickname has been cleared.';
        return message?.reply ? message.reply(confirm) : api.sendMessage(confirm, tid, undefined, event.messageID);
      } catch (err) {
        const errText = `❌ Failed to clear nickname: ${err.message}`;
        return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
      }
    }

    // 3. Set nickname
    let targetID = null;
    let newNick = '';

    if (event.messageReply && event.messageReply.senderID) {
      targetID = String(event.messageReply.senderID);
      newNick = args.join(' ').trim();
    } else if (args[0] && (/^\d+$/.test(args[0].replace(/[@<>]/g, '')) || args[0].startsWith('@'))) {
      targetID = args[0].replace(/[@<>]/g, '').trim();
      newNick = args.slice(1).join(' ').trim();
    } else {
      // Setting own nickname
      targetID = senderID;
      newNick = args.join(' ').trim();
    }

    if (!newNick) {
      const err = '❌ Please specify the new nickname: *nickname @user <new_name>';
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    try {
      await api.setNickname(tid, targetID, newNick);
      let targetName = `User ${targetID}`;
      if (usersData && typeof usersData.getName === 'function') {
        targetName = await usersData.getName(targetID);
      }

      const text =
        `🏷️ 𝐍𝐈𝐂𝐊𝐍𝐀𝐌𝐄 𝐔𝐏𝐃𝐀𝐓𝐄𝐃\n` +
        `─`.repeat(26) + `\n` +
        `👤 User:     ${targetName}\n` +
        `✨ Nickname: "${newNick}"\n` +
        `─`.repeat(26);

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } catch (err) {
      const errText = `❌ Failed to update nickname: ${err.message}`;
      return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
    }
  }
};
