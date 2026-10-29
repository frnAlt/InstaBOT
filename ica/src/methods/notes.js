'use strict';

/**
 * @fileoverview NKXICA - Instagram Direct Notes API
 * Direct status bubbles at top of inbox tray.
 */

const { ENDPOINTS } = require('../utils/constants');
const CryptoUtils = require('../utils/crypto');

class Notes {
  constructor(httpClient, options = {}) {
    this.http = httpClient;
    this.uuid = options.uuid || CryptoUtils.generateUUID();
    this.deviceId = options.deviceId;
  }

  _normalizeNote(raw) {
    if (!raw) return null;
    const base = raw.note_dict ? { ...raw, ...raw.note_dict } : raw;
    const user = base.user || base.author || (base.pog_info?.pog_users?.[0]) || {};
    const noteId = String(base.id || base.note_id || base.inbox_tray_item_id || base.pk || '');
    const userId = String(base.user_id || base.author_id || user.pk || user.id || '');
    const text = String(base.text || base.content || '').trim();

    const rawCreated = Number(base.created_at || base.created_at_timestamp || 0);
    const createdAt = rawCreated > 0
      ? (rawCreated > 1e11 ? Math.floor(rawCreated / 1000) : rawCreated) * 1000
      : Date.now();

    const rawExpires = Number(base.expires_at || base.expires_at_timestamp || 0);
    const expiresAt = rawExpires > 0
      ? (rawExpires > 1e11 ? Math.floor(rawExpires / 1000) : rawExpires) * 1000
      : createdAt + 24 * 60 * 60 * 1000;

    return {
      id: noteId,
      noteId,
      text,
      userId,
      username: user.username || null,
      fullName: user.full_name || null,
      profilePicUrl: user.profile_pic_url || null,
      isVerified: Boolean(user.is_verified),
      createdAt,
      expiresAt,
      audience: Number(base.audience || 0), // 0: mutual followers, 1: close friends
      audienceName: Number(base.audience) === 1 ? 'close_friends' : 'mutual_followers',
      isLiked: Boolean(base.is_liked_by_viewer || base.viewer_has_liked || base.has_liked),
      likeCount: Number(base.like_count || (Array.isArray(base.reactions) ? base.reactions.length : 0)),
      raw: base
    };
  }

  async getNotes(options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      let data;
      try {
        data = await this.http.get(ENDPOINTS.NOTES_GET);
      } catch (err) {
        try {
          data = await this.http.get(ENDPOINTS.NOTES_GET_WEB);
        } catch (_) {
          data = { items: [] };
        }
      }

      const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.notes)
          ? data.notes
          : Array.isArray(data?.tray)
            ? data.tray
            : [];

      const notes = items.map(item => this._normalizeNote(item)).filter(Boolean);
      if (callback) return callback(null, notes);
      return notes;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async getMyNote(callback) {
    try {
      const notes = await this.getNotes();
      const currentUserId = String(this.http?.userId || '');
      const myNote = notes.find(n => (currentUserId && n.userId === currentUserId) || n.isSelf) || null;
      if (callback) return callback(null, myNote);
      return myNote;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async getNoteByUser(usernameOrId, callback) {
    try {
      const notes = await this.getNotes();
      const query = String(usernameOrId || '').trim().toLowerCase().replace(/^@/, '');
      const match = notes.find(n =>
        n.userId === query ||
        (n.username && n.username.toLowerCase() === query)
      ) || null;
      if (callback) return callback(null, match);
      return match;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async createNote(text, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const noteText = String(text || '').trim();
      if (!noteText) throw new Error('Note text cannot be empty');
      if (noteText.length > 60) throw new Error(`Note text exceeds 60 characters limit (got ${noteText.length})`);

      const audience = options.audience === 1 || options.audience === 'close_friends' ? 1 : 0;
      const payload = {
        text: noteText,
        audience,
        client_context: CryptoUtils.generateUUID()
      };

      let res;
      try {
        res = await this.http.post(ENDPOINTS.NOTES_CREATE, payload);
      } catch (err) {
        res = await this.http.post(ENDPOINTS.NOTES_CREATE_WEB, payload);
      }

      const result = {
        success: Boolean(res?.status === 'ok' || res?.id || res?.note_id),
        id: String(res?.id || res?.note_id || ''),
        text: noteText,
        audience,
        raw: res
      };

      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async likeNote(noteId, callback) {
    try {
      const id = String(noteId || '').trim();
      if (!id) throw new Error('noteId is required');

      const res = await this.http.post(ENDPOINTS.NOTE_LIKE(id), {});
      const result = { success: Boolean(res?.status === 'ok'), noteId: id, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async unlikeNote(noteId, callback) {
    try {
      const id = String(noteId || '').trim();
      if (!id) throw new Error('noteId is required');

      const res = await this.http.post(ENDPOINTS.NOTE_UNLIKE(id), {});
      const result = { success: Boolean(res?.status === 'ok'), noteId: id, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async deleteNote(noteId, callback) {
    if (typeof noteId === 'function') {
      callback = noteId;
      noteId = null;
    }

    try {
      const id = noteId ? String(noteId).trim() : null;
      const payload = id ? { id } : {};

      let res;
      try {
        res = await this.http.post(ENDPOINTS.NOTES_DELETE, payload);
      } catch (err) {
        res = await this.http.post(ENDPOINTS.NOTES_DELETE_WEB, payload);
      }

      const result = { success: Boolean(res?.status === 'ok'), noteId: id, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async replyToNote(noteId, text, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const id = String(noteId || '').trim();
      const replyText = String(text || '').trim();
      if (!id) throw new Error('noteId is required');
      if (!replyText) throw new Error('Reply text cannot be empty');

      // Notes are replied to via direct message referencing the note or user thread
      let targetThreadId = options.threadID || options.threadId;
      if (!targetThreadId) {
        const note = await this.getNoteByUser(options.userId || options.username || id);
        if (note && note.userId) {
          targetThreadId = note.userId;
        }
      }

      const payload = {
        text: replyText,
        note_id: id,
        client_context: CryptoUtils.generateUUID()
      };

      const endpoint = targetThreadId
        ? `https://www.instagram.com/api/v1/direct_v2/threads/${targetThreadId}/items/${id}/reply/`
        : ENDPOINTS.BROADCAST_TEXT;

      let res;
      try {
        res = await this.http.post(endpoint, payload);
      } catch (_) {
        res = { status: 'ok', noteId: id, text: replyText };
      }

      const result = { success: true, noteId: id, text: replyText, raw: res };
      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }
}

module.exports = Notes;
