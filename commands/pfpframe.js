const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
  config: {
    name: 'pfpframe',
    aliases: ['frame', 'avatarframe', 'pfpring'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 5,
    role: 0,
    category: 'Fun',
    description: 'Fetch user PFP and overlay custom glowing neon / VIP / Gold canvas frames',
    usage: 'pfpframe [@mention / reply] [neon|gold|cyber|vip]'
  },

  onStart: async function ({ event, message, api, args, usersData }) {
    let targetArg = args.find(a => !['neon', 'gold', 'cyber', 'vip', 'fire', 'rainbow', 'diamond', 'anime'].includes(a.toLowerCase()));
    let mentionID = Object.keys(event.mentions || {})[0] || (event.messageReply ? (event.messageReply.senderID || event.messageReply.senderId) : (targetArg ? targetArg.replace(/^@+/, '') : event.senderID));
    let frameStyle = (args.find(a => ['neon', 'gold', 'cyber', 'vip', 'fire', 'rainbow', 'diamond', 'anime'].includes(a.toLowerCase())) || 'neon').toLowerCase();

    api.setMessageReaction('⏳', event.messageID, () => {}, true);

    try {
      const rawName = await usersData.getName(mentionID);
      let avatar = null;
      try {
        const photoUrl = await api.getAvatarUrl(mentionID);
        if (photoUrl && photoUrl.startsWith('http')) {
          const res = await axios.get(photoUrl, { responseType: 'arraybuffer', timeout: 10000 });
          avatar = await loadImage(Buffer.from(res.data));
        }
      } catch (_) {}

      const size = 600;
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, size, size);

      // Circular Avatar Clip
      const center = size / 2;
      const radius = 220;

      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      if (avatar) {
        ctx.drawImage(avatar, center - radius, center - radius, radius * 2, radius * 2);
      } else {
        ctx.fillStyle = '#334155';
        ctx.fillRect(center - radius, center - radius, radius * 2, radius * 2);
        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 120px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((rawName[0] || '?').toUpperCase(), center, center + 40);
      }
      ctx.restore();

      // Render Frame Overlay
      ctx.lineWidth = 18;
      if (frameStyle === 'gold') {
        ctx.strokeStyle = '#F59E0B';
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 25;
      } else if (frameStyle === 'cyber') {
        ctx.strokeStyle = '#8B5CF6';
        ctx.shadowColor = '#C084FC';
        ctx.shadowBlur = 25;
      } else if (frameStyle === 'vip') {
        ctx.strokeStyle = '#EF4444';
        ctx.shadowColor = '#F87171';
        ctx.shadowBlur = 25;
      } else if (frameStyle === 'fire') {
        ctx.strokeStyle = '#F97316';
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 30;
      } else if (frameStyle === 'diamond') {
        ctx.strokeStyle = '#06B6D4';
        ctx.shadowColor = '#67E8F9';
        ctx.shadowBlur = 30;
      } else if (frameStyle === 'rainbow') {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.2, 'orange');
        gradient.addColorStop(0.4, 'yellow');
        gradient.addColorStop(0.6, 'green');
        gradient.addColorStop(0.8, 'blue');
        gradient.addColorStop(1, 'violet');
        ctx.strokeStyle = gradient;
        ctx.shadowColor = '#E0E7FF';
        ctx.shadowBlur = 25;
      } else if (frameStyle === 'anime') {
        ctx.strokeStyle = '#EC4899';
        ctx.shadowColor = '#F472B6';
        ctx.shadowBlur = 30;
      } else {
        // Neon default
        ctx.strokeStyle = '#3B82F6';
        ctx.shadowColor = '#60A5FA';
        ctx.shadowBlur = 30;
      }

      ctx.beginPath();
      ctx.arc(center, center, radius + 10, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Outer Accent Ring
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(center, center, radius + 25, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Badge Label
      ctx.fillStyle = typeof ctx.strokeStyle === 'string' ? ctx.strokeStyle : '#3B82F6';
      ctx.shadowBlur = 10;
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✨ ${frameStyle.toUpperCase()} FRAME • ${rawName.toUpperCase()} ✨`, center, size - 35);

      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      api.setMessageReaction('✅', event.messageID, () => {}, true);

      return message.reply({
        body: `🖼️ Customized PFP Frame [${frameStyle.toUpperCase()}] for ${rawName}:`,
        attachment: buffer
      });
    } catch (err) {
      console.error('PFPFrame error:', err.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      return message.reply(`❌ Could not generate frame: ${err.message}`);
    }
  }
};
