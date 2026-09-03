const axios = require('axios');

const conversations = new Map();
const META_API = 'https://metakexbyneokex.vercel.app/chat';

module.exports = {
  config: {
    name: 'metaai',
    aliases: ['meta', 'llama'],
    description: 'Chat with Meta AI — text, image editing, and multi-turn conversations',
    usage: 'metaai <prompt> | metaai clear',
    cooldown: 5,
    role: 0,
    category: 'ai'
  },

  async onStart({ api, event, args, logger, message }) {
    try {
      const key = `${event.threadId}:${event.senderID}`;

      if (args[0]?.toLowerCase() === 'clear') {
        conversations.delete(key);
        return message.reply('Conversation history cleared.');
      }

      const prompt = args.join(' ').trim();
      let imageUrl = null;
      if (Array.isArray(event.attachments) && event.attachments.length > 0) {
        const photo = event.attachments.find(a => a.type === 'photo' || a.type === 'image');
        if (photo) imageUrl = photo.url;
      }

      if (!prompt && !imageUrl) {
        return message.reply('❌ Please provide a prompt or an image!');
      }

      message.reaction('⏳');
      const conversationId = conversations.get(key) || null;

      const params = {
        message: prompt || 'Analyze this image',
        new_conversation: conversationId ? 'false' : 'true'
      };
      if (conversationId) params.conversation_id = conversationId;
      if (imageUrl) params.img_url = imageUrl;

      const data = response.data || {};
      const replyText = data.message || data.reply || data.response || data.result;
      const image_urls = data.image_urls || data.images || [];
      const conversation_id = data.conversation_id || data.id;

      if (!replyText) throw new Error('Meta AI API returned an empty response');

      const cleaned = String(replyText).trim();
      if (cleaned.startsWith('<') || /<!DOCTYPE|<html|<head|<script|cloudflare|just a moment|fingerprint/i.test(cleaned)) {
        throw new Error('Meta AI API returned Cloudflare/HTML payload');
      }

      if (conversation_id) conversations.set(key, conversation_id);

      message.reaction('✅');
      message.reply(cleaned);

      if (Array.isArray(image_urls) && image_urls.length > 0) {
        for (const imgUrl of image_urls) {
          await api.sendPhotoFromUrl(event.threadId, imgUrl);
        }
      }

    } catch (error) {
      logger.error('metaai error', { error: error.message });
      message.reaction('❌');
      return message.reply(`❌ Error: ${error.message}`);
    }
  }
};
