'use strict';

/**
 * Instagram Direct Notes Command
 * View, post, and manage Instagram Direct status notes
 */

module.exports = {
  config: {
    name: 'notes',
    aliases: ['note', 'ignote'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 5,
    role: 0,
    category: 'instagram',
    description: 'Post and view Instagram Direct status notes',
    usage: 'notes [view | me | post <text> | delete]'
  },

  async run({ api, event, args, message }) {
    const tid = event.threadID || event.threadId;
    const action = (args[0] || '').toLowerCase();

    if (!api || typeof api.getNotes !== 'function') {
      const err = '❌ Instagram Notes API is not available on this connection mode.';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    // 1. Post a new note
    if (action === 'post' || action === 'create' || action === 'set') {
      const text = args.slice(1).join(' ').trim();
      if (!text) {
        const err = '❌ Please enter text for your note: *notes post <your message>';
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }

      if (text.length > 60) {
        const err = '❌ Notes cannot exceed 60 characters in length.';
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }

      try {
        await api.createNote(text);
        const replyText =
          `📝 𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌 𝐍𝐎𝐓𝐄 𝐏𝐎𝐒𝐓𝐄𝐃\n` +
          `─`.repeat(26) + `\n` +
          `💬 "${text}"\n` +
          `─`.repeat(26) + `\n` +
          `✨ Your status note is now live to your followers and close friends!`;
        return message?.reply ? message.reply(replyText) : api.sendMessage(replyText, tid, undefined, event.messageID);
      } catch (err) {
        const errText = `❌ Failed to post note: ${err.message}`;
        return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
      }
    }

    // 2. View my note
    if (action === 'me' || action === 'my') {
      try {
        const myNote = await api.getMyNote();
        if (!myNote || !myNote.text) {
          const replyText = 'ℹ️ You currently do not have an active note. Post one with *notes post <text>!';
          return message?.reply ? message.reply(replyText) : api.sendMessage(replyText, tid, undefined, event.messageID);
        }

        const replyText =
          `📝 𝐘𝐎𝐔𝐑 𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐍𝐎𝐓𝐄\n` +
          `─`.repeat(26) + `\n` +
          `💬 "${myNote.text}"\n` +
          `🕒 Created: ${new Date(myNote.created_at * 1000).toLocaleString()}\n` +
          `❤️ Likes:   ${myNote.like_count || 0}\n` +
          `─`.repeat(26) + `\n` +
          `💡 Use *notes delete to remove it.`;
        return message?.reply ? message.reply(replyText) : api.sendMessage(replyText, tid, undefined, event.messageID);
      } catch (err) {
        const errText = `❌ Failed to fetch your note: ${err.message}`;
        return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
      }
    }

    // 3. Delete note
    if (action === 'delete' || action === 'remove' || action === 'del') {
      try {
        await api.deleteNote();
        const replyText = '🗑️ Your Instagram Direct note has been deleted.';
        return message?.reply ? message.reply(replyText) : api.sendMessage(replyText, tid, undefined, event.messageID);
      } catch (err) {
        const errText = `❌ Failed to delete note: ${err.message}`;
        return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
      }
    }

    // 4. View friend notes
    try {
      const notes = await api.getNotes();
      if (!Array.isArray(notes) || notes.length === 0) {
        const replyText = 'ℹ️ No active notes found from your contacts or close friends.';
        return message?.reply ? message.reply(replyText) : api.sendMessage(replyText, tid, undefined, event.messageID);
      }

      let text = `📝 𝐀𝐂𝐓𝐈𝐕𝐄 𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌 𝐍𝐎𝐓𝐄𝐒 (${notes.length})\n` + '─'.repeat(26) + '\n';
      notes.slice(0, 10).forEach(n => {
        const user = n.user?.username || n.user?.full_name || 'User';
        text += `👤 **@${user}**: "${n.text}"\n`;
      });
      text += '─'.repeat(26) + '\n💡 Post your own note with: *notes post <message>';

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } catch (err) {
      const errText = `❌ Failed to retrieve notes: ${err.message}`;
      return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
    }
  }
};
