const axios = require('axios');

module.exports = {
  config: {
    name: 'veo',
    version: '1.2.0',
    author: 'Ajmaul',
    cooldown: 5,
    role: 0,
    description: 'Generate a video from a text prompt',
    category: 'ai-video',
    usage: 'veo <prompt>'
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(' ').trim();
    if (!prompt) return message.reply('❌ Usage: veo <prompt>\nExample: veo A cute girl dancing in rain ☔');

    const waitMsg = await message.reply('🎥 Generating video, please wait...');
    api.setMessageReaction('⏳', event.messageID, () => {}, true);

    try {
      const apiUrl = `https://mahbub-ullash.cyberbot.top/api/txt2video?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);
      const data = response.data || {};

      const videoUrl = data.video || data.url || data.videoUrl || data.result || data.data?.video;
      if (!videoUrl) {
        throw new Error('No video returned from API');
      }

      await message.reply({
        body: `✅ Video generation complete!\n🎬 Prompt: ${prompt}\n👨‍💻 Operator: ${data.operator || 'Unknown'}`,
        attachment: data.video
      });
      api.setMessageReaction('✅', event.messageID, () => {}, true);
      api.unsendMessage(waitMsg.messageID);
    } catch (err) {
      console.error('Veo error:', err.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      return message.reply(`❌ Error: ${err.message}`);
    }
  }
};
