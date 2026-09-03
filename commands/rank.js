const Canvas = require("canvas");
const path = require("path");
const utils = require("../utils.js");

const defaultFontName = "sans-serif";

module.exports = {
  config: {
    name: "rank",
    version: "1.8",
    author: "NTKhang, Gtajisan && frnAlt",
    cooldown: 5,
    role: 0,
    description: "View your level or the level of the tagged person",
    category: "rank"
  },

  async onStart({ api, event, args, usersData, database, message }) {
    let targetID = event.senderID;
    if (args.length > 0) {
        if (/^\d+$/.test(args[0])) targetID = args[0];
        else {
            try {
                const info = await api.getUserInfoByUsername(args[0].replace('@', ''));
                if (info) targetID = info.userID || info.userId || info.pk;
            } catch (_) {}
        }
    }
    else if (event.mentions && Object.keys(event.mentions).length > 0) targetID = Object.keys(event.mentions)[0];
    else if (event.replyToItemId && event.messageReply) targetID = event.messageReply.senderID;

    try {
      const userData = await usersData.get(targetID);
      const allUsers = await usersData.getAll();
      allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0));
      const rank = allUsers.findIndex(u => String(u.id || u.userID) === String(targetID)) + 1;

      const exp = userData.exp || 0;
      const level = Math.floor(Math.sqrt(1 + 8 * exp / 5) / 2) || 1;
      const nextLevelExp = Math.floor(((Math.pow(level + 1, 2) - (level + 1)) * 5) / 2);
      const currentLevelExp = Math.floor(((Math.pow(level, 2) - level) * 5) / 2);

      const expInLevel = exp - currentLevelExp;
      const expRequired = nextLevelExp - currentLevelExp;

      const canvas = Canvas.createCanvas(934, 282);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#23272a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Progress Bar Background
      ctx.fillStyle = "#484b4e";
      ctx.beginPath();
      ctx.roundRect(257, 183, 618, 40, 20);
      ctx.fill();

      // Progress Bar
      const percent = Math.min(Math.max(expInLevel / expRequired, 0), 1);
      ctx.fillStyle = "#00d2ff";
      ctx.beginPath();
      ctx.roundRect(257, 183, 618 * percent, 40, 20);
      ctx.fill();

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 36px ${defaultFontName}`;
      ctx.fillText(userData.name || targetID, 257, 145);

      ctx.font = `24px ${defaultFontName}`;
      ctx.fillText(`Level ${level}`, 257, 175);
      ctx.textAlign = "right";
      ctx.fillText(`Rank #${rank}`, 875, 145);
      ctx.fillText(`${expInLevel} / ${expRequired} EXP`, 875, 175);

      // Avatar
      ctx.beginPath();
      ctx.arc(125, 141, 95, 0, Math.PI * 2);
      ctx.strokeStyle = "#00d2ff";
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.clip();
      ctx.closePath();

      try {
          const userInfo = (await api.getUserInfo(targetID))[targetID];
          const pfpUrl = userInfo?.profilePicUrl || userInfo?.profile_pic_url;
          if (pfpUrl) {
              const avatar = await Canvas.loadImage(pfpUrl);
              ctx.drawImage(avatar, 30, 46, 190, 190);
          }
      } catch (err) {
          // Fallback if avatar fails to load
          ctx.fillStyle = "#484b4e";
          ctx.fillRect(30, 46, 190, 190);
      }

      const stream = canvas.createPNGStream();
      await message.reply({ attachment: stream });

    } catch (e) {
      console.error(e);
      message.reply("Error generating rank card: " + e.message);
    }
  },

  async onChat({ usersData, event }) {
    if (!event.body || event.body.startsWith(global.GoatBot.config.PREFIX)) return;
    const userData = await usersData.get(event.senderID);
    const oldExp = userData.exp || 0;
    const newExp = oldExp + 1;

    const oldLevel = Math.floor(Math.sqrt(1 + 8 * oldExp / 5) / 2) || 1;
    const newLevel = Math.floor(Math.sqrt(1 + 8 * newExp / 5) / 2) || 1;

    await usersData.set(event.senderID, { exp: newExp });
  }
};
