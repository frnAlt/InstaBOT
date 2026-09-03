const axios = require('axios');

module.exports = {
  config: {
    name: 'userinfo',
    aliases: ['uinfo', 'profile', 'iginfo', 'whoami'],
    description: 'Get detailed Instagram user information',
    usage: 'userinfo [username | UID | @tag | reply]',
    cooldown: 10,
    role: 0,
    author: 'Gtajisan && frnAlt',
    category: 'utility'
  },

  async run({ api, event, args, logger, message, PermissionManager }) {
    try {
      let targetInput = null;
      let isUid = false;

      if (args.length > 0) {
        targetInput = args[0].replace(/^@+/, '').trim();
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetInput = Object.keys(event.mentions)[0];
        isUid = true;
      } else if (event.replyToItemId) {
        const reply = event.messageReply || {};
        const replySender = reply.senderID || reply.senderId;
        if (replySender) {
          targetInput = replySender;
          isUid = true;
        }
      }

      if (!targetInput) {
        targetInput = event.senderID;
        isUid = true;
      }

      if (!isUid && /^\d+$/.test(targetInput)) {
        isUid = true;
      }

      const fetchingMsg = await message.reply('🔍 Fetching user information...');

      const userInfo = isUid
        ? (await api.getUserInfo(targetInput))[targetInput]
        : await api.getUserInfoByUsername(targetInput);

      if (!userInfo) {
        return message.reply(`❌ User ${isUid ? targetInput : '@' + targetInput} not found or account is private.`);
      }

      const userId     = userInfo.userID || userInfo.userId || userInfo.pk;
      const username   = userInfo.username;
      const fullName   = userInfo.fullName || userInfo.full_name || 'N/A';
      const bio        = userInfo.bio || userInfo.biography || 'No bio';
      const isPrivate  = userInfo.isPrivate ? '🔒 Private' : '🔓 Public';
      const isVerified = userInfo.isVerified ? '✅ Verified' : '❌ Not Verified';
      const followers  = userInfo.followerCount || userInfo.follower_count || 0;
      const following  = userInfo.followingCount || userInfo.following_count || 0;
      const posts      = userInfo.mediaCount || userInfo.media_count || 0;

      const role = PermissionManager.getUserRole(userId);

      let msg = `Instagram User Info\n\n`;
      msg += `👤 Username: @${username}\n`;
      msg += `🆔 User ID: ${userId}\n`;
      msg += `📝 Full Name: ${fullName}\n`;
      msg += `🎭 Role: ${PermissionManager.getRoleName(role)} (${role})\n`;
      msg += `${isPrivate} | ${isVerified}\n\n`;
      msg += `📊 Statistics:\n`;
      msg += `  • Posts: ${posts.toLocaleString()}\n`;
      msg += `  • Followers: ${followers.toLocaleString()}\n`;
      msg += `  • Following: ${following.toLocaleString()}\n\n`;
      msg += `📖 Bio:\n${bio}\n\n`;
      msg += `🔗 Profile: https://instagram.com/${username}`;

      const pfpUrl = userInfo.profilePicUrlHd || userInfo.profile_pic_url_hd || userInfo.profilePicUrl;

      if (pfpUrl && pfpUrl.startsWith('http')) {
        try {
          const res = await axios.get(pfpUrl, { responseType: 'arraybuffer', timeout: 15000 });
          return message.reply({ body: msg, attachment: Buffer.from(res.data) });
        } catch (_) {}
      }
      return message.reply(msg);

    } catch (error) {
      logger.error('Error in userinfo command', { error: error.message });
      return message.reply(`❌ Error: ${error.message}`);
    }
  }
};
