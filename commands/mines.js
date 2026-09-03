/**
 * Mines Casino Game Command
 * Grid-based risk game with multipliers and cashout
 */

module.exports = {
  config: {
    name: "mines",
    aliases: ["minesweeper", "minegame"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Play casino mines risk game"
    },
    longDescription: {
      en: "Bet coins on a 5x5 minefield. Uncover diamonds to build your multiplier, but avoid the hidden bombs!"
    },
    category: "game",
    guide: {
      en: "{p}mines <bet_amount>\nExample: {p}mines 100"
    }
  },

  onStart: async function ({ api, event, args, message, database }) {
    const threadID = event.threadId || event.threadID;
    const bet = parseInt(args[0], 10);

    if (isNaN(bet) || bet <= 0) {
      const prompt = "💣 𝗠𝗶𝗻𝗲𝘀 𝗚𝗮𝗺𝗲\n\n📌 Usage: /mines <bet_amount>\nExample: /mines 100\n\nRules: A 5x5 grid with 3 hidden mines. Uncover numbers 1-25. Type 'cashout' anytime to bank your winnings!";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    const userBalance = database?.getUser ? (database.getUser(event.senderID)?.money || 0) : 1000;
    if (userBalance < bet) {
      const err = `❌ Insufficient balance! You have $${userBalance.toLocaleString()}, but tried to bet $${bet.toLocaleString()}.`;
      return message ? message.reply(err) : api.sendMessage(err, threadID);
    }

    // Deduct bet
    if (database && typeof database.decreaseMoney === 'function') {
      database.decreaseMoney(event.senderID, bet);
    }

    // Generate 3 random mine locations (1-25)
    const minePositions = new Set();
    while (minePositions.size < 3) {
      minePositions.add(Math.floor(Math.random() * 25) + 1);
    }

    const gameState = {
      commandName: "mines",
      author: event.senderID,
      bet,
      mines: Array.from(minePositions),
      uncovered: [],
      multiplier: 1.0,
      createdAt: Date.now()
    };

    let gridDisplay = "💣 𝗠𝗜𝗡𝗘𝗦𝗙𝗜𝗘𝗟𝗗 (𝟱𝘅𝟱)\n━━━━━━━━━━━━━━━━━━━━━\n";
    for (let r = 0; r < 5; r++) {
      let row = "";
      for (let c = 1; c <= 5; c++) {
        const num = r * 5 + c;
        row += `[${num < 10 ? '0' + num : num}] `;
      }
      gridDisplay += row + "\n";
    }
    gridDisplay += `━━━━━━━━━━━━━━━━━━━━━\n`;
    gridDisplay += `💰 𝗕𝗲𝘁: $${bet.toLocaleString()} | 💥 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗶𝗲𝗿: 1.00x\n`;
    gridDisplay += `👉 Reply with a tile number (1-25) to reveal or type 'cashout' to collect!`;

    let sentMessageID;
    if (message && typeof message.reply === 'function') {
      const sent = await message.reply(gridDisplay);
      sentMessageID = sent?.messageID;
    } else {
      const sent = await api.sendMessage(gridDisplay, threadID);
      sentMessageID = sent?.messageID;
    }

    if (sentMessageID && global.GoatBot?.onReply) {
      global.GoatBot.onReply.set(sentMessageID, gameState);
    }
  },

  onReply: async function ({ api, event, Reply, message, database }) {
    const threadID = event.threadId || event.threadID;
    if (event.senderID !== Reply.author) return;

    const input = (event.body || "").trim().toLowerCase();

    // Cashout logic
    if (input === "cashout" || input === "claim" || input === "stop") {
      if (global.GoatBot?.onReply) {
        global.GoatBot.onReply.delete(event.messageReply?.messageID || Reply.messageID);
      }
      const winnings = Math.floor(Reply.bet * Reply.multiplier);
      if (database && typeof database.addMoney === 'function') {
        database.addMoney(event.senderID, winnings);
      }
      const winMsg = `💎 𝗖𝗔𝗦𝗛𝗘𝗗 𝗢𝗨𝗧!\n\n💰 Multiplier: ${Reply.multiplier.toFixed(2)}x\n💵 Winnings: +$${winnings.toLocaleString()} added to your account!`;
      return message ? message.reply(winMsg) : api.sendMessage(winMsg, threadID);
    }

    const tile = parseInt(input, 10);
    if (isNaN(tile) || tile < 1 || tile > 25) {
      return message ? message.reply("⚠️ Please reply with a number between 1 and 25, or 'cashout'!") : api.sendMessage("⚠️ Please reply with a number between 1 and 25, or 'cashout'!", threadID);
    }

    if (Reply.uncovered.includes(tile)) {
      return message ? message.reply("⚠️ Tile already uncovered! Pick another one.") : api.sendMessage("⚠️ Tile already uncovered! Pick another one.", threadID);
    }

    if (global.GoatBot?.onReply) {
      global.GoatBot.onReply.delete(event.messageReply?.messageID || Reply.messageID);
    }

    // Check if hit a mine
    if (Reply.mines.includes(tile)) {
      const lossMsg = `💥 𝗕𝗢𝗢𝗢𝗢𝗠! You hit a hidden mine on tile [${tile}]!\n\n❌ You lost your bet of $${Reply.bet.toLocaleString()}. Better luck next time!`;
      return message ? message.reply(lossMsg) : api.sendMessage(lossMsg, threadID);
    }

    // Safe diamond uncovered
    Reply.uncovered.push(tile);
    Reply.multiplier = Number((Reply.multiplier + 0.35).toFixed(2));

    const potentialWin = Math.floor(Reply.bet * Reply.multiplier);
    let updatedGrid = "💎 𝗦𝗔𝗙𝗘! 𝗬𝗼𝘂 𝗳𝗼𝘂𝗻𝗱 𝗮 𝗗𝗶𝗮𝗺𝗼𝗻𝗱!\n━━━━━━━━━━━━━━━━━━━━━\n";
    for (let r = 0; r < 5; r++) {
      let row = "";
      for (let c = 1; c <= 5; c++) {
        const num = r * 5 + c;
        if (Reply.uncovered.includes(num)) {
          row += `[💎] `;
        } else {
          row += `[${num < 10 ? '0' + num : num}] `;
        }
      }
      updatedGrid += row + "\n";
    }
    updatedGrid += `━━━━━━━━━━━━━━━━━━━━━\n`;
    updatedGrid += `💰 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗪𝗶𝗻: $${potentialWin.toLocaleString()} (${Reply.multiplier.toFixed(2)}x)\n`;
    updatedGrid += `👉 Reply with next tile (1-25) or reply 'cashout' to collect!`;

    let newSentID;
    if (message && typeof message.reply === 'function') {
      const sent = await message.reply(updatedGrid);
      newSentID = sent?.messageID;
    } else {
      const sent = await api.sendMessage(updatedGrid, threadID);
      newSentID = sent?.messageID;
    }

    if (newSentID && global.GoatBot?.onReply) {
      global.GoatBot.onReply.set(newSentID, Reply);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
