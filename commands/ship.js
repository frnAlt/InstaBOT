const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
  config: {
    name: 'ship',
    aliases: ['love', 'match', 'pair'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 5,
    role: 0,
    category: 'Fun',
    description: 'Calculate love compatibility between two users and generate a dual PFP canvas card',
    usage: 'ship @user1 [@user2] or reply to a message'
  },

  onStart: async function ({ event, message, api, args, usersData }) {
    const mentions = Object.keys(event.mentions || {});
    let user1 = event.senderID;
    let user2 = null;

    if (mentions.length >= 2) {
      user1 = mentions[0];
      user2 = mentions[1];
    } else if (mentions.length === 1) {
      user2 = mentions[0];
    } else if (event.messageReply && (event.messageReply.senderID || event.messageReply.senderId)) {
      user2 = event.messageReply.senderID || event.messageReply.senderId;
    }

    if (!user2 || user1 === user2) {
      return message.reply('❌ Please mention another user or reply to someone to ship with!\nExample: !ship @user');
    }

    api.setMessageReaction('💖', event.messageID, () => {}, true);

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

      // Calculate deterministic love score based on user IDs
      const combined = (parseInt(user1.slice(-5)) || 123) + (parseInt(user2.slice(-5)) || 456);
      const lovePercent = (combined % 51) + 50; // 50% to 100%

      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext('2d');

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 800, 400);
      bgGrad.addColorStop(0, '#1E1B4B');
      bgGrad.addColorStop(1, '#4C1D95');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 400);

      // Draw User 1 Avatar (Circle)
      ctx.save();
      ctx.beginPath();
      ctx.arc(180, 200, 100, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (img1) {
        ctx.drawImage(img1, 80, 100, 200, 200);
      } else {
        ctx.fillStyle = '#312E81';
        ctx.fillRect(80, 100, 200, 200);
        ctx.fillStyle = '#A5B4FC';
        ctx.font = 'bold 70px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((name1[0] || '?').toUpperCase(), 180, 225);
      }
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#EC4899';
      ctx.beginPath();
      ctx.arc(180, 200, 104, 0, Math.PI * 2);
      ctx.stroke();

      // Draw User 2 Avatar (Circle)
      ctx.save();
      ctx.beginPath();
      ctx.arc(620, 200, 100, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (img2) {
        ctx.drawImage(img2, 520, 100, 200, 200);
      } else {
        ctx.fillStyle = '#312E81';
        ctx.fillRect(520, 100, 200, 200);
        ctx.fillStyle = '#F472B6';
        ctx.font = 'bold 70px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((name2[0] || '?').toUpperCase(), 620, 225);
      }
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#F472B6';
      ctx.beginPath();
      ctx.arc(620, 200, 104, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Center Heart & Score
      ctx.fillStyle = '#F43F5E';
      ctx.shadowColor = '#FB7185';
      ctx.shadowBlur = 30;
      ctx.font = 'bold 70px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💖', 400, 190);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`${lovePercent}%`, 400, 250);

      // Names Footer
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#E0E7FF';
      ctx.fillText(`${name1} 💕 ${name2}`, 400, 350);

      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      api.setMessageReaction('💘', event.messageID, () => {}, true);

      return message.reply({
        body: `💘 **MATCHMAKER RESULT** 💘\n\n👤 ${name1} × 👤 ${name2}\n💖 **Love Compatibility:** ${lovePercent}%`,
        attachment: buffer
      });

    } catch (err) {
      console.error('Ship error:', err.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      return message.reply(`❌ Could not generate match card: ${err.message}`);
    }
  }
};
