const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
  config: {
    name: 'jail',
    version: '8.0',
    author: 'Ajmaul',
    cooldown: 10,
    role: 0,
    description: 'WANTED poster with thin bars',
    category: 'fun',
    usage: 'jail [@tag or reply]'
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    let uid;
    const mentions = Object.keys(event.mentions || {});
    if (mentions.length > 0) {
      uid = mentions[0];
    } else if (event.messageReply && (event.messageReply.senderID || event.messageReply.senderId)) {
      uid = event.messageReply.senderID || event.messageReply.senderId;
    } else if (args && args.length > 0) {
      uid = args[0].replace(/^@+/, '');
    } else {
      uid = event.senderID;
    }

    api.setMessageReaction('⏳', event.messageID, () => {}, true);

    try {
      const name = await usersData.getName(uid);
      let avatar = null;
      try {
        const photoUrl = await api.getAvatarUrl(uid);
        if (photoUrl && photoUrl.startsWith('http')) {
          const res = await axios.get(photoUrl, { responseType: 'arraybuffer', timeout: 10000 });
          avatar = await loadImage(Buffer.from(res.data));
        }
      } catch (_) {}

      const width = 600;
      const height = 800;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Dark Blue BG
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // WANTED
      ctx.font = 'bold 100px Arial';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#991b1b';
      ctx.shadowBlur = 20;
      ctx.fillText('WANTED', width / 2, 120);
      ctx.shadowColor = 'transparent';

      // Avatar Circle (Clear)
      const centerX = width / 2;
      const centerY = height / 2 + 20;
      const radius = 200;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();
      if (avatar) {
        ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 100px Arial';
        ctx.fillText((name[0] || '?').toUpperCase(), centerX, centerY + 30);
      }
      ctx.restore();

      // Thin Bars
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';

      const barCount = 8;
      const barSpacing = width / (barCount + 1);
      for (let i = 1; i <= barCount; i++) {
        const x = i * barSpacing;
        ctx.beginPath();
        ctx.moveTo(x, 180);
        ctx.lineTo(x, height - 180);
        ctx.stroke();
      }

      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(barSpacing, 260);
      ctx.lineTo(width - barSpacing, 260);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(barSpacing, height - 260);
      ctx.lineTo(width - barSpacing, height - 260);
      ctx.stroke();

      ctx.globalAlpha = 1.0;

      ctx.font = 'italic 50px "Segoe UI"';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 20;
      ctx.fillText('Locked Up!', width / 2, height - 100);
      ctx.shadowColor = 'transparent';

      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(name.toUpperCase(), width / 2, height - 50);

      await message.reply({
        body: `@${name} WANTED! 🔒 Locked Up! (Clear view)`,
        mentions: [{ tag: name, id: uid }],
        attachment: canvas.toBuffer('image/jpeg', { quality: 0.9 })
      });
      api.setMessageReaction('✅', event.messageID, () => {}, true);
    } catch (error) {
      console.error('Jail error:', error.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      message.reply('⚠️ Error generating jail poster!');
    }
  }
};
