/**
 * NKXICA Constants Module
 * Centralised API endpoints and configuration values.
 */

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Instagram API Base URLs ──────────────────────────────────────────────────

const BASE_URL = 'https://www.instagram.com';
const API_V1   = `${BASE_URL}/api/v1`;

// ─── Direct Messaging Endpoints ───────────────────────────────────────────────

const ENDPOINTS = {
  // Authentication
  LOGIN:               `${API_V1}/accounts/login/`,
  LOGOUT:              `${API_V1}/accounts/logout/`,
  TWO_FACTOR_LOGIN:    `${API_V1}/accounts/two_factor_login/`,
  CHECK_USERNAME:      `${API_V1}/accounts/check_username/`,

  // Direct messaging (broadcast)
  BROADCAST_TEXT:      `${API_V1}/direct_v2/threads/broadcast/text/`,
  BROADCAST_LINK:      `${API_V1}/direct_v2/threads/broadcast/link/`,
  BROADCAST_MEDIA:     `${API_V1}/direct_v2/threads/broadcast/upload_and_send_direct_media/`,
  BROADCAST_PHOTO:     `${API_V1}/direct_v2/threads/broadcast/upload_and_send_direct_media/`,
  BROADCAST_VIDEO:     `${API_V1}/direct_v2/threads/broadcast/upload_and_send_direct_media/`,
  BROADCAST_VOICE:     `${API_V1}/direct_v2/threads/broadcast/audio/`,
  BROADCAST_GIF:       `${API_V1}/direct_v2/threads/broadcast/animated_media/`,
  BROADCAST_REACTION:  `${API_V1}/direct_v2/threads/broadcast/reaction/`,
  BROADCAST_UNSEND:    `${API_V1}/direct_v2/threads/broadcast/unsend/`,
  BROADCAST_FORWARD:   `${API_V1}/direct_v2/threads/broadcast/forward/`,
  BROADCAST_MEDIA_SHARE: `${API_V1}/direct_v2/threads/broadcast/media_share/`,
  BROADCAST_CLIP_SHARE:  `${API_V1}/direct_v2/threads/broadcast/clip/`,
  BROADCAST_STORY_SHARE: `${API_V1}/direct_v2/threads/broadcast/story_share/`,
  BROADCAST_PROFILE:     `${API_V1}/direct_v2/threads/broadcast/profile/`,
  BROADCAST_STICKER:     `${API_V1}/direct_v2/threads/broadcast/static_stickers/`,
  THREAD_CREATE_POLL:  (threadId) => `${API_V1}/direct_v2/threads/${threadId}/group_poll/create/`,
  THREAD_VOTE_POLL:    (threadId, pollId) => `${API_V1}/direct_v2/threads/${threadId}/group_poll/${pollId}/vote/`,
  EDIT_MESSAGE:        (threadId, itemId) => `${API_V1}/direct_v2/threads/${threadId}/items/${itemId}/edit_message/`,
  PIN_MESSAGE:         (threadId, itemId) => `${API_V1}/direct_v2/threads/${threadId}/items/${itemId}/pin/`,
  UNPIN_MESSAGE:       (threadId, itemId) => `${API_V1}/direct_v2/threads/${threadId}/items/${itemId}/unpin/`,
  SET_THEME:           (threadId) => `${API_V1}/direct_v2/threads/${threadId}/set_theme/`,

  // Thread management
  THREAD_INFO:         (threadID) => `${API_V1}/direct_v2/threads/${threadID}/`,
  THREAD_DELETE:       (threadID) => `${API_V1}/direct_v2/threads/${threadID}/hide/`,
  THREAD_MUTE:         (threadID) => `${API_V1}/direct_v2/threads/${threadID}/mute/`,
  THREAD_UNMUTE:       (threadID) => `${API_V1}/direct_v2/threads/${threadID}/unmute/`,
  THREAD_PIN:          (threadID) => `${API_V1}/direct_v2/threads/${threadID}/pin_thread/`,
  THREAD_UNPIN:        (threadID) => `${API_V1}/direct_v2/threads/${threadID}/unpin_thread/`,
  THREAD_APPROVE:      (threadID) => `${API_V1}/direct_v2/threads/${threadID}/approve/`,
  THREAD_DECLINE:      (threadID) => `${API_V1}/direct_v2/threads/${threadID}/decline/`,
  THREAD_TITLE:        (threadID) => `${API_V1}/direct_v2/threads/${threadID}/update_title/`,
  THREAD_HISTORY:      (threadID) => `${API_V1}/direct_v2/threads/${threadID}/items/`,
  THREAD_SET_NICKNAME: (threadID) => `${API_V1}/direct_v2/threads/${threadID}/set_user_nickname/`,
  MARK_ITEM_SEEN:      (threadID, itemID) => `${API_V1}/direct_v2/threads/${threadID}/items/${itemID}/seen/`,

  // Notes API
  NOTES_GET:           `${API_V1}/notes/get_notes/`,
  NOTES_GET_WEB:       `${BASE_URL}/api/v1/notes/get_notes/`,
  NOTES_CREATE:        `${API_V1}/notes/create_note/`,
  NOTES_CREATE_WEB:    `${BASE_URL}/api/v1/notes/create_note/`,
  NOTES_DELETE:        `${API_V1}/notes/delete_note/`,
  NOTES_DELETE_WEB:    `${BASE_URL}/api/v1/notes/delete_note/`,
  NOTE_LIKE:           (noteId) => `${API_V1}/notes/${noteId}/like/`,
  NOTE_UNLIKE:         (noteId) => `${API_V1}/notes/${noteId}/unlike/`,

  // Friendships & Moderation
  FRIENDSHIP_STATUS:   (userId) => `${BASE_URL}/api/v1/friendships/show/${userId}/`,
  FRIENDSHIP_FOLLOW:   (userId) => `${BASE_URL}/api/v1/friendships/create/${userId}/`,
  FRIENDSHIP_UNFOLLOW: (userId) => `${BASE_URL}/api/v1/friendships/destroy/${userId}/`,
  FRIENDSHIP_REMOVE_FOLLOWER: (userId) => `${BASE_URL}/api/v1/friendships/remove_follower/${userId}/`,
  FRIENDSHIP_FOLLOWERS: (userId) => `${BASE_URL}/api/v1/friendships/${userId}/followers/`,
  FRIENDSHIP_FOLLOWING: (userId) => `${BASE_URL}/api/v1/friendships/${userId}/following/`,
  FRIENDSHIP_PENDING:  `${BASE_URL}/api/v1/friendships/pending/`,
  FRIENDSHIP_APPROVE:  (userId) => `${BASE_URL}/api/v1/friendships/approve/${userId}/`,
  FRIENDSHIP_IGNORE:   (userId) => `${BASE_URL}/api/v1/friendships/ignore/${userId}/`,
  FRIENDSHIP_BLOCK:    (userId) => `${BASE_URL}/api/v1/friendships/block/${userId}/`,
  FRIENDSHIP_UNBLOCK:  (userId) => `${BASE_URL}/api/v1/friendships/unblock/${userId}/`,
  RESTRICT_USER:       `${BASE_URL}/api/v1/restrict_action/restrict/`,
  UNRESTRICT_USER:     `${BASE_URL}/api/v1/restrict_action/unrestrict/`,

  // GraphQL
  GRAPHQL:             `${BASE_URL}/api/graphql`,
  GRAPHQL_DOCS: Object.freeze({
    INBOX: '27909866362025854',
    MESSAGE_REQUESTS: '39282737491373568',
    SEND_TEXT: '26911679871773184',
    SEND_MEDIA: '25766288509716264',
    EDIT_MESSAGE: '32480262318254796',
    UNSEND_MESSAGE: '26948700068153789',
    FORWARD_MEDIA: '29536362899300769',
    REACTION: '24374451552236906',
    MARK_READ: '27399783383056109',
    MARK_READ_VALIDATION: '35211594988486314',
    THREAD_DETAIL: '29697953149788513',
    CREATE_THREAD: '27529949946640544',
    ACCEPT_REQUEST: '36571001125823973',
    THEMES_CATALOG: '38559398347039873',
    SET_THEME: '27105231055765011',
    SEND_GIF: '32089613413987432',
    SEND_STICKER: '24640017885680534',
    SEND_AVATAR_STICKER: '24914262484908659',
    SHARE_LINK: '27277149101947973',
    SHARE_MEDIA: '27442850591982122',
    SHARE_REEL: '26212720875066239',
    SHARE_STORY: '26219781510996267',
    SHARE_STORY_REPLY: '26536543495958378',
    NICKNAMES_DIALOG: '37638783522379473',
    EDIT_THREAD_NAME_DIALOG: '35260317140280682',
    LEAVE_GROUP_DIALOG: '26916415887952019',
    GROUP_MEMBERSHIP_DIALOG: '38459217280393010',
    APPROVE_FOLLOW: '29064527116474163',
    IGNORE_FOLLOW: '27152710251093953',
    UNRESTRICT_USER: '29456204210646604'
  }),

  // Inbox
  INBOX:               `${API_V1}/direct_v2/inbox/`,
  PENDING_INBOX:       `${API_V1}/direct_v2/pending_inbox/`,
  THREAD_SEARCH:       `${API_V1}/direct_v2/ranked_recipients/`,

  // User info
  USER_INFO:           (userID) => `${API_V1}/users/${userID}/info/`,
  USER_BY_USERNAME:    (username) => `${BASE_URL}/${username}/?__a=1&__d=dis`,
  USER_SEARCH:         `${API_V1}/users/search/`,

  // Typing
  TYPING_INDICATOR:    `${API_V1}/direct_v2/threads/broadcast/indicate_activity/`,

  // Mark read / unread
  MARK_THREAD_SEEN:    (threadID) => `${API_V1}/direct_v2/threads/${threadID}/items/seen/`,

  // Nickname
  UPDATE_TITLE:        (threadID) => `${API_V1}/direct_v2/threads/${threadID}/update_title/`,
  UPDATE_NICKNAME:     `${API_V1}/direct_v2/threads/update_title/`,

  // Media upload
  RUPLOAD_PHOTO:       'https://i.instagram.com/rupload_igphoto/',
  RUPLOAD_VIDEO:       'https://i.instagram.com/rupload_igvideo/',

  // Stories
  STORY_FEED:          `${API_V1}/feed/reels_tray/`,
  STORY_ITEMS:         (userID) => `${API_V1}/feed/user/${userID}/reel_media/`,

  // Search
  SEARCH_USERS:        `${API_V1}/users/search/`,
  SEARCH_TOPICS:       `${API_V1}/fbsearch/topsearch/`,

  // Live
  LIVE_CREATE:         `${API_V1}/live/create/`,
  LIVE_START:          (broadcastID) => `${API_V1}/live/${broadcastID}/start/`,
  LIVE_END:            (broadcastID) => `${API_V1}/live/${broadcastID}/end/`,

  // MQTT
  MQTT_HOST:           'wss://edge-chat.instagram.com/chat',
};

// ─── Trusted cookie domains ───────────────────────────────────────────────────

const TRUSTED_COOKIE_DOMAINS = new Set([
  '.instagram.com',
  'instagram.com',
  '.facebook.com',
  'facebook.com',
  'i.instagram.com',
]);

module.exports = { getRandom, ENDPOINTS, BASE_URL, API_V1, TRUSTED_COOKIE_DOMAINS };