'use strict';

/**
 * Follow & Friendship Command
 * Follow, unfollow, and inspect friendship status on Instagram
 */

module.exports = {
  config: {
    name: 'follow',
    aliases: ['friendship', 'unfollow'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 4,
    role: 0,
    category: 'instagram',
    description: 'Follow, unfollow, or check friendship status for an Instagram user',
    usage: 'follow [status | unfollow] <@user | uid>'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = event.threadID || event.threadId;

    if (!api || typeof api.follow !== 'function') {
      const err = '❌ Friendship operations are not supported on this adapter.';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    const firstArg = (args[0] || '').toLowerCase();
    let action = 'follow';
    let targetArg = args[0];

    if (firstArg === 'status' || firstArg === 'check') {
      action = 'status';
      targetArg = args[1];
    } else if (firstArg === 'unfollow' || firstArg === 'un') {
      action = 'unfollow';
      targetArg = args[1];
    }

    let targetID = null;
    if (event.messageReply && event.messageReply.senderID) {
      targetID = String(event.messageReply.senderID);
    } else if (targetArg) {
      targetID = targetArg.replace(/[@<>]/g, '').trim();
    }

    if (!targetID) {
      const err =
        `👥 𝐅𝐎𝐋𝐋𝐎𝐖 & 𝐅𝐑𝐈𝐄𝐍𝐃𝐒𝐇𝐈𝐏\n` +
        `─`.repeat(26) + `\n` +
        `Usage:\n` +
        `• *follow <uid | @user> - Follow a user\n` +
        `• *follow unfollow <uid | @user> - Unfollow a user\n` +
        `• *follow status <uid | @user> - Check friendship status\n` +
        `─`.repeat(26);
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    let targetName = `User ${targetID}`;
    if (usersData && typeof usersData.getName === 'function') {
      targetName = await usersData.getName(targetID);
    }

    try {
      if (action === 'status') {
        const status = await api.checkFriendship(targetID);
        const following = status.following ? '✅ Yes' : '❌ No';
        const followedBy = status.followed_by ? '✅ Yes' : '❌ No';
        const incoming = status.incoming_request ? '⏳ Pending' : 'None';
        const outgoing = status.outgoing_request ? '⏳ Requested' : 'None';
        const blocking = status.blocking ? '🚫 Blocked' : 'Normal';

        const text =
          `👥 𝐅𝐑𝐈𝐄𝐍𝐃𝐒𝐇𝐈𝐏 𝐒𝐓𝐀𝐓𝐔𝐒\n` +
          `👤 Target:        ${targetName} (\`${targetID}\`)\n` +
          `─`.repeat(26) + `\n` +
          `➡️ You Follow:     ${following}\n` +
          `⬅️ Follows You:    ${followedBy}\n` +
          `📬 Request Sent:   ${outgoing}\n` +
          `📭 Request Recv:   ${incoming}\n` +
          `🛡️ Moderation:     ${blocking}\n` +
          `─`.repeat(26);

        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      }

      if (action === 'unfollow') {
        await api.unfollow(targetID);
        const text = `👋 Unfollowed **${targetName}** (\`${targetID}\`).`;
        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      }

      // Default: Follow
      await api.follow(targetID);
      const text = `🤝 Now following **${targetName}** (\`${targetID}\`)!`;
      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } catch (err) {
      const errText = `❌ Action failed: ${err.message}`;
      return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
    }
  }
};
