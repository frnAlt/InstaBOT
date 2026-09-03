'use strict';

/**
 * tanvir143 - Instagram Chat API xr
 *
 * Usage:
 *
 *   const { login } = require('ica-by-tanvir');
 *
 *   const api = await login(cookies);               // cookie login
 *   const api = await login(cookies, { logLevel: 'debug' });  // with options
 *   login(cookies, (err, api) => { ... });           // callback style
 *
 *   api.listen((err, event) => { ... });
 *   api.sendMessage('Hello!', threadID);
 */

const InstagramChatAPI = require('./src/instagramChat');
const CookieUtils = require('./src/utils/cookies');
const { setOptions } = require('./src/utils/setOptions');

// ─────────────────────────────────────────────────────────────────────────────
// Build the api object from an authenticated client
// ─────────────────────────────────────────────────────────────────────────────

function buildApi(client) {
  return {
    // Identity
    getCurrentUserID: () => client.getCurrentUserID(),

    // Listening
    listen:        (cb)     => client.listen(cb),
    stopListening: ()       => client.stopListening(),
    on:            (...a)   => client.on(...a),
    off:           (...a)   => client.off(...a),
    once:          (...a)   => client.once(...a),

    // Messaging
    sendMessage:       (message, threadID, cb)                    => client.sendMessage.toThread(threadID, message, cb),
    sendDirectMessage: (userID, message, cb)                      => client.sendDirectMessage(userID, message, cb),
    replyToMessage:    (threadID, message, replyToMessageID, cb)  => client.replyToMessage(threadID, message, replyToMessageID, cb),
    unsendMessage:     (messageID, cb)                            => client.unsendMessage(messageID, cb),

    // Media
    sendPhoto:        (threadID, path, opts, cb)  => client.sendPhoto(threadID, path, opts, cb),
    sendVideo:        (threadID, path, opts, cb)  => client.sendVideo(threadID, path, opts, cb),
    sendVoice:        (threadID, path, opts, cb)  => client.sendVoice(threadID, path, opts, cb),
    sendGIF:          (threadID, url, opts, cb)   => client.sendGIF(threadID, url, opts, cb),
    sendPhotoFromUrl: (threadID, url, opts, cb)   => client.sendPhotoFromUrl(threadID, url, opts, cb),
    sendVideoFromUrl: (threadID, url, opts, cb)   => client.sendVideoFromUrl(threadID, url, opts, cb),
    sendVoiceFromUrl: (threadID, url, opts, cb)   => client.sendVoiceFromUrl(threadID, url, opts, cb),

    // Reactions
    sendReaction:   (reaction, messageID, cb) => client.sendReaction(reaction, messageID, cb),
    removeReaction: (messageID, cb)           => client.removeReaction(messageID, cb),

    // Threads
    getThreadInfo:      (threadID, cb)                    => client.getThreadInfo(threadID, cb),
    getThreadHistory:   (threadID, amount, timestamp, cb) => client.getThreadHistory(threadID, amount, timestamp, cb),
    getInbox:           (opts, cb)                        => client.getInbox(opts, cb),
    getThreadList:      (opts, cb)                        => client.getInbox(opts, cb),
    getPendingRequests: (opts, cb)                        => client.getPendingRequests(opts, cb),
    searchThreads:      (query, opts, cb)                 => client.searchThreads(query, opts, cb),
    deleteThread:       (threadID, cb)                    => client.deleteThread(threadID, cb),
    approveRequest:     (threadID, cb)                    => client.approveRequest(threadID, cb),
    declineRequest:     (threadID, cb)                    => client.declineRequest(threadID, cb),
    muteThread:         (threadID, cb)                    => client.muteThread(threadID, cb),
    unmuteThread:       (threadID, cb)                    => client.unmuteThread(threadID, cb),
    changeThreadTitle:  (threadID, title, cb)             => client.changeThreadTitle(threadID, title, cb),
    setThreadTitle:     (threadID, title, cb)             => client.changeThreadTitle(threadID, title, cb),
    setTitle:           (title, threadID, cb)             => client.changeThreadTitle(threadID, title, cb),
    changeNickname:     (userID, threadID, nickname, cb)  => client.changeNickname(userID, threadID, nickname, cb),
    addUserToGroup:     (userIDs, threadID, cb)           => client.threadManagement.addUsers(threadID, userIDs, cb),
    leaveGroup:         (threadID, cb)                    => client.threadManagement.leave(threadID, cb),
    markAsRead:         (threadID, read, cb)              => client.markAsRead(threadID, read, cb),
    markAsUnread:       (threadID, cb)                    => client.markAsUnread(threadID, cb),

    // Typing
    sendTypingIndicator: (threadID, cb) => client.sendTypingIndicator(threadID, cb),
    stopTypingIndicator: (threadID, cb) => client.stopTypingIndicator(threadID, cb),

    // Users
    getUserInfo:           (userID, cb)        => client.getUserInfo(userID, cb),
    getUserInfoByUsername: (username, cb)       => client.getUserInfoByUsername(username, cb),
    searchUsers:           (query, opts, cb)    => client.searchUsers(query, opts, cb),

    // Stories
    getUserStories: (userID, cb)               => client.stories.getUserStories(userID, cb),
    getFeedStories: (opts, cb)                 => client.stories.getFeedStories(opts, cb),
    reactToStory:   (storyId, userId, emoji, cb)    => client.stories.react(storyId, userId, emoji, cb),
    replyToStory:   (storyId, userId, message, cb)  => client.stories.reply(storyId, userId, message, cb),

    // Live
    getLiveFeed:     (opts, cb)                 => client.live.getLiveFeed(opts, cb),
    sendLiveComment: (broadcastId, message, cb) => client.live.sendComment(broadcastId, message, cb),
    sendLiveHeart:   (broadcastId, count, cb)   => client.live.sendHeart(broadcastId, count, cb),

    // Search
    search:         (query, opts, cb) => client.search.users(query, opts, cb),
    searchHashtags: (query, opts, cb) => client.search.hashtags(query, opts, cb),
    searchPlaces:   (query, opts, cb) => client.search.places(query, opts, cb),
    searchReels:    (query, opts, cb) => client.searchReels(query, opts, cb),

    // Health / monitoring
    getHealth:      ()                => client.getHealth(),

    // Session
    getSession:  ()      => client.serialize(),
    loadSession: (state) => client.loadSession(state),

    // Auth
    logout:          (cb)                     => client.logout(cb),
    verifyTwoFactor: (code, identifier, cb)   => client.verifyTwoFactor(code, identifier, cb),

    // Options
    setOptions: (opts) => setOptions(opts),

    // Database & Scheduler
    initDatabase:      ()                          => client.initDatabase(),
    scheduleTask:      (name, cronExpr, task)      => client.scheduleTask(name, cronExpr, task),

    // Session persistence
    saveSession:       (filePath)                  => client.saveSession(filePath),
    loadSession:       (state)                     => client.loadSession(state),
    loadSessionFromFile:(filePath)                  => client.loadSessionFromFile(filePath),

    // Cookie utilities (also available as login.CookieUtils before logging in)
    CookieUtils,

    // Direct access to the underlying client instance for advanced use
    _client: client
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal login implementation (Ultra-Safe Safeguarded)
// ─────────────────────────────────────────────────────────────────────────────

async function _login(credentials, options) {
  const client = new InstagramChatAPI(options);

  const isCookies =
    typeof credentials === 'string' ||
    Array.isArray(credentials) ||
    (credentials && typeof credentials === 'object' && !credentials.password);

  try {
    if (isCookies) {
      const result = await client.loginWithCookies(credentials);
      if (result && typeof result === 'object' && result.success === false) {
        const errorMsg = result.error || result.message || 'Cookie login failed';
        throw new Error(errorMsg);
      }
    } else {
      const { email, username, password } = credentials || {};
      const result = await client.login(email || username, password);

      if (result && result.twoFactorRequired) {
        const err = new Error('Two-factor authentication required');
        err.twoFactorRequired  = true;
        err.twoFactorIdentifier = result.twoFactorIdentifier;
        err.verify = (code) => client.verifyTwoFactor(code, result.twoFactorIdentifier);
        throw err;
      }
    }
  } catch (err) {
    let errMsg = 'Unknown Error';
    try {
      if (err) {
        if (typeof err === 'string') {
          errMsg = err;
        } else {
          errMsg = err.message || err.error || JSON.stringify(err);
        }
      }
    } catch (e) {
      errMsg = 'Unknown Login Error';
    }

    const finalErr = new Error(errMsg);
    finalErr.error = errMsg;
    throw finalErr;
  }

  return buildApi(client);
}

// ─────────────────────────────────────────────────────────────────────────────
// login(credentials, [options], [callback])
// ─────────────────────────────────────────────────────────────────────────────

function login(credentials, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }
  options = options || {};

  const promise = _login(credentials, options);

  if (typeof callback === 'function') {
    promise.then((api) => callback(null, api)).catch((err) => callback(err, null));
    return;
  }

  return promise;
}

// Everything a bot could need is attached directly to login
login.CookieUtils  = CookieUtils;
login.setOptions   = setOptions;
login.createClient = (opts) => new InstagramChatAPI(opts);

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

login.login = login;
login.default = login;
module.exports = login;
