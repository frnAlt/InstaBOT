const config = require('../config');
const logger = require('../utils/logger');
const PermissionManager = require('../utils/permissions');
const Banner = require('../utils/banner');
const database = require('../utils/database');
const moderation = require('../utils/moderation');
const ConfigManager = require('../utils/configManager');

module.exports = {
  config: { name: 'message', description: 'Handle incoming messages' },

  async run(bot, data) {
    try {
      const { api, commandLoader } = bot;
      const event = data;

      const currentBotID = bot.userID || (api && typeof api.getCurrentUserID === 'function' ? api.getCurrentUserID() : null);
      const botIDStr = (currentBotID && typeof currentBotID === 'object') ? (currentBotID.userID || currentBotID.userId || '') : String(currentBotID || '');

      if (!event || event.isSelf || (event.senderID && botIDStr && String(event.senderID) === String(botIDStr))) return;
      if (config.ANTI_INBOX && !event.isGroup) return;

      const replyApi = new Proxy(api, {
        get(target, prop) {
          if (prop === 'sendMessage') {
            return async (form, threadID, callback, replyToMessageID) => {
              const sent = await target.sendMessage(form, threadID || event.threadId, callback, replyToMessageID || event.messageID);
              if (config.AUTO_REMOVE_ERROR?.enable && sent?.messageID) {
                const body = typeof form === 'string' ? form : (form.body || '');
                const errorPrefixes = ['❌', 'Invalid', 'Could not find', '⚠️', 'Syntax Error', 'Access Denied', '⏰', 'ℹ️', '✕'];
                if (errorPrefixes.some(p => body.startsWith(p))) {
                  database.addAutoRemoveMessage(event.threadId, sent.messageID, (config.AUTO_REMOVE_ERROR.delay || 10) * 1000);
                }
              }
              return sent;
            };
          }
          return target[prop];
        }
      });

      // Automatically extract @mentions if event.mentions is empty
      if (!event.mentions || typeof event.mentions !== 'object') event.mentions = {};
      if (Object.keys(event.mentions).length === 0 && event.body) {
        const matches = event.body.match(/@([a-zA-Z0-9._]+)/g);
        if (matches) {
          for (const m of matches) {
            const username = m.slice(1);
            if (username && !event.mentions[username]) {
              event.mentions[username] = m;
            }
          }
        }
      }

      if (!config.LOG_EVENTS.disableAll && config.LOG_EVENTS.message) {
        Banner.messageReceived(event.senderID, event.body || '');
        logger.info(`Message from ${event.senderID} in ${event.threadId}: ${event.body || '(no text)'}`);
      }

      const user = database.getUser(event.senderID);
      user.messageCount = (user.messageCount || 0) + 1;

      if (!user.name || !user.username) {
        if (typeof api?.getUserInfo === 'function') {
          api.getUserInfo(event.senderID).then(infoMap => {
            const info = infoMap && (infoMap[event.senderID] || Object.values(infoMap)[0]);
            if (info) {
              user.name = info.fullName || info.full_name || info.name || '';
              user.username = info.username || '';
              user.avatarUrl = info.profilePicUrlHd || info.profile_pic_url_hd || info.profilePicUrl || '';
              database.updateUser(event.senderID, user);
              database.save();
            }
          }).catch(() => {
            database.updateUser(event.senderID, user);
          });
        } else {
          database.updateUser(event.senderID, user);
        }
      } else {
        database.updateUser(event.senderID, user);
      }

      // onFirstChat support
      if (!global.client) global.client = {};
      if (!global.client.onFirstChat) global.client.onFirstChat = new Set();
      if (!global.client.onFirstChat.has(event.threadId)) {
          global.client.onFirstChat.add(event.threadId);
          for (const [name, cmd] of bot.commandLoader.commands) {
              if (typeof cmd.onFirstChat === 'function') {
                  cmd.onFirstChat({
                      api, event, bot, database, usersData: database.usersData, threadsData: database.threadsData
                  }).catch(e => logger.error(`onFirstChat error in ${name}`, { error: e.message }));
              }
          }
      }

      // onChat support
      for (const [name, cmd] of bot.commandLoader.commands) {
          if (typeof cmd.onChat === 'function') {
              cmd.onChat({
                  api,
                  event,
                  bot,
                  database,
                  usersData: database.usersData,
                  threadsData: database.threadsData,
                  getLang: (...args) => require('../utils.js').getText(cmd.config.name, ...args)
              }).catch(e => logger.error(`onChat error in ${name}`, { error: e.message }));
          }
      }

      const modResult = await moderation.moderateMessage(event.senderID, event.threadId, event.body);
      if (!modResult.allowed) {
        if (modResult.message && !event.isGroup) await api.sendMessage(modResult.message, event.threadId);
        return;
      }

      if (!event.body || typeof event.body !== 'string') return;

      // Automatic self-training on group & direct chat conversation flow
      const textTrim = event.body.trim();
      const threadKey = String(event.threadId);
      if (!global._lastThreadMessage) global._lastThreadMessage = {};
      const prevText = global._lastThreadMessage[threadKey];

      if (prevText && prevText !== textTrim && !prevText.startsWith(config.PREFIX) && !textTrim.startsWith(config.PREFIX) && prevText.length > 2 && textTrim.length > 2) {
        if (typeof database.learnPhrasePair === 'function') {
          database.learnPhrasePair(prevText, textTrim, event.senderID);
        }
      }
      global._lastThreadMessage[threadKey] = textTrim;

      const autoResponse = database.findAutoResponse(event.body);
      if (autoResponse) { await api.sendMessage(autoResponse.response, event.threadId); return; }

      // Handle onReply & tap-to-reply
      const replyMessageID = event.replyToItemId || (event.messageReply ? (event.messageReply.messageID || event.messageReply.messageId || event.messageReply.item_id) : null);
      if (replyMessageID) {
          let replyData = database.getReplyData(replyMessageID) || (global.GoatBot.onReply && global.GoatBot.onReply.get(String(replyMessageID)));
          
          // Tap-to-reply fallback: if replying directly to a bot message, route to bby command
          const isReplyToBot = event.messageReply && botIDStr && String(event.messageReply.senderID || event.messageReply.senderId) === String(botIDStr);
          if (!replyData && isReplyToBot) {
              replyData = { commandName: 'bby', messageID: replyMessageID };
          }

          if (replyData && replyData.commandName) {
              const command = commandLoader.getCommand(replyData.commandName);
              if (command) {
                  const replyParams = {
                      api: replyApi,
                      event,
                      args: event.body ? event.body.trim().split(/ +/) : [],
                      bot,
                      commandName: replyData.commandName,
                      logger,
                      database,
                      usersData: database.usersData,
                      threadsData: database.threadsData,
                      Reply: replyData,
                      replyData,
                      getLang: (...args) => require('../utils.js').getText(replyData.commandName, ...args),
                      message: {
                          reply: (form, callback) => replyApi.sendMessage(form, event.threadId, callback, event.messageID),
                          send: (form, callback) => replyApi.sendMessage(form, event.threadId, callback),
                          reaction: (emoji, messageID, callback) => api.setMessageReaction(emoji, messageID || event.messageID, callback),
                          unsend: (messageID, callback) => api.unsendMessage(messageID || event.messageID, callback),
                          err: async (err) => {
                              const msg = typeof err === 'object' ? err.message || JSON.stringify(err) : String(err);
                              return await replyApi.sendMessage(`❌ Error: ${msg}`, event.threadId);
                          },
                          SyntaxError: async () => {
                              return await replyApi.sendMessage(`❌ Syntax Error!`, event.threadId);
                          }
                      }
                  };
                  if (typeof command.onReply === 'function') return await command.onReply(replyParams);
                  if (typeof command.handleReply === 'function') return await command.handleReply(replyParams);
              }
          }
      }

      const threadData = database.getThreadData(event.threadId);
      const prefix = threadData?.prefix || config.PREFIX;

      const bodyLower = event.body.toLowerCase().trim();
      if (bodyLower === 'prefix') {
        await api.sendMessage(`🌐 Global prefix: ${config.PREFIX}\n🛸 Thread prefix: ${prefix}`, event.threadId);
        return;
      }

      const startsWithPrefix = event.body.startsWith(prefix);
      const noPrefixAllowed  = config.NO_PREFIX && PermissionManager.canUseNoPrefix(event.senderID);

      if (!startsWithPrefix) {
        const tData = database.getThreadData(event.threadId);
        const autoTalkEnabled = tData?.settings?.autotalk === true;

        // Auto-Talk & AI Fallback for non-command chat (ONLY active if explicitly turned on per chat with !autotalk on)
        if (autoTalkEnabled && (event.body || event.isVoiceMessage)) {
          const aiCommandName = config.AI_FALLBACK?.command || 'bby';
          const aiCommand = commandLoader.getCommand(aiCommandName);
          if (aiCommand) {
            const aiText = (event.body || '').trim() || 'Hello';
            const aiArgs = aiText.split(/ +/);
            
            // If user sent a voice message, respond with voice note via Google TTS
            if (event.isVoiceMessage) {
              const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent('Hello! How can I help you today?')}`;
              return await api.sendVoiceFromUrl(event.threadId, ttsUrl).catch(() => {
                return api.sendMessage('🎙️ I received your voice note!', event.threadId);
              });
            }
            
            return await this.executeCommand(aiCommand, { api, event, args: aiArgs, bot, commandName: aiCommandName, logger, database, config, PermissionManager, ConfigManager, prefix });
          }
        }
        if (!noPrefixAllowed) return;
      }

      let rawBody = event.body;
      if (startsWithPrefix) rawBody = event.body.slice(prefix.length);
      const args = rawBody.trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (!commandName) {
        if (startsWithPrefix) await api.sendMessage(`ℹ️ Type ${prefix}help to see all commands.`, event.threadId);
        return;
      }


      const command = (commandLoader?.getCommand ? commandLoader.getCommand(commandName) : commandLoader?.commands?.get(commandName)) || null;

      if (!command) {
          // Check for aliases
          for (const [name, cmd] of commandLoader.commands) {
              if (cmd.config.aliases && cmd.config.aliases.includes(commandName)) {
                  const aliasedCommand = cmd;
                  // Found alias, continue execution with aliasedCommand
                  return await this.executeCommand(aliasedCommand, { api, event, args, bot, commandName: aliasedCommand.config.name, logger, database, config, PermissionManager, ConfigManager, prefix });
              }
          }

        if (startsWithPrefix && !config.HIDE_NOTI.commandNotFound) {
          // AI Fallback logic
          if (config.AI_FALLBACK?.enable) {
            const aiCommandName = config.AI_FALLBACK.command || 'gpt';
            const aiCommand = commandLoader.getCommand(aiCommandName);
            if (aiCommand) {
              const aiArgs = [commandName, ...args];
              return await aiCommand.run({ api, event, args: aiArgs, bot, commandName: aiCommandName, logger, database, config, PermissionManager, ConfigManager });
            }
          }

          const similar = global.utils?.findSimilarCommand 
            ? global.utils.findSimilarCommand(commandName, commandLoader?.commands || new Map())
            : this.findClosestCommand(commandName, commandLoader?.getAllCommandNames ? commandLoader.getAllCommandNames() : [])?.command;
          let msg = `❌ Unknown command: "${commandName}"\n\n`;
          if (similar) msg += `💡 Did you mean: ${prefix}${similar}?\n\n`;
          msg += `Type ${prefix}help to see all available commands.`;
          const sent = await api.sendMessage(msg, event.threadId);
          if (config.AUTO_REMOVE_ERROR?.enable && sent?.messageID) {
              database.addAutoRemoveMessage(event.threadId, sent.messageID, (config.AUTO_REMOVE_ERROR.delay || 10) * 1000);
          }
        }
        return;
      }

      await this.executeCommand(command, { api, event, args, bot, commandName, logger, database, config, PermissionManager, ConfigManager, prefix });
    } catch (e) {
      logger.error('Error in message event handler', { error: e.message, stack: e.stack });
    }
  },

  async executeCommand(command, { api, event, args, bot, commandName, logger, database, config, PermissionManager, ConfigManager, prefix }) {
      const replyApi = new Proxy(api, {
          get(target, prop) {
              if (prop === 'sendMessage') {
                  return async (form, threadID, callback, replyToMessageID) => {
                      const sent = await target.sendMessage(form, threadID || event.threadId, callback, replyToMessageID || event.messageID);
                      if (config.AUTO_REMOVE_ERROR?.enable && sent?.messageID) {
                          const body = typeof form === 'string' ? form : (form.body || '');
                          const errorPrefixes = ['❌', 'Invalid', 'Could not find', '⚠️', 'Syntax Error', 'Access Denied', '⏰', 'ℹ️', '✕'];
                          if (errorPrefixes.some(p => body.startsWith(p))) {
                              database.addAutoRemoveMessage(event.threadId, sent.messageID, (config.AUTO_REMOVE_ERROR.delay || 10) * 1000);
                          }
                      }
                      return sent;
                  };
              }
              return target[prop];
          }
      });
      const user = database.getUser(event.senderID);
      const threadData = database.getThreadData(event.threadId);
      const isThreadAdminOnly = threadData?.settings?.adminOnly === true || threadData?.settings?.botOff === true;
      const isGlobalAdminOnly = config.ADMIN_ONLY_ENABLE === true;

      if (isThreadAdminOnly || isGlobalAdminOnly) {
          const threadInfo = await bot.getThreadInfo(event.threadId).catch(() => null);
          const hasAdminPerm = await PermissionManager.hasPermission(event.senderID, 2, threadInfo);
          if (!hasAdminPerm) {
              const ignored = (config.ADMIN_ONLY_IGNORE_COMMANDS || []).map(n => n.toLowerCase());
              if (!ignored.includes(commandName)) {
                  return; // Silently ignore non-admins when bot is OFF (GoatBot V2 spec)
              }
          }
      }

      const cooldownTime = (command.config.cooldown || 0) * 1000;
      const remaining = bot.commandLoader.checkCooldown(event.senderID, command.config.name, cooldownTime);
      if (remaining > 0) {
          await replyApi.sendMessage(`⏰ Please wait ${remaining}s before using this command again.`, event.threadId);
          return;
      }

      const spamCheck = moderation.checkCommandSpam(event.senderID);
      if (spamCheck.isSpam) {
          moderation.resetSpam(event.senderID);
          if (spamCheck.message && !event.isGroup) await replyApi.sendMessage(spamCheck.message, event.threadId);
          return;
      }

      const requiredRole = command.config.role || 0;
      let threadInfo = null;
      if (requiredRole === 1) threadInfo = await bot.getThreadInfo(event.threadId).catch(() => null);
      const hasPermission = await PermissionManager.hasPermission(event.senderID, requiredRole, threadInfo);
      if (!hasPermission) {
          if (!config.HIDE_NOTI.needRoleToUseCmd) {
              await replyApi.sendMessage(`❌ Access Denied!\n\nRequires: ${PermissionManager.getRoleName(requiredRole)}`, event.threadId);
          }
          return;
      }

      try {
          Banner.commandExecuted(command.config.name, event.senderID, true);
          user.commandCount = (user.commandCount || 0) + 1;
          database.updateUser(event.senderID, user);
          database.incrementStat('totalCommands');



          const getLang = (...args) => require('../utils.js').getText(command.config.name, ...args);
          const commandParams = {
              api: replyApi,
              event,
              args,
              bot,
              commandName: command.config.name,
              logger,
              database,
              usersData: database.usersData,
              threadsData: database.threadsData,
              config,
              getLang,
              PermissionManager,
              ConfigManager,
              message: {
                  reply: (form, callback) => replyApi.sendMessage(form, event.threadId, callback, event.messageID),
                  send: (form, callback) => replyApi.sendMessage(form, event.threadId, callback),
                  reaction: (emoji, messageID, callback) => api.setMessageReaction(emoji, messageID || event.messageID, callback),
                  unsend: (messageID, callback) => api.unsendMessage(messageID || event.messageID, callback),
                  err: async (err) => {
                      const msg = typeof err === 'object' ? err.message || JSON.stringify(err) : String(err);
                      return await replyApi.sendMessage(`❌ Error: ${msg}`, event.threadId);
                  },
                  SyntaxError: async () => {
                      return await replyApi.sendMessage(`❌ Syntax Error!\nUse: ${prefix}help ${command.config.name} for usage instructions.`, event.threadId);
                  }
              }
          };

          logger.info(`Executing command: ${command.config.name} for ${event.senderID}`);
          if (bot._logActivity) {
              const u = database.getUser(event.senderID);
              const userName = u && (u.name || u.username) ? `${u.name} (@${u.username})` : event.senderID;
              bot._logActivity(`Command executed: "${prefix || '!'}${command.config.name}" by ${userName}`);
          }
          if (typeof command.onStart === 'function') {
              await command.onStart(commandParams);
          } else if (typeof command.run === 'function') {
              await command.run(commandParams);
          }
          if (cooldownTime > 0) bot.commandLoader.setCooldown(event.senderID, command.config.name, cooldownTime);
      } catch (e) {
          logger.error(`Command error: ${command.config.name}`, { error: e.message });
          Banner.commandExecuted(command.config.name, event.senderID, false);
          await replyApi.sendMessage(`❌ Error: ${e.message}`, event.threadId).catch(() => {});
      }
  },

  findClosestCommand(input, list) {
    let best = null, minD = Infinity;
    for (const c of list) {
      const d = this.levenshtein(input.toLowerCase(), c.toLowerCase());
      if (d < minD) { minD = d; best = c; }
    }
    return best ? { command: best, distance: minD } : null;
  },

  levenshtein(a, b) {
    const m = [], la = a.length, lb = b.length;
    for (let i = 0; i <= la; i++) m[i] = [i];
    for (let j = 0; j <= lb; j++) m[0][j] = j;
    for (let i = 1; i <= la; i++) for (let j = 1; j <= lb; j++)
      m[i][j] = a[i-1] === b[j-1] ? m[i-1][j-1] : Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
    return m[la][lb];
  }
};
