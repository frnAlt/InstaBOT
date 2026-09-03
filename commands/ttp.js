const axios = require('axios');
const { createCanvas } = require('canvas');

module.exports = {
  config: {
    name: 'ttp',
    aliases: ['attp', 'stickertext', 'textpic'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 5,
    role: 0,
    category: 'Fun',
    description: 'Convert text to a custom picture / sticker graphic',
    usage: 'ttp <text>'
  },

  onStart: async function ({ api, event, args, message, logger }) {
    if (args.length === 0) {
      return message.reply('❌ Please provide text to convert into a picture/sticker.\nExample: !ttp Hello World');
    }

    const text = args.join(' ');
    api.setMessageReaction('⏳', event.messageID, () => {}, true);

    try {
      // Primary: Try Popcat TTP API
      const apiResult = `https://api.popcat.xyz/ttp?text=${encodeURIComponent(text)}`;
      const res = await axios.get(apiResult, { responseType: 'arraybuffer', timeout: 8000 });

      if (res.data) {
        api.setMessageReaction('✅', event.messageID, () => {}, true);
        return message.reply({
          body: `🎨 TTP Result:`,
          attachment: Buffer.from(res.data)
        });
      }
    } catch (_) {
      // Fallback: Generate local canvas TTP image
      try {
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, 512, 512);

        // Text styling
        ctx.fillStyle = '#3B82F6';
        ctx.shadowColor = '#60A5FA';
        ctx.shadowBlur = 15;
        ctx.font = 'bold 42px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Word wrap
        const words = text.split(' ');
        let line = '';
        const lines = [];
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 440 && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        const startY = 256 - ((lines.length - 1) * 25);
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i].trim(), 256, startY + (i * 50));
        }

        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
        api.setMessageReaction('✅', event.messageID, () => {}, true);
        return message.reply({
          body: `🎨 TTP Result:`,
          attachment: buffer
        });
      } catch (err) {
        logger.error('TTP Error:', err.message);
        api.setMessageReaction('❌', event.messageID, () => {}, true);
        return message.reply('❌ Failed to generate TTP image.');
      }
    }
  }
};
