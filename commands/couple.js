const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

module.exports = {
  config: {
    name: 'couple',
    aliases: ['coupleframe', 'pairframe', 'couples'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 5,
    role: 0,
    category: 'Fun',
    description: 'Create a custom dual PFP side-by-side couple frame (Auto-selects random group couple if no users tagged)',
    usage: 'couple | couple @user | couple @user1 @user2'
  },

  onStart: async function ({ api, event, args, message, usersData, threadsData }) {
    const threadID = event.threadId || event.threadID;
    const senderID = event.senderID;
    const mentions = Object.keys(event.mentions || {});

    let user1 = senderID;
    let user2 = null;

    if (mentions.length >= 2) {
      user1 = mentions[0];
      user2 = mentions[1];
    } else if (mentions.length === 1) {
      user2 = mentions[0];
    } else if (event.messageReply && (event.messageReply.senderID || event.messageReply.senderId)) {
      user2 = event.messageReply.senderID || event.messageReply.senderId;
    } else if (args && args.length >= 2) {
      user1 = args[0].replace(/^@+/, '');
      user2 = args[1].replace(/^@+/, '');
    } else if (args && args.length === 1) {
      user2 = args[0].replace(/^@+/, '');
    } else {
      // Auto-select random active group members if no user specified
      try {
        const threadInfo = await api.getThread(threadID).catch(() => null);
        let members = threadInfo?.participantIDs || [];
        members = members.filter(id => id !== api.getCurrentUserID());

        if (members.length >= 2) {
          const idx1 = Math.floor(Math.random() * members.length);
          user1 = members[idx1];
          members.splice(idx1, 1);
          user2 = members[Math.floor(Math.random() * members.length)];
        } else if (members.length === 1) {
          user2 = members[0];
        }
      } catch (_) {}
    }

    if (!user2 || user1 === user2) {
      return message.reply('❌ Not enough members in this thread to make a couple frame!');
    }

    api.setMessageReaction('💑', event.messageID, () => {}, true);

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

      const lovePercent = Math.floor(Math.random() * 31) + 70; // 70% to 100%

      const canvas = createCanvas(900, 450);
      const ctx = canvas.getContext('2d');

      // Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 900, 450);
      bgGrad.addColorStop(0, '#4C1D95');
      bgGrad.addColorStop(0.5, '#831843');
      bgGrad.addColorStop(1, '#BE185D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 900, 450);

      // User 1 Avatar Frame (Left)
      const radius = 110;
      ctx.save();
      ctx.beginPath();
      ctx.arc(220, 210, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (img1) {
        ctx.drawImage(img1, 220 - radius, 210 - radius, radius * 2, radius * 2);
      } else {
        ctx.fillStyle = '#312E81';
        ctx.fillRect(220 - radius, 210 - radius, radius * 2, radius * 2);
        ctx.fillStyle = '#C084FC';
        ctx.font = 'bold 80px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((name1[0] || '?').toUpperCase(), 220, 240);
      }
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#F472B6';
      ctx.shadowColor = '#F472B6';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(220, 210, radius + 4, 0, Math.PI * 2);
      ctx.stroke();

      // User 2 Avatar Frame (Right)
      ctx.save();
      ctx.beginPath();
      ctx.arc(680, 210, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      if (img2) {
        ctx.drawImage(img2, 680 - radius, 210 - radius, radius * 2, radius * 2);
      } else {
        ctx.fillStyle = '#312E81';
        ctx.fillRect(680 - radius, 210 - radius, radius * 2, radius * 2);
        ctx.fillStyle = '#F472B6';
        ctx.font = 'bold 80px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((name2[0] || '?').toUpperCase(), 680, 240);
      }
      ctx.restore();

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#FB7185';
      ctx.shadowColor = '#FB7185';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(680, 210, radius + 4, 0, Math.PI * 2);
      ctx.stroke();

      // Center Love Heart & Score
      ctx.fillStyle = '#F43F5E';
      ctx.shadowColor = '#FDA4AF';
      ctx.shadowBlur = 30;
      ctx.font = 'bold 80px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💑', 450, 200);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`${lovePercent}%`, 450, 260);

      // Bottom Banner Label
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(0, 370, 900, 80);

      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#FCE7F3';
      ctx.fillText(`✨ PERFECT COUPLE • ${name1.toUpperCase()} 💞 ${name2.toUpperCase()} ✨`, 450, 420);

      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
      api.setMessageReaction('💖', event.messageID, () => {}, true);

      return message.reply({
        body: `👩‍❤️‍👨 **PERFECT GROUP COUPLE** 👩‍❤️‍👨\n\n👤 ${name1} × 👤 ${name2}\n💖 **Love Compatibility:** ${lovePercent}%`,
        attachment: buffer
      });
    } catch (err) {
      console.error('Couple error:', err.message);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
      return message.reply(`❌ Could not generate couple frame: ${err.message}`);
    }
  }
};
