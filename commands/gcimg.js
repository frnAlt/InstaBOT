const axios = require('axios');

module.exports = {
  config: {
    name: 'gcimg',
    aliases: ['gcimage', 'grpimage'],
    version: '1.1',
    author: 'nexo_here',
    cooldown: 5,
    role: 0,
    description: 'Generate a styled group image with profile pictures',
    category: 'image',
    usage: 'gcimg [--color white] [--bgcolor black] [--admincolor red] [--membercolor cyan] [--groupBorder lime] [--glow true]'
  },

  onStart: async function ({ api, args, event, message, bot }) {
    try {
      let textColor = 'white';
      let bgColor = null;
      let adminColor = 'yellow';
      let memberColor = 'cyan';
      let borderColor = 'lime';
      let glow = false;

      for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
          case '--color': textColor = args[i + 1]; i++; break;
          case '--bgcolor': bgColor = args[i + 1]; i++; break;
          case '--admincolor': adminColor = args[i + 1]; i++; break;
          case '--membercolor': memberColor = args[i + 1]; i++; break;
          case '--groupBorder': borderColor = args[i + 1]; i++; break;
          case '--glow': glow = args[i + 1]?.toLowerCase() === 'true'; i++; break;
        }
      }

      const threadInfo = await (api?.getThreadInfo ? api.getThreadInfo(event.threadId) : (bot?.getThreadInfo ? bot.getThreadInfo(event.threadId) : {})).catch(() => ({})) || {};
      const participantIDs = threadInfo.participantIDs || threadInfo.participants || [];
      const adminIDs = (threadInfo.adminIDs || []).map(admin => typeof admin === 'object' ? admin.id || admin.userID : admin);

      const getAvatarUrl = async (id) => {
        try {
          const infoMap = await api.getUserInfo(id);
          const info = infoMap && (infoMap[id] || Object.values(infoMap)[0]);
          return info?.profilePicUrlHd || info?.hdProfilePicUrlInfo?.url || info?.profile_pic_url_hd || info?.profilePicUrl || 'https://example.com/avatar.jpg';
        } catch (_) {
          return 'https://example.com/avatar.jpg';
        }
      };

      const memberAvatars = await Promise.all(participantIDs.map(id => getAvatarUrl(id)));
      const adminAvatars = await Promise.all(adminIDs.map(id => getAvatarUrl(id)));

      const payload = {
        groupName: threadInfo.threadName,
        groupPhotoURL: threadInfo.imageSrc,
        memberURLs: memberAvatars,
        adminURLs: adminAvatars,
        color: textColor,
        bgcolor: bgColor,
        admincolor: adminColor,
        membercolor: memberColor,
        groupborderColor: borderColor,
        glow
      };

      message.reply('🛠️ | Generating group image, please wait...');
      api.setMessageReaction('⏳', event.messageID, () => {}, true);

      const baseApiUrlRes = await axios.get('https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json');
      const baseApiUrl = baseApiUrlRes.data.api;

      const response = await axios.post(`${baseApiUrl}/gcimg`, payload, { responseType: 'arraybuffer' });

      await message.reply({
        body: '✨ | Here\'s your group image:',
        attachment: Buffer.from(response.data, 'binary')
      });
      api.setMessageReaction('✅', event.messageID, () => {}, true);
    } catch (err) {
      console.error('[gcimg] Error:', err);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      return message.reply(`❌ | An error occurred: ${err.message}`);
    }
  }
};
