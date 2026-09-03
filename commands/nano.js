const axios = require('axios');

module.exports = {
  config: {
    name: 'nano',
    aliases: ['aiedit', 'editphoto', 'nanoedit'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 8,
    role: 0,
    category: 'ai-image',
    description: 'AI Image Editor: Reply to an image to modify it (e.g. 4k enhance, anime style, cyberpunk)',
    usage: 'nano <edit instructions> (reply to an image)'
  },

  onStart: async function ({ api, event, args, message, logger }) {
    let imageUrl = null;

    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      const att = event.messageReply.attachments.find(a => a.type === 'photo' || a.type === 'image');
      if (att) imageUrl = att.url;
    } else if (args[0] && args[0].startsWith('http')) {
      imageUrl = args.shift();
    }

    if (!imageUrl) {
      return message.reply('❌ Please reply to an image with your AI edit instructions!\nExample: !nano make the photo guy 4k');
    }

    const editInstruction = args.join(' ') || 'high quality 4k enhanced detailed photograph';
    message.reply(`🎨 | Processing AI Photo Edit: "${editInstruction}", please wait...`);
    api.setMessageReaction('⏳', event.messageID, () => {}, true);

    try {
      const fullPrompt = `${editInstruction}, masterpiece, 8k resolution, ultra detailed`;
      const editedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?image=${encodeURIComponent(imageUrl)}&seed=${Date.now()}&nologo=true`;

      api.setMessageReaction('✅', event.messageID, () => {}, true);
      return message.reply({
        body: `✨ **AI Photo Edit Result**\n\n📝 **Instruction:** ${editInstruction}`,
        attachment: editedImageUrl
      });

    } catch (err) {
      logger.error('Nano AI edit error:', err.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      return message.reply(`❌ Failed to edit photo: ${err.message}`);
    }
  }
};
