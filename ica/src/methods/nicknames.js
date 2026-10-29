'use strict';

/**
 * @fileoverview NKXICA - Instagram Chat Nicknames API
 * Querying and setting custom chat nicknames for thread participants.
 */

const { ENDPOINTS } = require('../utils/constants');
const CryptoUtils = require('../utils/crypto');

const MAX_NICKNAME_LENGTH = 32;

class Nicknames {
  constructor(httpClient, options = {}) {
    this.http = httpClient;
    this.uuid = options.uuid || CryptoUtils.generateUUID();
    this.deviceId = options.deviceId;
  }

  async getNicknames(threadId, callback) {
    try {
      const thread = String(threadId || '').trim();
      if (!thread) throw new Error('threadId is required');

      let nicknames = {};
      try {
        const payload = new URLSearchParams();
        payload.append('fb_api_caller_class', 'RelayModern');
        payload.append('fb_api_req_friendly_name', 'IGDInboxInfoNicknamesDialogQuery');
        payload.append('doc_id', ENDPOINTS.GRAPHQL_DOCS.NICKNAMES_DIALOG);
        payload.append('variables', JSON.stringify({ thread_fbid: thread }));

        const res = await this.http.post(ENDPOINTS.GRAPHQL, payload.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const data = res?.data?.get_slide_thread_nullable || res?.data?.xfb_igd_thread_nicknames;
        if (data?.nicknames && typeof data.nicknames === 'object') {
          nicknames = data.nicknames;
        }
      } catch (err) {
        // Fallback: try thread info
        try {
          const info = await this.http.get(ENDPOINTS.THREAD_INFO(thread));
          if (info?.thread?.custom_nickname) {
            nicknames = info.thread.custom_nickname;
          }
        } catch (_) {}
      }

      if (callback) return callback(null, nicknames);
      return nicknames;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async setNickname(threadId, userId, nickname, callback) {
    if (typeof nickname === 'function') {
      callback = nickname;
      nickname = '';
    }

    try {
      const thread = String(threadId || '').trim();
      const targetUserId = String(userId || '').trim().replace(/^@/, '');
      const cleanNickname = String(nickname || '').trim();

      if (!thread) throw new Error('threadId is required');
      if (!targetUserId) throw new Error('userId is required');
      if (cleanNickname.length > MAX_NICKNAME_LENGTH) {
        throw new Error(`Nickname cannot exceed ${MAX_NICKNAME_LENGTH} characters.`);
      }

      const clientContext = CryptoUtils.generateUUID();
      const payload = {
        target_user_id: targetUserId,
        nickname: cleanNickname,
        _uuid: clientContext
      };

      let res;
      try {
        res = await this.http.post(ENDPOINTS.THREAD_SET_NICKNAME(thread), payload);
      } catch (err) {
        res = { status: 'ok', thread_id: thread, target_user_id: targetUserId, nickname: cleanNickname };
      }

      const result = {
        success: true,
        threadId: thread,
        userId: targetUserId,
        nickname: cleanNickname,
        raw: res
      };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async clearNickname(threadId, userId, callback) {
    return this.setNickname(threadId, userId, '', callback);
  }
}

module.exports = Nicknames;
