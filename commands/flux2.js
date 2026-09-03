const axios = require('axios');

module.exports = {
  config: {
    name: 'flux2',
    aliases: ['fluxv2'],
    version: '3.0',
    author: 'nexo_here',
    cooldown: 10,
    role: 0,
    description: 'Generate AI image using Flux v2 API',
    category: 'ai-image',
    usage: 'flux2 <prompt>'
  },

  onStart: async function ({ message, args, api, event }) {
    const prompt = args.join(' ');
    if (!prompt) return message.reply('⚠️ Please provide a prompt!');

    message.reply('⏰ Generating image with Flux v2...');
    api.setMessageReaction('⏳', event.messageID, () => {}, true);

    try {
      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/fluxv2?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(apiUrl);
      const imageUrl = res.data.imageUrl || res.data.url || res.data.image || res.data.result || (res.data.data && (res.data.data.url || res.data.data.imageUrl));

      if (!imageUrl) throw new Error('No image URL found');

      await message.reply({
        body: `🖼️ Prompt: ${prompt}`,
        attachment: imageUrl
      });
      api.setMessageReaction('✅', event.messageID, () => {}, true);
    } catch (err) {
      console.error('Flux v2 error:', err.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      return message.reply('❌ Failed to generate image. Please try again later.');
    }
  }
};
