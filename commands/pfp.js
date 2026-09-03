/**
 * Instagram Profile Picture (PFP) Inspector Command
 * Fetches HD avatar pictures of any Instagram account
 */

const axios = require('axios');

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

module.exports = {
  config: {
    name: 'pfp',
    aliases: ['avatar', 'profilepic', 'hdavatar'],
    description: "Fetch high-definition Instagram profile pictures",
    usage: '{p}pfp [username | @username | link | reply | @tag]',
    cooldown: 5,
    role: 0,
    author: 'Gtajisan && frnAlt',
    category: 'utility'
  },

  onStart: async function ({ api, event, args, logger, message }) {
    const threadID = event.threadId || event.threadID;

    try {
      let targetInput = null;
      let isUid = false;

      // 1. Check explicit arguments
      if (args.length > 0) {
        const input = args[0].trim();
        if (input.includes('instagram.com/')) {
          const match = input.match(/instagram\.com\/([^/?#&]+)/);
          if (match) targetInput = match[1];
        } else {
          targetInput = input.replace(/^@+/, '');
        }
      }
      // 2. Check mentions
      else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetInput = Object.keys(event.mentions)[0];
        isUid = true;
      }
      // 3. Check reply
      else if (event.messageReply) {
        const reply = event.messageReply;
        const replyBody = reply.body || '';
        const senderID = reply.senderID || reply.senderId;

        if (senderID) {
          const urlMatch = replyBody.match(/instagram\.com\/([^/?#&]+)/);
          if (urlMatch) {
            targetInput = urlMatch[1];
          } else {
            const atMatch = replyBody.match(/@([a-zA-Z0-9._]+)/);
            if (atMatch) {
              targetInput = atMatch[1];
            } else {
              targetInput = senderID;
              isUid = true;
            }
          }
        }
      }

      // 4. Fallback to sender
      if (!targetInput) {
        targetInput = event.senderID;
        isUid = true;
      }

      if (!isUid && /^\d+$/.test(targetInput)) {
        isUid = true;
      }

      // Check cache
      const cacheKey = `${isUid ? 'uid' : 'user'}:${targetInput}`;
      if (cache.has(cacheKey)) {
        const { data, timestamp } = cache.get(cacheKey);
        if (Date.now() - timestamp < CACHE_TTL) {
          return this.sendProfile(api, event, data, message, threadID);
        }
      }

      if (message && typeof message.reaction === 'function') message.reaction('⏳', event.messageID);

      const userInfo = await this.fetchWithRetry(async () => {
        return isUid
          ? (await api.getUserInfo(targetInput))[targetInput]
          : await api.getUserInfoByUsername(targetInput);
      }, logger);

      if (!userInfo) {
        if (message && typeof message.reaction === 'function') message.reaction('❌', event.messageID);
        const notFound = `❌ User ${isUid ? targetInput : '@' + targetInput} not found or account is private.`;
        return message ? message.reply(notFound) : api.sendMessage(notFound, threadID);
      }

      // Store in cache
      cache.set(cacheKey, { data: userInfo, timestamp: Date.now() });

      return this.sendProfile(api, event, userInfo, message, threadID);
    } catch (error) {
      if (message && typeof message.reaction === 'function') message.reaction('❌', event.messageID);
      const errMsg = `❌ Error: ${error.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  async sendProfile(api, event, userInfo, message, threadID) {
    const userId = userInfo.userID || userInfo.userId || userInfo.pk;
    const username = userInfo.username || 'unknown';
    const fullName = userInfo.fullName || userInfo.full_name || 'N/A';
    const isPrivate = userInfo.isPrivate ? '🔒 Private' : '🔓 Public';
    const isVerified = userInfo.isVerified ? '✅ Verified' : '❌ Unverified';

    const pfpUrl = userInfo.profilePicUrlHd ||
                   userInfo.hd_profile_pic_url_info?.url ||
                   userInfo.profile_pic_url_hd ||
                   userInfo.profilePicUrl ||
                   userInfo.profile_pic_url;

    if (!pfpUrl) {
      const errMsg = '❌ Could not find a profile picture URL.';
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }

    let caption = `👤 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: @${username}\n`;
    caption += `📝 𝗙𝘂𝗹𝗹 𝗡𝗮𝗺𝗲: ${fullName}\n`;
    caption += `🆔 𝗨𝘀𝗲𝗿 𝗜𝗗: ${userId}\n`;
    caption += `🛡️ 𝗦𝘁𝗮𝘁𝘂𝘀: ${isPrivate} | ${isVerified}\n`;
    caption += `🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: https://instagram.com/${username}`;

    if (message && typeof message.reaction === 'function') message.reaction('✅', event.messageID);

    try {
      const res = await axios.get(pfpUrl, { responseType: 'arraybuffer', timeout: 15000 });
      const imgBuffer = Buffer.from(res.data);
      return message 
        ? message.reply({ body: caption, attachment: imgBuffer })
        : api.sendMessage({ body: caption, attachment: imgBuffer }, threadID);
    } catch (_) {
      return message 
        ? message.reply({ body: caption, attachment: pfpUrl })
        : api.sendMessage({ body: caption, attachment: pfpUrl }, threadID);
    }
  },

  async fetchWithRetry(fn, logger, retries = 3, backoff = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        const isRateLimit = errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('too many requests') || errorMsg.includes('login_required');

        if (isRateLimit && i < retries - 1) {
          const delay = backoff * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
