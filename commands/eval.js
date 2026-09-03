module.exports = {
  config: {
    name: "eval",
    aliases: ["ev"],
    version: "1.0",
    author: "Gtajisan && frnAlt",
    cooldown: 0,
    role: 4,
    description: "Evaluate JavaScript code",
    category: "owner"
  },

  async onStart({ api, event, args, message, usersData, threadsData, database, bot }) {
    const code = args.join(" ");
    if (!code) return message.reply("Please provide code to evaluate.");

    try {
      const result = await eval(`(async () => { ${code} })()`);
      const output = typeof result === "object" ? JSON.stringify(result, null, 2) : String(result);
      message.reply(`✓ Result:\n\n${output.substring(0, 2000)}`);
    } catch (e) {
      message.reply(`✗ Error:\n\n${e.message}`);
    }
  }
};
