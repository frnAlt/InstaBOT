/**
 * Marriage & Wedding Command
 * Propose, marry, and manage virtual relationships
 */

let Canvas = null;
try { Canvas = require("canvas"); } catch (e) { Canvas = null; }

module.exports = {
  config: {
    name: "marry",
    aliases: ["wedding", "propose", "divorce"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Virtual marriage and proposal system"
    },
    longDescription: {
      en: "Propose to your crush or partner, accept wedding vows, and generate official marriage certificate cards."
    },
    category: "fun",
    guide: {
      en: "{p}marry @mention or {p}marry divorce"
    }
  },

  onStart: async function ({ api, event, args, message, database }) {
    const threadID = event.threadId || event.threadID;
    const senderID = event.senderID;
    const subCmd = (args[0] || "").toLowerCase();

    // Check divorce
    if (subCmd === "divorce" || subCmd === "breakup") {
      const user = database?.getUser ? database.getUser(senderID) : null;
      if (!user?.partner) {
        const notMarried = "❌ You are not currently married to anyone!";
        return message ? message.reply(notMarried) : api.sendMessage(notMarried, threadID);
      }

      const exID = user.partner;
      if (database?.updateUser) {
        database.updateUser(senderID, { partner: null, marriedAt: null });
        database.updateUser(exID, { partner: null, marriedAt: null });
      }

      const divorceMsg = `💔 You have officially divorced and are now single again.`;
      return message ? message.reply(divorceMsg) : api.sendMessage(divorceMsg, threadID);
    }

    let targetID = null;
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.messageReply?.senderID) {
      targetID = event.messageReply.senderID;
    } else if (args[0] && !isNaN(args[0])) {
      targetID = args[0];
    }

    if (!targetID || targetID === senderID) {
      const prompt = "💍 𝗠𝗮𝗿𝗿𝗶𝗮𝗴𝗲 𝗦𝘆𝘀𝘁𝗲𝗺\n\n📌 Usage:\n• /marry @mention (Propose to someone)\n• /marry divorce (End marriage)";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    const senderUser = database?.getUser ? database.getUser(senderID) : null;
    const targetUser = database?.getUser ? database.getUser(targetID) : null;

    if (senderUser?.partner) {
      const already = `❌ You are already married to another user! Use '/marry divorce' first if you wish to remarry.`;
      return message ? message.reply(already) : api.sendMessage(already, threadID);
    }

    if (targetUser?.partner) {
      const taken = `❌ This person is already married to someone else!`;
      return message ? message.reply(taken) : api.sendMessage(taken, threadID);
    }

    const senderName = senderUser?.name || senderUser?.username || "Suitor";
    const targetName = targetUser?.name || targetUser?.username || "Crush";

    let proposalMsg = `💍 𝗠𝗔𝗥𝗥𝗜𝗔𝗚𝗘 𝗣𝗥𝗢𝗣𝗢𝗦𝗔𝗟!\n━━━━━━━━━━━━━━━━━━━━━\n`;
    proposalMsg += `✨ ${senderName} has proposed to marry ${targetName}!\n\n`;
    proposalMsg += `👉 ${targetName}, reply 'yes' or 'accept' to this message within 60 seconds to accept the proposal!`;

    let sentMessageID;
    if (message && typeof message.reply === 'function') {
      const sent = await message.reply(proposalMsg);
      sentMessageID = sent?.messageID;
    } else {
      const sent = await api.sendMessage(proposalMsg, threadID);
      sentMessageID = sent?.messageID;
    }

    if (sentMessageID && global.GoatBot?.onReply) {
      global.GoatBot.onReply.set(sentMessageID, {
        commandName: "marry",
        author: targetID,
        proposerID: senderID,
        proposerName: senderName,
        targetName,
        createdAt: Date.now()
      });
    }
  },

  onReply: async function ({ api, event, Reply, message, database }) {
    const threadID = event.threadId || event.threadID;
    if (event.senderID !== Reply.author) return;

    const answer = (event.body || "").trim().toLowerCase();
    if (global.GoatBot?.onReply) {
      global.GoatBot.onReply.delete(event.messageReply?.messageID || Reply.messageID);
    }

    if (answer === "yes" || answer === "accept" || answer === "i do" || answer === "agree") {
      const now = Date.now();
      if (database?.updateUser) {
        database.updateUser(Reply.proposerID, { partner: Reply.author, marriedAt: now });
        database.updateUser(Reply.author, { partner: Reply.proposerID, marriedAt: now });
      }

      if (Canvas && Canvas.createCanvas) {
        try {
          const canvas = Canvas.createCanvas(800, 500);
          const ctx = canvas.getContext("2d");

          // Wedding Certificate background
          ctx.fillStyle = "#fffbf0";
          ctx.fillRect(0, 0, 800, 500);

          ctx.lineWidth = 12;
          ctx.strokeStyle = "#d4af37";
          ctx.strokeRect(20, 20, 760, 460);

          ctx.lineWidth = 2;
          ctx.strokeStyle = "#b38728";
          ctx.strokeRect(32, 32, 736, 436);

          ctx.fillStyle = "#2c3e50";
          ctx.textAlign = "center";
          ctx.font = "bold 36px serif";
          ctx.fillText("📜 CERTIFICATE OF MARRIAGE 📜", 400, 90);

          ctx.font = "italic 22px serif";
          ctx.fillText("This certifies that", 400, 150);

          ctx.font = "bold 28px sans-serif";
          ctx.fillStyle = "#e74c3c";
          ctx.fillText(`${Reply.proposerName}  ❤️  ${Reply.targetName}`, 400, 210);

          ctx.font = "20px serif";
          ctx.fillStyle = "#34495e";
          ctx.fillText("have been happily united in holy matrimony on this day.", 400, 270);

          ctx.font = "18px sans-serif";
          ctx.fillStyle = "#7f8c8d";
          ctx.fillText(`Date: ${new Date(now).toLocaleDateString()} | Sealed by InstaBOT`, 400, 340);

          ctx.font = "40px sans-serif";
          ctx.fillText("💍 🥂 💐", 400, 410);

          const buffer = canvas.toBuffer("image/png");
          const successMsg = `🎉 𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡𝗦! 🥂\n\n💍 ${Reply.proposerName} and ${Reply.targetName} are now officially married! Wishing you a lifetime of joy and happiness! ❤️✨`;
          return message ? message.reply({ body: successMsg, attachment: buffer }) : api.sendMessage({ body: successMsg, attachment: buffer }, threadID);
        } catch (e) {}
      }

      const textSuccess = `🎉 𝗖𝗢𝗡𝗚𝗥𝗔𝗧𝗨𝗟𝗔𝗧𝗜𝗢𝗡𝗦! 🥂\n\n💍 ${Reply.proposerName} and ${Reply.targetName} are now officially married! ❤️✨`;
      return message ? message.reply(textSuccess) : api.sendMessage(textSuccess, threadID);
    } else {
      const rejectMsg = `💔 The proposal was politely declined. Better luck next time!`;
      return message ? message.reply(rejectMsg) : api.sendMessage(rejectMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
