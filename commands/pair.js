const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
  config: {
    name: 'pair',
    aliases: ['pairlove', 'randompair', 'soulmate'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 5,
    role: 0,
    category: 'Fun',
    description: 'Find your random group soulmate pair and generate a dual PFP love card',
    usage: 'pair'
  },

  onStart: async function ({ api, event, message, usersData, threadsData }) {
    const threadID = event.threadId || event.threadID;
    const senderID = event.senderID;

    api.setMessageReaction('💘', event.messageID, () => {}, true);

    try {
      const threadInfo = await api.getThread(threadID).catch(() => null);
      let participantIDs = threadInfo?.participantIDs || [];

      // Filter out bot ID and self
      participantIDs = participantIDs.filter(id => id !== senderID && id !== api.getCurrentUserID());

      if (participantIDs.length === 0) {
        return message.reply('❌ Not enough members in this thread to pair up!');
      }

      // Pick random soulmate
      const soulmateID = participantIDs[Math.floor(Math.random() * participantIDs.length)];

      const name1 = await usersData.getName(senderID);
      const name2 = await usersData.getName(soulmateID);

      let img1 = null, img2 = null;

      try {
        const u1 = await api.getAvatarUrl(senderID);
        if (u1 && u1.startsWith('http')) {
          const res1 = await axios.get(u1, { responseType: 'arraybuffer', timeout: 10000 });
          img1 = await loadImage(Buffer.from(res1.data));
        }
      } catch (_) {}

      try {
        const u2 = await api.getAvatarUrl(soulmateID);
        if (u2 && u2.startsWith('http')) {
          const res2 = await axios.get(u2, { responseType: 'arraybuffer', timeout: 10000 });
          img2 = await loadImage(Buffer.from(res2.data));
        }
      } catch (_) {}

      const lovePercent = Math.floor(Math.random() * 41) + 60; // 60% to 100%

      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext('2d');

      // Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 800, 400);
      bgGrad.addColorStop(0, '#831843');
      bgGrad.addColorStop(1, '#BE185D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 400);

      // User 1 Avatar (Circle)
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
        ctx.fillStyle = '#FCE7F3';
        ctx.font = 'bold 70px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((name1[0] || '?').toUpperCase(), 180, 225);
      }
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#F472B6';
      ctx.beginPath();
      ctx.arc(180, 200, 104, 0, Math.PI * 2);
      ctx.stroke();

      // User 2 Avatar (Circle)
      ctx.save();
      ctx.beginPath();
      ctx.arc(620, 200, 100, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (img2) {
        ctx.drawImage(img2, 520, 100, 200, 200);
      } else {
        ctx.fillStyle = '#831843';
        ctx.fillRect(520, 100, 200, 200);
        ctx.fillStyle = '#FCE7F3';
        ctx.font = 'bold 70px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((name2[0] || '?').toUpperCase(), 620, 225);
      }
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#FB7185';
      ctx.beginPath();
      ctx.arc(620, 200, 104, 0, Math.PI * 2);
      ctx.stroke();

      // Heart & Percentage
      ctx.fillStyle = '#F43F5E';
      ctx.shadowColor = '#FDA4AF';
      ctx.shadowBlur = 30;
      ctx.font = 'bold 70px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💖', 400, 190);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`${lovePercent}%`, 400, 250);

      // Footer
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#FCE7F3';
      ctx.fillText(`${name1} 💕 ${name2}`, 400, 350);

      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      api.setMessageReaction('💘', event.messageID, () => {}, true);

      return message.reply({
        body: `💘 **GROUP SOULMATE PAIR** 💘\n\n👤 ${name1} × 👤 ${name2}\n💖 **Love Match:** ${lovePercent}%`,
        attachment: buffer
      });
    } catch (err) {
      console.error('Pair error:', err.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      return message.reply(`❌ Could not generate pair card: ${err.message}`);
    }
  }
};
