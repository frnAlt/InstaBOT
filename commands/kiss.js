/**
 * Kiss Interaction Command
 * Generates a romantic kiss composite image for tagged user
 */

let Canvas = null;
try { Canvas = require("canvas"); } catch (e) { Canvas = null; }

module.exports = {
  config: {
    name: "kiss",
    aliases: ["smooch"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Kiss a friend or partner"
    },
    longDescription: {
      en: "Generates a romantic canvas graphic when you kiss another user."
    },
    category: "fun",
    guide: {
      en: "{p}kiss @mention or reply to someone"
    }
  },

  onStart: async function ({ api, event, args, message, database }) {
    const threadID = event.threadId || event.threadID;
    let senderID = event.senderID;
    let targetID = null;

    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.messageReply?.senderID) {
      targetID = event.messageReply.senderID;
    } else if (args[0] && !isNaN(args[0])) {
      targetID = args[0];
    }

    if (!targetID || targetID === senderID) {
      const prompt = "😚 Please @mention or reply to someone you want to kiss!";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    const senderUser = database?.getUser ? database.getUser(senderID) : null;
    const targetUser = database?.getUser ? database.getUser(targetID) : null;
    const senderName = senderUser?.name || senderUser?.username || "You";
    const targetName = targetUser?.name || targetUser?.username || "Crush";

    if (Canvas && Canvas.createCanvas) {
      try {
        const canvas = Canvas.createCanvas(700, 450);
        const ctx = canvas.getContext("2d");

        const grad = ctx.createLinearGradient(0, 0, 700, 450);
        grad.addColorStop(0, "#f857a6");
        grad.addColorStop(1, "#ff5858");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 700, 450);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 34px sans-serif";
        ctx.fillText("💋 SWEET KISS 💋", 350, 80);

        ctx.font = "24px sans-serif";
        ctx.fillText(`${senderName} gave a sweet kiss to ${targetName}!`, 350, 130);

        // Decorative circles
        ctx.beginPath();
        ctx.arc(240, 260, 65, 0, Math.PI * 2);
        ctx.fillStyle = "#ffeaa7";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(460, 260, 65, 0, Math.PI * 2);
        ctx.fillStyle = "#fd79a8";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px sans-serif";
        ctx.fillText("❤️", 350, 275);

        ctx.font = "bold 20px sans-serif";
        ctx.fillText(senderName.slice(0, 12), 240, 360);
        ctx.fillText(targetName.slice(0, 12), 460, 360);

        const buffer = canvas.toBuffer("image/png");
        const msg = `💋 ${senderName} gave a sweet and passionate kiss to ${targetName}! ❤️🔥`;
        return message ? message.reply({ body: msg, attachment: buffer }) : api.sendMessage({ body: msg, attachment: buffer }, threadID);
      } catch (err) {}
    }

    const textOnly = `💋 ${senderName} gave a sweet kiss to ${targetName}! ❤️🔥`;
    return message ? message.reply(textOnly) : api.sendMessage(textOnly, threadID);
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
