const axios = require('axios');

module.exports = {
  config: {
    name: 'i',
    version: '1.2',
    author: 'JARiF@Cock',
    cooldown: 5,
    role: 0,
    description: 'Generate multiple AI images from text',
    category: 'ai-image',
    usage: 'i <prompt> | [quantity]'
  },

  onStart: async function ({ api, args, message, event }) {
    const text = args.join(' ');
    if (!text) return message.reply('⚠️ Please provide a prompt.');

    let prompt, quantity;
    if (text.includes('|')) {
      [prompt, quantity] = text.split('|').map(str => str.trim());
      quantity = parseInt(quantity);
      if (isNaN(quantity) || quantity < 1 || quantity > 10) {
        return message.reply('⚠️ Quantity must be a number between 1 and 10.');
      }
    } else {
      prompt = text;
      quantity = 4;
    }

    api.setMessageReaction('⏳', event.messageID, () => {}, true);
    const waitingMessage = await message.reply(`✅ | Generating ${quantity} image(s)...`);

    try {
      const imageUrls = [];
      const ratio = '1:1';

      for (let i = 0; i < quantity; i++) {
        try {
          const res = await axios.get(`https://www.ai4chat.co/api/image/generate`, {
            params: { prompt, aspect_ratio: ratio }
          });
          const link = res.data?.image_link || res.data?.imageUrl || res.data?.url || res.data?.result || res.data?.data?.url;
          if (link) {
            imageUrls.push(link);
          }
        } catch (e) {
          console.error(`Image ${i} failed:`, e.message);
        }
      }

      if (imageUrls.length === 0) throw new Error('Failed to generate any images');

      await message.reply({
        body: `✅ | Generated ${imageUrls.length} image(s) for: "${prompt}"`,
        attachment: imageUrls
      });

      api.setMessageReaction('✅', event.messageID, () => {}, true);
      api.unsendMessage(waitingMessage.messageID);
    } catch (error) {
      console.error('i error:', error.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      message.reply('❌ Failed to generate images.');
    }
  }
};
