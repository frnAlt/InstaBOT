/**
 * Hug Interaction Command
 * Generates an adorable composite cuddle/hug image with tagged user
 */

let Canvas = null;
try { Canvas = require("canvas"); } catch (e) { Canvas = null; }

module.exports = {
  config: {
    name: "hug",
    aliases: ["cuddle"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Hug a friend or partner"
    },
    longDescription: {
      en: "Generates a sweet personalized hug composite image with another user."
    },
    category: "fun",
    guide: {
      en: "{p}hug @mention or reply to someone"
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
      const prompt = "🫂 Please @mention or reply to someone you want to give a warm hug to!";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    const senderUser = database?.getUser ? database.getUser(senderID) : null;
    const targetUser = database?.getUser ? database.getUser(targetID) : null;
    const senderName = senderUser?.name || senderUser?.username || "You";
    const targetName = targetUser?.name || targetUser?.username || "Friend";

    if (Canvas && Canvas.createCanvas) {
      try {
        const canvas = Canvas.createCanvas(700, 450);
        const ctx = canvas.getContext("2d");

        // Background
        ctx.fillStyle = "#ffccd5";
        ctx.fillRect(0, 0, 700, 450);

        // Gradient overlay
        const grad = ctx.createLinearGradient(0, 0, 700, 450);
        grad.addColorStop(0, "#ff758c");
        grad.addColorStop(1, "#ff7eb3");
        ctx.fillStyle = grad;
        ctx.fillRect(20, 20, 660, 410);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 34px sans-serif";
        ctx.fillText("🫂 WARM EMBRACE 🫂", 350, 80);

        ctx.font = "24px sans-serif";
        ctx.fillText(`${senderName} hugged ${targetName}!`, 350, 130);

        // Draw cute avatars / placeholders
        ctx.beginPath();
        ctx.arc(220, 260, 70, 0, Math.PI * 2);
        ctx.fillStyle = "#ffeaa7";
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(480, 260, 70, 0, Math.PI * 2);
        ctx.fillStyle = "#fab1a0";
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.fillStyle = "#2d3436";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(senderName.slice(0, 12), 220, 360);
        ctx.fillText(targetName.slice(0, 12), 480, 360);

        const buffer = canvas.toBuffer("image/png");
        const msg = `🫂 ${senderName} tightly hugs ${targetName}! ❤️`;
        return message ? message.reply({ body: msg, attachment: buffer }) : api.sendMessage({ body: msg, attachment: buffer }, threadID);
      } catch (err) {}
    }

    const textOnly = `🫂 ${senderName} tightly hugs ${targetName}! ❤️✨`;
    return message ? message.reply(textOnly) : api.sendMessage(textOnly, threadID);
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
