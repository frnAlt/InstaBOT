const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
  config: {
    name: 'gay',
    version: '2.0',
    author: 'Jisan && frnAlt',
    cooldown: 2,
    role: 0,
    description: 'Generate a dual PFP rainbow canvas image.',
    category: 'fun',
    usage: 'gay @mention @mention OR gay @mention OR reply'
  },

  onStart: async function ({ api, event, message, args, usersData }) {
    try {
      const mentions = Object.keys(event.mentions || {});
      let uid1, uid2;

      if (mentions.length >= 2) {
        uid1 = mentions[0];
        uid2 = mentions[1];
      } else if (mentions.length === 1) {
        uid1 = event.senderID;
        uid2 = mentions[0];
      } else if (event.messageReply && (event.messageReply.senderID || event.messageReply.senderId)) {
        uid1 = event.senderID;
        uid2 = event.messageReply.senderID || event.messageReply.senderId;
      } else if (args.length >= 2) {
        uid1 = args[0].replace(/^@+/, '');
        uid2 = args[1].replace(/^@+/, '');
      } else if (args.length === 1) {
        uid1 = event.senderID;
        uid2 = args[0].replace(/^@+/, '');
      } else {
        return message.reply('Please reply to a message or mention one or two users.');
      }

      api.setMessageReaction('⏳', event.messageID, () => {}, true);
      const name1 = await usersData.getName(uid1);
      const name2 = await usersData.getName(uid2);

      let img1 = null, img2 = null;

      try {
        const u1 = await api.getAvatarUrl(uid1);
        if (u1 && u1.startsWith('http')) {
          const res1 = await axios.get(u1, { responseType: 'arraybuffer', timeout: 10000 });
          img1 = await loadImage(Buffer.from(res1.data));
        }
      } catch (_) {}

      try {
        const u2 = await api.getAvatarUrl(uid2);
        if (u2 && u2.startsWith('http')) {
          const res2 = await axios.get(u2, { responseType: 'arraybuffer', timeout: 10000 });
          img2 = await loadImage(Buffer.from(res2.data));
        }
      } catch (_) {}

      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext('2d');

      // Background Rainbow Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 800, 400);
      bgGrad.addColorStop(0, '#FF0000');
      bgGrad.addColorStop(0.2, '#FF7F00');
      bgGrad.addColorStop(0.4, '#FFFF00');
      bgGrad.addColorStop(0.6, '#00FF00');
      bgGrad.addColorStop(0.8, '#0000FF');
      bgGrad.addColorStop(1, '#8B00FF');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 400);

      // User 1 Avatar (Circular Clip)
      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 180, 100, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (img1) {
        ctx.drawImage(img1, 100, 80, 200, 200);
      } else {
        ctx.fillStyle = '#312E81';
        ctx.fillRect(100, 80, 200, 200);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 70px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((name1[0] || '?').toUpperCase(), 200, 205);
      }
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(200, 180, 104, 0, Math.PI * 2);
      ctx.stroke();

      // User 2 Avatar (Circular Clip)
      ctx.save();
      ctx.beginPath();
      ctx.arc(600, 180, 100, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (img2) {
        ctx.drawImage(img2, 500, 80, 200, 200);
      } else {
        ctx.fillStyle = '#831843';
        ctx.fillRect(500, 80, 200, 200);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 70px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((name2[0] || '?').toUpperCase(), 600, 205);
      }
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(600, 180, 104, 0, Math.PI * 2);
      ctx.stroke();

      // Center Heart & Rainbow Badge
      ctx.font = 'bold 60px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💋', 400, 190);

      // Bottom Banner Label
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 320, 800, 80);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`🌈 ${name1} × ${name2} 🌈`, 400, 365);

      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      api.setMessageReaction('✅', event.messageID, () => {}, true);

      return message.reply({
        body: `Oh yeah ${name1} 💋 ${name2}`,
        attachment: buffer
      });
    } catch (e) {
      console.error('Gay error:', e.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      message.reply('❌ Couldn\'t generate image. Try again later.');
    }
  }
};
