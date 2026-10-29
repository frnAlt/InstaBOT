/**
 * @fileoverview NKXICA - User API Methods
 * @author neoaz07 (Saifullah Neoaz)
 * @copyright 2024 NeoKEX
 * @license MIT
 * @module UserMethods
 * @since 1.0.0
 */

const FormatUtils = require('../utils/formatter');
const ValidationUtils = require('../utils/validation');

class UserMethods {
  constructor(httpClient) {
    this.http = httpClient;
  }

  // Get user info by ID
  async getInfo(userID, callback) {
    try {
      const validation = ValidationUtils.validateUserID(userID);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await this.http.get(
        `https://www.instagram.com/api/v1/users/${validation.id}/info/`
      );

      const user = FormatUtils.formatUser(response.user);
      
      if (callback) return callback(null, user);
      return user;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Get user info by username
  async getInfoByUsername(username, callback) {
    try {
      if (!ValidationUtils.isValidUsername(username)) {
        throw new Error('Invalid username');
      }

      // Search for user
      const response = await this.http.get(
        `https://www.instagram.com/api/v1/users/search/?q=${encodeURIComponent(username)}&count=30`
      );

      const user = response.users?.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (!user) {
        throw new Error('User not found');
      }

      const formatted = FormatUtils.formatUser(user);
      
      if (callback) return callback(null, formatted);
      return formatted;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Check friendship status
  async checkFriendship(userID, callback) {
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      if (!uid) throw new Error('userID is required');

      const res = await this.http.get(`https://www.instagram.com/api/v1/friendships/show/${uid}/`);
      const status = {
        userId: uid,
        following: Boolean(res?.following),
        followedBy: Boolean(res?.followed_by),
        blocking: Boolean(res?.blocking),
        muting: Boolean(res?.muting),
        isPrivate: Boolean(res?.is_private),
        incomingRequest: Boolean(res?.incoming_request),
        outgoingRequest: Boolean(res?.outgoing_request),
        isBestie: Boolean(res?.is_bestie),
        isRestricted: Boolean(res?.is_restricted),
        raw: res
      };
      if (callback) return callback(null, status);
      return status;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Follow user
  async follow(userID, callback) {
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      if (!uid) throw new Error('userID is required');

      const res = await this.http.post(`https://www.instagram.com/api/v1/friendships/create/${uid}/`, {});
      const result = { success: Boolean(res?.status === 'ok' || res?.friendship_status?.following), userId: uid, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Unfollow user
  async unfollow(userID, callback) {
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      if (!uid) throw new Error('userID is required');

      const res = await this.http.post(`https://www.instagram.com/api/v1/friendships/destroy/${uid}/`, {});
      const result = { success: Boolean(res?.status === 'ok' || !res?.friendship_status?.following), userId: uid, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Get followers list
  async getFollowers(userID, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      const maxId = options.maxId ? `&max_id=${options.maxId}` : '';
      const res = await this.http.get(`https://www.instagram.com/api/v1/friendships/${uid}/followers/?count=${options.count || 50}${maxId}`);
      const users = (res?.users || []).map(u => FormatUtils.formatUser(u));
      const result = { users, nextMaxId: res?.next_max_id || null, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Get following list
  async getFollowing(userID, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      const maxId = options.maxId ? `&max_id=${options.maxId}` : '';
      const res = await this.http.get(`https://www.instagram.com/api/v1/friendships/${uid}/following/?count=${options.count || 50}${maxId}`);
      const users = (res?.users || []).map(u => FormatUtils.formatUser(u));
      const result = { users, nextMaxId: res?.next_max_id || null, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Block user
  async block(userID, callback) {
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      if (!uid) throw new Error('userID is required');

      const res = await this.http.post(`https://www.instagram.com/api/v1/friendships/block/${uid}/`, {});
      const result = { success: Boolean(res?.status === 'ok' || res?.friendship_status?.blocking), userId: uid, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Unblock user
  async unblock(userID, callback) {
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      if (!uid) throw new Error('userID is required');

      const res = await this.http.post(`https://www.instagram.com/api/v1/friendships/unblock/${uid}/`, {});
      const result = { success: Boolean(res?.status === 'ok' || !res?.friendship_status?.blocking), userId: uid, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Restrict user
  async restrict(userID, callback) {
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      if (!uid) throw new Error('userID is required');

      const res = await this.http.post('https://www.instagram.com/api/v1/restrict_action/restrict/', { target_user_id: uid });
      const result = { success: Boolean(res?.status === 'ok'), userId: uid, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Unrestrict user
  async unrestrict(userID, callback) {
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      if (!uid) throw new Error('userID is required');

      const res = await this.http.post('https://www.instagram.com/api/v1/restrict_action/unrestrict/', { target_user_id: uid });
      const result = { success: Boolean(res?.status === 'ok'), userId: uid, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Mute user media/stories
  async mute(userID, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      const payload = {
        target_posts_author_id: uid,
        target_reel_author_id: uid,
        ...options
      };
      const res = await this.http.post('https://www.instagram.com/api/v1/friendships/mute_posts_or_story_from_follow/', payload);
      const result = { success: Boolean(res?.status === 'ok'), userId: uid, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Unmute user media/stories
  async unmute(userID, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    try {
      const uid = String(userID || '').trim().replace(/^@/, '');
      const payload = {
        target_posts_author_id: uid,
        target_reel_author_id: uid,
        ...options
      };
      const res = await this.http.post('https://www.instagram.com/api/v1/friendships/unmute_posts_or_story_from_follow/', payload);
      const result = { success: Boolean(res?.status === 'ok'), userId: uid, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Search users
  async search(query, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const limit = options.limit || 30;
      
      const response = await this.http.get(
        `https://www.instagram.com/api/v1/users/search/?q=${encodeURIComponent(query)}&count=${limit}`
      );

      const users = response.users?.map(u => FormatUtils.formatUser(u)) || [];
      
      if (callback) return callback(null, users);
      return users;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Get multiple users info
  async getMultiple(userIDs, callback) {
    try {
      const results = [];
      
      for (const userID of userIDs) {
        try {
          const user = await this.getInfo(userID);
          results.push({ userID, success: true, user });
          // Add delay between batch requests to avoid rate limiting
          if (userIDs.indexOf(userID) < userIDs.length - 1) {
            await this.sleep(1500);
          }
        } catch (error) {
          results.push({ userID, success: false, error: error.message });
        }
      }

      if (callback) return callback(null, results);
      return results;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Sleep utility for rate limiting
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get followers (limited, requires additional permissions)
  async getFollowers(userID, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const validation = ValidationUtils.validateUserID(userID);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const maxId = options.cursor || '';
      const response = await this.http.get(
        `https://www.instagram.com/api/v1/friendships/${validation.id}/followers/?count=${options.limit || 50}${maxId ? `&max_id=${maxId}` : ''}`
      );

      const users = response.users?.map(u => FormatUtils.formatUser(u)) || [];
      
      const result = {
        users,
        hasMore: !!response.next_max_id,
        cursor: response.next_max_id
      };
      
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  // Get following (limited, requires additional permissions)
  async getFollowing(userID, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const validation = ValidationUtils.validateUserID(userID);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const maxId = options.cursor || '';
      const response = await this.http.get(
        `https://www.instagram.com/api/v1/friendships/${validation.id}/following/?count=${options.limit || 50}${maxId ? `&max_id=${maxId}` : ''}`
      );

      const users = response.users?.map(u => FormatUtils.formatUser(u)) || [];
      
      const result = {
        users,
        hasMore: !!response.next_max_id,
        cursor: response.next_max_id
      };
      
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }
}

module.exports = UserMethods;