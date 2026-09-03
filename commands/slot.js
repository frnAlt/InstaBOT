module.exports = {
  config: {
    name: 'slot',
    aliases: ['slots', 'bet', 'casino'],
    version: '1.0',
    author: 'Jisan && frnAlt',
    cooldown: 5,
    role: 0,
    category: 'Game',
    description: 'Casino Slot Machine game — bet coins and win rewards',
    usage: 'slot <bet_amount>'
  },

  onStart: async function ({ api, event, args, message, database }) {
    const uid = event.senderID;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) {
      return message.reply('❌ Please enter a valid bet amount!\nExample: !slot 100');
    }

    const userData = database.getUser(uid) || {};
    if (!userData.money) userData.money = 500; // Default starting money

    if (userData.money < bet) {
      return message.reply(`❌ You do not have enough coins! Your balance: ${userData.money} 🪙`);
    }

    const items = ['🎰', '🍇', '🍉', '🍊', '🍋', '🍌', '🍒', '💎', '7️⃣'];
    const s1 = items[Math.floor(Math.random() * items.length)];
    const s2 = items[Math.floor(Math.random() * items.length)];
    const s3 = items[Math.floor(Math.random() * items.length)];

    let win = false;
    let multiplier = 0;

    if (s1 === s2 && s2 === s3) {
      win = true;
      multiplier = s1 === '7️⃣' ? 10 : (s1 === '💎' ? 5 : 3);
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      win = true;
      multiplier = 1.5;
    }

    const prize = Math.floor(bet * multiplier);

    if (win) {
      userData.money += prize;
      database.setUserData(uid, userData);
      return message.reply(
        `🎰 **SLOT MACHINE** 🎰\n\n` +
        `[ ${s1} | ${s2} | ${s3} ]\n\n` +
        `🎉 **YOU WON!** You received **+${prize} 🪙** (${multiplier}x Multiplier)\n` +
        `💰 **New Balance:** ${userData.money} 🪙`
      );
    } else {
      userData.money -= bet;
      database.setUserData(uid, userData);
      return message.reply(
        `🎰 **SLOT MACHINE** 🎰\n\n` +
        `[ ${s1} | ${s2} | ${s3} ]\n\n` +
        `❌ **YOU LOST!** You lost **-${bet} 🪙**\n` +
        `💰 **Remaining Balance:** ${userData.money} 🪙`
      );
    }
  }
};
