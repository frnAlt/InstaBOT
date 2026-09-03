const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
  config: {
    name: 'rip',
    aliases: ['tombstone', 'grave'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 5,
    role: 0,
    category: 'Fun',
    description: 'Generate a R.I.P. tombstone canvas poster for a target user',
    usage: 'rip @user or reply to a message'
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    let targetID = Object.keys(event.mentions || {})[0] || (event.messageReply ? (event.messageReply.senderID || event.messageReply.senderId) : (args[0] ? args[0].replace(/^@+/, '') : event.senderID));

    api.setMessageReaction('🪦', event.messageID, () => {}, true);

    try {
      const rawName = await usersData.getName(targetID);
      let avatar = null;
      try {
        const photoUrl = await api.getAvatarUrl(targetID);
        if (photoUrl && photoUrl.startsWith('http')) {
          const res = await axios.get(photoUrl, { responseType: 'arraybuffer', timeout: 10000 });
          avatar = await loadImage(Buffer.from(res.data));
        }
      } catch (_) {}

      const width = 600;
      const height = 750;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Background Tombstone Grayscale
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, width, height);

      // Draw Tombstone Arch
      ctx.fillStyle = '#3F3F46';
      ctx.beginPath();
      ctx.arc(300, 220, 220, Math.PI, 0, false);
      ctx.lineTo(520, 650);
      ctx.lineTo(80, 650);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = 10;
      ctx.strokeStyle = '#71717A';
      ctx.stroke();

      // R.I.P. Header Text
      ctx.fillStyle = '#E4E4E7';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.font = 'bold 70px serif';
      ctx.textAlign = 'center';
      ctx.fillText('R. I. P.', 300, 150);

      // User Grayscale Avatar Clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(300, 310, 90, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (avatar) {
        ctx.drawImage(avatar, 210, 220, 180, 180);
      } else {
        ctx.fillStyle = '#27272A';
        ctx.fillRect(210, 220, 180, 180);
        ctx.fillStyle = '#A1A1AA';
        ctx.font = 'bold 70px serif';
        ctx.fillText((rawName[0] || '?').toUpperCase(), 300, 335);
      }
      ctx.restore();

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#A1A1AA';
      ctx.beginPath();
      ctx.arc(300, 310, 94, 0, Math.PI * 2);
      ctx.stroke();

      // User Name & Memory
      ctx.fillStyle = '#F4F4F5';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(rawName.toUpperCase(), 300, 470);

      ctx.font = 'italic 22px serif';
      ctx.fillStyle = '#A1A1AA';
      ctx.fillText('In Loving Memory', 300, 520);
      ctx.fillText('Gone but never forgotten 🌹', 300, 560);

      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      api.setMessageReaction('✅', event.messageID, () => {}, true);

      return message.reply({
        body: `🪦 Rest In Peace, ${rawName} 🌹`,
        attachment: buffer
      });
    } catch (err) {
      console.error('RIP error:', err.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      return message.reply(`❌ Could not generate RIP card: ${err.message}`);
    }
  }
};
