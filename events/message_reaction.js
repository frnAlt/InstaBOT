const logger = require('../utils/logger');
const PermissionManager = require('../utils/permissions');
const database = require('../utils/database');

const UNSEND_EMOJIS = ['😠', '😡', '❌', '🗑️', '👎'];
const REPLAY_EMOJIS = ['🔁', '🔄', '💬', '🗣️', '🔊', '▶️'];

module.exports = {
  config: { name: 'message_reaction', description: 'Handle message reactions including tap-to-replay and reaction unsend' },
  async run(bot, event = {}) {
    try {
      if (!event || typeof event !== 'object') return;
      const { senderID, threadId, reaction, targetMessageId, reactionStatus, messageID } = event;
      if (!reaction || reactionStatus === 'deleted') return;

      const targetId = messageID || targetMessageId;
      const reactionData = database.getReactionData(targetId) || (global.GoatBot?.onReaction?.get ? global.GoatBot.onReaction.get(String(targetId)) : null);
      if (reactionData && reactionData.commandName) {
          const command = bot.commandLoader.getCommand(reactionData.commandName);
          if (command) {
              const reactionParams = {
                  api: bot.api,
                  event,
                  args: [],
                  bot,
                  commandName: reactionData.commandName,
                  logger,
                  database,
                  usersData: database.usersData,
                  threadsData: database.threadsData,
                  Reaction: reactionData,
                  reactionData,
                  getLang: (...args) => require('../utils.js').getText(reactionData.commandName, ...args),
                  message: {
                      reply: (form, callback) => bot.api.sendMessage(form, threadId, callback, messageID || targetMessageId),
                      send: (form, callback) => bot.api.sendMessage(form, threadId, callback),
                      reaction: (emoji, mID, callback) => bot.api.setMessageReaction(emoji, mID || messageID || targetMessageId, callback),
                      unsend: (mID, callback) => bot.api.unsendMessage(mID || messageID || targetMessageId, callback),
                      err: async (err) => {
                          const msg = typeof err === 'object' ? err.message || JSON.stringify(err) : String(err);
                          return await bot.api.sendMessage(`❌ Error: ${msg}`, threadId);
                      }
                  }
              };
              if (typeof command.onReaction === 'function') await command.onReaction(reactionParams);
              else if (typeof command.handleReaction === 'function') await command.handleReaction(reactionParams);
          }
      }

      // Tap-to-replay user message feature
      if (REPLAY_EMOJIS.includes(reaction)) {
        try {
          let targetText = '';
          const threadInfo = await bot.api.getThreadHistory(threadId, 20).catch(() => []);
          const matchedMsg = (threadInfo || []).find(m => String(m.messageID || m.item_id || m.id) === String(targetMessageId));
          if (matchedMsg) {
            targetText = matchedMsg.body || matchedMsg.text || '';
          }

          if (targetText) {
            if (['🗣️', '🔊'].includes(reaction)) {
              // Convert text to voice replay
              const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(targetText.slice(0, 200))}`;
              await bot.api.sendVoiceFromUrl(threadId, ttsUrl).catch(() => {
                bot.api.sendMessage(`🎙️ Replay: "${targetText}"`, threadId);
              });
            } else {
              // Replay text message
              await bot.api.sendMessage(`🔁 Replay:\n"${targetText}"`, threadId, null, targetMessageId);
            }
            logger.info('Message replayed via reaction tap', { senderID, threadId, targetMessageId });
            return;
          }
        } catch (err) {
          logger.error('Error in tap-to-replay reaction', { error: err.message });
        }
      }

      // Reaction unsend feature
      if (UNSEND_EMOJIS.includes(reaction)) {
        const msgs = database.getAllSentMessages(threadId);
        if (msgs.some(m => String(m.itemId || m.messageID) === String(targetMessageId))) {
          await bot.api.unsendMessage(targetMessageId, threadId).catch(() => {});
          database.removeSentMessage(threadId, targetMessageId);
          logger.info('Message unsent via reaction', { senderID, threadId, targetMessageId });
        }
      }
    } catch (e) { logger.error('Error in message_reaction event', { error: e.message }); }
  }
};
