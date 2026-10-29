'use strict';

/**
 * Tic-Tac-Toe Command - Play interactive Tic-Tac-Toe in chat
 */

const activeGames = new Map(); // threadID -> gameState

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function checkWinner(board) {
  for (const [a, b, c] of WIN_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell !== ' ')) return 'tie';
  return null;
}

function renderBoard(board) {
  const sym = (val, idx) => (val !== ' ' ? val : `${idx + 1}️⃣`);
  return (
    `┌───┬───┬───┐\n` +
    `│ ${sym(board[0], 0)} │ ${sym(board[1], 1)} │ ${sym(board[2], 2)} │\n` +
    `├───┼───┼───┤\n` +
    `│ ${sym(board[3], 3)} │ ${sym(board[4], 4)} │ ${sym(board[5], 5)} │\n` +
    `├───┼───┼───┤\n` +
    `│ ${sym(board[6], 6)} │ ${sym(board[7], 7)} │ ${sym(board[8], 8)} │\n` +
    `└───┴───┴───┘`
  );
}

function bestAIMove(board) {
  // Try to win or block
  for (const mark of ['⭕', '❌']) {
    for (let i = 0; i < 9; i++) {
      if (board[i] === ' ') {
        board[i] = mark;
        if (checkWinner(board) === mark) {
          board[i] = ' ';
          return i;
        }
        board[i] = ' ';
      }
    }
  }
  if (board[4] === ' ') return 4;
  const corners = [0, 2, 6, 8].filter(i => board[i] === ' ');
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
  const available = [];
  for (let i = 0; i < 9; i++) if (board[i] === ' ') available.push(i);
  return available[Math.floor(Math.random() * available.length)];
}

module.exports = {
  config: {
    name: 'ttt',
    aliases: ['tictactoe'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 1,
    role: 0,
    category: 'games',
    description: 'Play an interactive game of Tic-Tac-Toe against the AI or another player',
    usage: 'ttt [1-9 | new | reset]'
  },

  async run({ api, event, args, message, usersData }) {
    const tid = String(event.threadID || event.threadId);
    const senderID = String(event.senderID || event.author || '');

    const arg0 = (args[0] || '').toLowerCase();

    if (arg0 === 'reset' || arg0 === 'cancel') {
      activeGames.delete(tid);
      const text = '🛑 Current Tic-Tac-Toe match has been reset.';
      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    }

    let game = activeGames.get(tid);

    if (!game || arg0 === 'new' || arg0 === 'start') {
      game = {
        board: Array(9).fill(' '),
        turn: senderID,
        playerX: senderID,
        playerO: 'ai',
        status: 'active'
      };
      activeGames.set(tid, game);

      const text =
        `🎮 𝐓𝐈𝐂-𝐓𝐀𝐂-𝐓𝐎𝐄 𝐒𝐓𝐀𝐑𝐓𝐄𝐃\n` +
        `👤 Player: ❌ | 🤖 AI: ⭕\n` +
        `─`.repeat(24) + `\n` +
        renderBoard(game.board) + `\n` +
        `─`.repeat(24) + `\n` +
        `💡 Type *ttt <1-9> to place your mark!`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    }

    const moveIdx = parseInt(arg0, 10) - 1;
    if (isNaN(moveIdx) || moveIdx < 0 || moveIdx > 8) {
      const prompt =
        `🎮 𝐓𝐈𝐂-𝐓𝐀𝐂-𝐓𝐎𝐄 (Current Game)\n` +
        renderBoard(game.board) + `\n` +
        `─`.repeat(24) + `\n` +
        `💡 Reply with *ttt <1-9> to make a move, or *ttt reset to restart.`;
      return message?.reply ? message.reply(prompt) : api.sendMessage(prompt, tid, undefined, event.messageID);
    }

    if (game.board[moveIdx] !== ' ') {
      const err = '❌ That tile is already occupied! Choose an open tile (1-9).';
      return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
    }

    // Player move
    game.board[moveIdx] = '❌';

    let winner = checkWinner(game.board);
    if (winner) {
      activeGames.delete(tid);
      if (winner === '❌') {
        if (usersData && typeof usersData.addMoney === 'function') {
          await usersData.addMoney(senderID, 1000);
        }
        const text =
          `🏆 𝐘𝐎𝐔 𝐖𝐎𝐍! ❌\n` +
          `─`.repeat(24) + `\n` +
          renderBoard(game.board) + `\n` +
          `─`.repeat(24) + `\n` +
          `💰 Prize: +$1,000 cash added to your wallet!`;
        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      } else {
        const text = `🤝 𝐈𝐓'𝐒 𝐀 𝐓𝐈𝐄!\n─`.repeat(24) + `\n` + renderBoard(game.board) + `\nGood game!`;
        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      }
    }

    // AI move
    const aiIdx = bestAIMove(game.board);
    game.board[aiIdx] = '⭕';

    winner = checkWinner(game.board);
    if (winner) {
      activeGames.delete(tid);
      if (winner === '⭕') {
        const text =
          `🤖 𝐀𝐈 𝐖𝐎𝐍! ⭕\n` +
          `─`.repeat(24) + `\n` +
          renderBoard(game.board) + `\n` +
          `─`.repeat(24) + `\n` +
          `Better luck next time! Type *ttt new to play again.`;
        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      } else {
        const text = `🤝 𝐈𝐓'𝐒 𝐀 𝐓𝐈𝐄!\n─`.repeat(24) + `\n` + renderBoard(game.board) + `\nGood game!`;
        return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
      }
    }

    const text =
      `🎮 𝐓𝐈𝐂-𝐓𝐀𝐂-𝐓𝐎𝐄\n` +
      renderBoard(game.board) + `\n` +
      `─`.repeat(24) + `\n` +
      `💡 Your turn! Type *ttt <1-9>`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
