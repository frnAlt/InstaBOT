/**
 * GitHub Query & Telemetry Command
 * Fetches user profile telemetry or repository statistics
 */

const axios = require("axios");

module.exports = {
  config: {
    name: "github",
    aliases: ["gh", "git"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search GitHub users and repositories"
    },
    longDescription: {
      en: "Fetches detailed statistics, stars, forks, follower count, and bio from GitHub's REST API."
    },
    category: "utility",
    guide: {
      en: "{p}github user <username>\n{p}github repo <owner/repo>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    if (!args[0]) {
      const helpMsg = `🐙 𝗚𝗶𝘁𝗛𝘂𝗯 𝗘𝘅𝗽𝗹𝗼𝗿𝗲𝗿\n\n📌 Usage:\n• /github user <username>\n• /github repo <owner/repo>\n\nExample:\n/github user torvalds\n/github repo expressjs/express`;
      return message ? message.reply(helpMsg) : api.sendMessage(helpMsg, threadID);
    }

    const type = args[0].toLowerCase();
    const query = args[1];

    if (!query) {
      const errMsg = `❌ Please provide a ${type === "repo" ? "repository (e.g. facebook/react)" : "username (e.g. torvalds)"}.`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }

    try {
      if (type === "user" || type === "u") {
        const { data } = await axios.get(`https://api.github.com/users/${encodeURIComponent(query)}`, {
          headers: { 'User-Agent': 'InstaBOT-Instagram' },
          timeout: 8000
        });

        let msg = `👤 𝗚𝗶𝘁𝗛𝘂𝗯 𝗨𝘀𝗲𝗿: ${data.name || data.login}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `🔗 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: @${data.login}\n`;
        msg += `📦 𝗣𝘂𝗯𝗹𝗶𝗰 𝗥𝗲𝗽𝗼𝘀: ${data.public_repos.toLocaleString()}\n`;
        msg += `👥 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${data.followers.toLocaleString()} | 𝗙𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴: ${data.following.toLocaleString()}\n`;
        if (data.company) msg += `🏢 𝗖𝗼𝗺𝗽𝗮𝗻𝘆: ${data.company}\n`;
        if (data.location) msg += `📍 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${data.location}\n`;
        if (data.bio) msg += `📝 𝗕𝗶𝗼: ${data.bio}\n`;
        if (data.blog) msg += `🌐 𝗪𝗲𝗯𝘀𝗶𝘁𝗲: ${data.blog}\n`;
        msg += `📅 𝗝𝗼𝗶𝗻𝗲𝗱: ${new Date(data.created_at).toLocaleDateString()}\n`;
        msg += `🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${data.html_url}`;

        const avatarStream = await global.utils.getStreamFromURL(data.avatar_url, "avatar.png").catch(() => null);
        if (avatarStream) {
          return message ? message.reply({ body: msg, attachment: avatarStream }) : api.sendMessage({ body: msg, attachment: avatarStream }, threadID);
        }
        return message ? message.reply(msg) : api.sendMessage(msg, threadID);
      }

      if (type === "repo" || type === "r") {
        const { data } = await axios.get(`https://api.github.com/repos/${query}`, {
          headers: { 'User-Agent': 'InstaBOT-Instagram' },
          timeout: 8000
        });

        let msg = `📦 𝗚𝗶𝘁𝗛𝘂𝗯 𝗥𝗲𝗽𝗼𝘀𝗶𝘁𝗼𝗿𝘆: ${data.full_name}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `⭐ 𝗦𝘁𝗮𝗿𝘀: ${data.stargazers_count.toLocaleString()} | 🍴 𝗙𝗼𝗿𝗸𝘀: ${data.forks_count.toLocaleString()}\n`;
        msg += `👀 𝗪𝗮𝘁𝗰𝗵𝗲𝗿𝘀: ${data.watchers_count.toLocaleString()} | 🐛 𝗢𝗽𝗲𝗻 𝗜𝘀𝘀𝘂𝗲𝘀: ${data.open_issues_count.toLocaleString()}\n`;
        msg += `💻 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲: ${data.language || "N/A"}\n`;
        if (data.license) msg += `📄 𝗟𝗶𝗰𝗲𝗻𝘀𝗲: ${data.license.spdx_id || data.license.name}\n`;
        if (data.description) msg += `📝 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${data.description}\n`;
        msg += `📅 𝗟𝗮𝘀𝘁 𝗨𝗽𝗱𝗮𝘁𝗲: ${new Date(data.updated_at).toLocaleDateString()}\n`;
        msg += `🌐 𝗨𝗥𝗟: ${data.html_url}`;

        return message ? message.reply(msg) : api.sendMessage(msg, threadID);
      }

      const invalidMsg = "❌ Invalid subcommand. Use '/github user <username>' or '/github repo <owner/repo>'.";
      return message ? message.reply(invalidMsg) : api.sendMessage(invalidMsg, threadID);
    } catch (err) {
      const errMsg = `❌ GitHub API Error: ${err.response?.data?.message || err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
