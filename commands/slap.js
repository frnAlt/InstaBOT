const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
  config: {
    name: 'slap',
    aliases: ['batslap'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 5,
    role: 0,
    category: 'Fun',
    description: 'Slap a user with a custom Canvas Batman & Robin slap meme',
    usage: 'slap @user or reply to a message'
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const mentions = Object.keys(event.mentions || {});
    let user1 = event.senderID;
    let user2 = mentions[0] || (event.messageReply ? (event.messageReply.senderID || event.messageReply.senderId) : (args[0] ? args[0].replace(/^@+/, '') : null));

    if (!user2 || user1 === user2) {
      return message.reply('❌ Please mention or reply to someone to slap!\nExample: !slap @user');
    }

    api.setMessageReaction('👋', event.messageID, () => {}, true);

    try {
      const name1 = await usersData.getName(user1);
      const name2 = await usersData.getName(user2);

      let img1 = null, img2 = null;

      try {
        const u1 = await api.getAvatarUrl(user1);
        if (u1 && u1.startsWith('http')) {
          const res1 = await axios.get(u1, { responseType: 'arraybuffer', timeout: 10000 });
          img1 = await loadImage(Buffer.from(res1.data));
        }
      } catch (_) {}

      try {
        const u2 = await api.getAvatarUrl(user2);
        if (u2 && u2.startsWith('http')) {
          const res2 = await axios.get(u2, { responseType: 'arraybuffer', timeout: 10000 });
          img2 = await loadImage(Buffer.from(res2.data));
        }
      } catch (_) {}

      const canvas = createCanvas(700, 400);
      const ctx = canvas.getContext('2d');

      // Background comic panel split
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(0, 0, 700, 400);

      // Batman Slapper (Left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 160, 90, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (img1) {
        ctx.drawImage(img1, 110, 70, 180, 180);
      } else {
        ctx.fillStyle = '#1E3A8A';
        ctx.fillRect(110, 70, 180, 180);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 60px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((name1[0] || '?').toUpperCase(), 200, 180);
      }
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#1E3A8A';
      ctx.beginPath();
      ctx.arc(200, 160, 94, 0, Math.PI * 2);
      ctx.stroke();

      // Robin Slapped (Right)
      ctx.save();
      ctx.beginPath();
      ctx.arc(500, 200, 80, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (img2) {
        ctx.drawImage(img2, 420, 120, 160, 160);
      } else {
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(420, 120, 160, 160);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 50px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((name2[0] || '?').toUpperCase(), 500, 220);
      }
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(500, 200, 84, 0, Math.PI * 2);
      ctx.stroke();

      // Slap Action Text
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 15;
      ctx.font = 'italic bold 55px impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👋 SLAP!', 350, 90);

      // Bottom Banner
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 320, 700, 80);
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#F3F4F6';
      ctx.fillText(`💥 ${name1} slapped ${name2}!`, 350, 365);

      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      api.setMessageReaction('✅', event.messageID, () => {}, true);

      return message.reply({
        body: `💥 ${name1} gave ${name2} a hard slap! 👋`,
        attachment: buffer
      });
    } catch (err) {
      console.error('Slap error:', err.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      return message.reply(`❌ Could not generate slap meme: ${err.message}`);
    }
  }
};
