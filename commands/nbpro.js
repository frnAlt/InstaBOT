const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'nbpro',
    aliases: ['nb', 'nanobanana'],
    description: 'Generate or edit images using Nano-banana Pro AI',
    usage: 'nbpro <prompt>  |  nbpro <prompt> (send with image to edit)',
    cooldown: 15,
    role: 0,
    author: 'Tawsif',
    category: 'ai'
  },

  async run({ api, event, args, logger }) {
    const prompt = args.join(' ');

    if (!prompt) {
      return api.sendMessage(
        '❌ Please provide a prompt.\n\nUsage:\n• nbpro <prompt> — generate image\n• nbpro <prompt> (send with image) — edit image',
        event.threadId
      );
    }

    await api.sendReaction('⏳', event.messageId);

    const photoAttachments = (event.attachments || []).filter(a =>
      a.type === 'photo' || a.type === 'image' || (a.url && /\.(jpg|jpeg|png|gif|webp)/i.test(a.url))
    );

    const tempDir = path.join(process.cwd(), 'temp');
    await fs.ensureDir(tempDir);
    const filePath = path.join(tempDir, `nbpro_${Date.now()}.png`);

    try {
      let imageUrl;

      if (photoAttachments.length > 0) {
        const imgUrls = JSON.stringify(photoAttachments.map(a => a.url));
        const res = await axios.get(
          `https://tawsif.is-a.dev/gemini/nano-banana-pro-edit?prompt=${encodeURIComponent(prompt)}&urls=${encodeURIComponent(imgUrls)}`,
          { timeout: 60000 }
        );
        imageUrl = res.data?.imageUrl;
      } else {
        const ratio = prompt.split('--ar=')[1] || prompt.split('--ar ')[1] || '1:1';
        const cleanPrompt = prompt.replace(/--ar[= ]\S+/g, '').trim();
        const res = await axios.get(
          `https://tawsif.is-a.dev/gemini/nano-banana-pro-gen?prompt=${encodeURIComponent(cleanPrompt)}&ratio=${ratio}`,
          { timeout: 60000 }
        );
        imageUrl = res.data?.imageUrl || res.data?.url || res.data?.result || res.data?.image || res.data?.data?.url;
      }

      if (!imageUrl) throw new Error('No image URL returned.');

      const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
      await fs.writeFile(filePath, Buffer.from(imgRes.data));

      await api.sendPhoto(filePath, event.threadId);
      await api.sendReaction('✅', event.messageId);
      fs.unlink(filePath).catch(() => {});
    } catch (error) {
      logger.error('nbpro error', { error: error.message });
      await api.sendReaction('❌', event.messageId);
      fs.unlink(filePath).catch(() => {});
      return api.sendMessage('❌ Failed to generate image. Please try again.', event.threadId);
    }
  }
};
