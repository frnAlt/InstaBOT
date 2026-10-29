'use strict';

/**
 * Rank Command - Check user level, EXP, rank title, and leaderboard
 */

const { CassEXP } = require('../func/modules/cassEXP');
const { abbreviateNumber } = require('../func/arielUtils');

function createProgressBar(current, target, totalBars = 10) {
  if (target <= 0) return '🟩'.repeat(totalBars);
  const ratio = Math.max(0, Math.min(1, current / target));
  const filled = Math.round(ratio * totalBars);
  const empty = totalBars - filled;
  return '🟩'.repeat(filled) + '⬜'.repeat(empty);
}

module.exports = {
  config: {
    name: 'rank',
    aliases: ['level', 'exp', 'lvl'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 2,
    role: 0,
    category: 'user',
    description: 'Displays your chat experience, rank level, and leaderboard',
    usage: 'rank [top | @user | uid]'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = event.threadID || event.threadId;
    const senderID = String(event.senderID || event.author || '');

    // Top leaderboard
    if (args[0] && args[0].toLowerCase() === 'top') {
      let allUsers = [];
      if (usersData && typeof usersData.getAll === 'function') {
        allUsers = await usersData.getAll();
      } else if (global.db && Array.isArray(global.db.allUserData)) {
        allUsers = global.db.allUserData;
      }

      if (!allUsers || allUsers.length === 0) {
        const text = '🌟 𝐑𝐀𝐍𝐊 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃\n\nNo player data recorded yet!';
        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      }

      const list = allUsers.map(u => {
        const expVal = Number(u.exp || u.cassEXP?.exp || u.data?.exp || 0);
        const cxp = new CassEXP({ exp: expVal });
        return {
          userID: u.userID,
          name: u.name || `User ${u.userID}`,
          exp: expVal,
          level: cxp.getLevel(),
          title: cxp.getRankString()
        };
      });

      list.sort((a, b) => b.exp - a.exp);
      const top10 = list.slice(0, 10);

      let board = '🌟 𝐄𝐗𝐏 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 (𝐓𝐎𝐏 𝟏𝟎)\n' + '─'.repeat(28) + '\n';
      top10.forEach((p, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
        board += `${medal} ${p.name}\n   └─ 🎖️ Lv.${p.level} (${p.title}) • ⭐ ${abbreviateNumber(p.exp)} EXP\n`;
      });
      board += '─'.repeat(28);

      return message?.reply ? message.reply(board) : api.sendMessage(board, tid, undefined, event.messageID);
    }

    // Resolve target
    let targetID = senderID;
    if (event.messageReply && event.messageReply.senderID) {
      targetID = String(event.messageReply.senderID);
    } else if (args[0]) {
      const clean = args[0].replace(/[@<>]/g, '').trim();
      if (/^\d+$/.test(clean)) targetID = clean;
    }

    let userName = 'Player';
    let userExp = 0;

    if (usersData) {
      if (typeof usersData.getName === 'function') {
        userName = await usersData.getName(targetID);
      }
      if (typeof usersData.get === 'function') {
        const u = await usersData.get(targetID);
        if (u) {
          userName = u.name || userName;
          userExp = Number(u.exp || u.cassEXP?.exp || u.data?.exp || 0);
        }
      }
    }

    const cxp = new CassEXP({ exp: userExp });
    const level = cxp.getLevel();
    const rankTitle = cxp.getRankString();
    const nextExp = cxp.getNextEXP();
    const curExpLv = cxp.getEXPCurrentLv();
    const neededLv = nextExp - CassEXP.getEXPFromLevel(level - 1);
    const progress = createProgressBar(curExpLv, neededLv, 8);
    const percent = Math.min(100, Math.max(0, Math.round((curExpLv / neededLv) * 100)));

    const text =
      `🌟 𝐏𝐋𝐀𝐘𝐄𝐑 𝐑𝐀𝐍𝐊 𝐂𝐀𝐑𝐃\n` +
      `👤 Name:   ${userName}\n` +
      `─`.repeat(26) + `\n` +
      `🎖️ Level:  ${level} (${rankTitle})\n` +
      `⭐ Total:  ${abbreviateNumber(userExp)} EXP (${userExp.toLocaleString()})\n` +
      `📊 Prog:   [${progress}] ${percent}%\n` +
      `📈 Next:   ${curExpLv.toLocaleString()} / ${neededLv.toLocaleString()} EXP\n` +
      `─`.repeat(26) + `\n` +
      `💡 Chat and play games to earn more experience!`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
