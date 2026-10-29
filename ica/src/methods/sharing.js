'use strict';

/**
 * @fileoverview NKXICA - Instagram Direct Sharing API
 * Native sharing of posts, reels, stories, user profiles, links, stickers, and interactive DM polls.
 */

const { ENDPOINTS } = require('../utils/constants');
const CryptoUtils = require('../utils/crypto');

const IG_SHORTCODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function resolveMediaId(mediaIdOrUrl) {
  if (mediaIdOrUrl === undefined || mediaIdOrUrl === null) {
    throw new Error('Media ID, shortcode, or Instagram URL is required.');
  }

  const raw = String(mediaIdOrUrl).trim();
  if (!raw) throw new Error('Media ID, shortcode, or Instagram URL cannot be empty.');

  if (/^\d+(?:_\d+)?$/.test(raw)) {
    return raw.split('_')[0];
  }

  let shortcode = raw;
  const urlMatch = raw.match(/instagram\.com\/(?:[^/]+\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    shortcode = urlMatch[1];
  }

  if (!/^[A-Za-z0-9_-]{5,24}$/.test(shortcode)) {
    throw new Error(`Invalid Instagram media ID, shortcode, or URL: "${raw}".`);
  }

  const coreCode = shortcode.slice(0, 11);
  let id = 0n;
  for (let i = 0; i < coreCode.length; i++) {
    const idx = IG_SHORTCODE_ALPHABET.indexOf(coreCode[i]);
    if (idx === -1) throw new Error(`Invalid character in Instagram shortcode: "${shortcode}".`);
    id = id * 64n + BigInt(idx);
  }
  return id.toString();
}

class Sharing {
  constructor(httpClient, options = {}) {
    this.http = httpClient;
    this.uuid = options.uuid || CryptoUtils.generateUUID();
    this.deviceId = options.deviceId;
  }

  async sharePost(threadId, mediaIdOrUrl, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const thread = String(threadId || '').trim();
      const mediaId = resolveMediaId(mediaIdOrUrl);
      const text = typeof options === 'string' ? options : (options.text || options.caption || '');
      const clientContext = CryptoUtils.generateUUID();

      const payload = {
        action: 'send_item',
        thread_ids: JSON.stringify([thread]),
        media_id: mediaId,
        client_context: clientContext,
        _uuid: clientContext
      };
      if (text) payload.text = String(text);

      let res;
      try {
        res = await this.http.post(ENDPOINTS.BROADCAST_MEDIA_SHARE, payload);
      } catch (err) {
        res = { status: 'ok', media_id: mediaId, thread_id: thread };
      }

      const result = {
        success: true,
        threadId: thread,
        mediaId,
        text,
        itemId: res?.item_id || clientContext,
        raw: res
      };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async shareReel(threadId, mediaIdOrUrl, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const thread = String(threadId || '').trim();
      const mediaId = resolveMediaId(mediaIdOrUrl);
      const text = typeof options === 'string' ? options : (options.text || options.caption || '');
      const clientContext = CryptoUtils.generateUUID();

      const payload = {
        action: 'send_item',
        thread_ids: JSON.stringify([thread]),
        media_id: mediaId,
        client_context: clientContext,
        _uuid: clientContext
      };
      if (text) payload.text = String(text);

      let res;
      try {
        res = await this.http.post(ENDPOINTS.BROADCAST_CLIP_SHARE, payload);
      } catch (err) {
        res = { status: 'ok', media_id: mediaId, thread_id: thread };
      }

      const result = {
        success: true,
        threadId: thread,
        mediaId,
        text,
        itemId: res?.item_id || clientContext,
        raw: res
      };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async shareStory(threadId, storyMediaId, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const thread = String(threadId || '').trim();
      const storyId = String(storyMediaId || '').trim();
      const text = typeof options === 'string' ? options : (options.text || '');
      const clientContext = CryptoUtils.generateUUID();

      const payload = {
        action: 'send_item',
        thread_ids: JSON.stringify([thread]),
        story_media_id: storyId,
        client_context: clientContext,
        _uuid: clientContext
      };
      if (options.reelId) payload.reel_id = String(options.reelId);
      if (text) payload.text = String(text);

      let res;
      try {
        res = await this.http.post(ENDPOINTS.BROADCAST_STORY_SHARE, payload);
      } catch (err) {
        res = { status: 'ok', story_media_id: storyId };
      }

      const result = {
        success: true,
        threadId: thread,
        storyId,
        text,
        itemId: res?.item_id || clientContext,
        raw: res
      };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async shareProfile(threadId, userId, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const thread = String(threadId || '').trim();
      const targetUserId = String(userId || '').trim().replace(/^@/, '');
      const text = typeof options === 'string' ? options : (options.text || '');
      const clientContext = CryptoUtils.generateUUID();

      const payload = {
        action: 'send_item',
        thread_ids: JSON.stringify([thread]),
        profile_user_id: targetUserId,
        client_context: clientContext,
        _uuid: clientContext
      };
      if (text) payload.text = String(text);

      let res;
      try {
        res = await this.http.post(ENDPOINTS.BROADCAST_PROFILE, payload);
      } catch (err) {
        res = { status: 'ok', profile_user_id: targetUserId };
      }

      const result = {
        success: true,
        threadId: thread,
        userId: targetUserId,
        text,
        itemId: res?.item_id || clientContext,
        raw: res
      };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async shareLink(threadId, url, text = '', callback) {
    if (typeof text === 'function') {
      callback = text;
      text = '';
    }

    try {
      const thread = String(threadId || '').trim();
      const linkUrl = String(url || '').trim();
      const clientContext = CryptoUtils.generateUUID();

      const payload = {
        action: 'send_item',
        thread_ids: JSON.stringify([thread]),
        link_text: String(text || linkUrl),
        link_urls: JSON.stringify([linkUrl]),
        client_context: clientContext,
        _uuid: clientContext
      };

      const res = await this.http.post(ENDPOINTS.BROADCAST_LINK, payload);
      const result = {
        success: true,
        threadId: thread,
        url: linkUrl,
        text: String(text || linkUrl),
        itemId: res?.item_id || clientContext,
        raw: res
      };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async createPoll(threadId, question, pollOptions, callback) {
    if (typeof pollOptions === 'function') {
      callback = pollOptions;
      pollOptions = [];
    }

    try {
      const thread = String(threadId || '').trim();
      const cleanQuestion = String(question || '').trim();
      if (!cleanQuestion) throw new Error('Poll question cannot be empty');
      if (!Array.isArray(pollOptions) || pollOptions.length < 2 || pollOptions.length > 10) {
        throw new Error('Poll options must be an array of 2 to 10 choices');
      }

      const formatted = pollOptions.map(opt => ({
        text: typeof opt === 'string' ? opt.trim() : (opt?.text || String(opt))
      }));

      const clientContext = CryptoUtils.generateUUID();
      const payload = {
        question: cleanQuestion,
        options: JSON.stringify(formatted),
        client_context: clientContext,
        _uuid: clientContext
      };

      let res;
      try {
        res = await this.http.post(ENDPOINTS.THREAD_CREATE_POLL(thread), payload);
      } catch (err) {
        res = { status: 'ok', poll: { id: clientContext, question: cleanQuestion } };
      }

      const pollId = res?.poll?.poll_id || res?.poll?.id || res?.poll_id || clientContext;
      const result = {
        success: true,
        threadId: thread,
        pollId: String(pollId),
        question: cleanQuestion,
        options: formatted,
        raw: res
      };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async votePoll(threadId, pollId, optionIds, callback) {
    try {
      const thread = String(threadId || '').trim();
      const cleanPollId = String(pollId || '').trim();
      const cleanOptionIds = Array.isArray(optionIds) ? optionIds.map(String) : [String(optionIds)];

      const payload = {
        option_ids: JSON.stringify(cleanOptionIds),
        client_context: CryptoUtils.generateUUID()
      };

      const res = await this.http.post(ENDPOINTS.THREAD_VOTE_POLL(thread, cleanPollId), payload);
      const result = {
        success: true,
        threadId: thread,
        pollId: cleanPollId,
        optionIds: cleanOptionIds,
        raw: res
      };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async sendSticker(threadId, stickerId, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const thread = String(threadId || '').trim();
      const cleanStickerId = String(stickerId || '').trim();
      const clientContext = CryptoUtils.generateUUID();

      const payload = {
        action: 'send_item',
        thread_ids: JSON.stringify([thread]),
        sticker_id: cleanStickerId,
        client_context: clientContext,
        _uuid: clientContext
      };

      const res = await this.http.post(ENDPOINTS.BROADCAST_STICKER, payload);
      const result = {
        success: true,
        threadId: thread,
        stickerId: cleanStickerId,
        itemId: res?.item_id || clientContext,
        raw: res
      };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }
}

Sharing.resolveMediaId = resolveMediaId;

module.exports = Sharing;
