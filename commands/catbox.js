/**
 * Catbox File Uploader Command
 * Uploads media and files to Catbox.moe
 */

const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  config: {
    name: 'catbox',
    aliases: ['cb', 'catboxdl'],
    version: '1.2.0',
    author: 'Gtajisan && frnAlt',
    role: 0,
    shortDescription: {
      en: 'Upload media to Catbox'
    },
    longDescription: {
      en: 'Uploads images, videos, audio, and documents to Catbox cloud hosting.'
    },
    category: 'media',
    usage: '{p}catbox (reply to media/file)'
  },

  onStart: async function ({ api, event, message }) {
    const threadID = event.threadId || event.threadID;

    let attachments = [];
    if (event.messageReply?.attachments?.length > 0) {
      attachments = event.messageReply.attachments;
    } else if (event.attachments?.length > 0) {
      attachments = event.attachments;
    }

    if (attachments.length === 0) {
      const prompt = '📦 Please reply to a photo, video, or audio file with `/catbox`.';
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    if (message && typeof message.reaction === 'function') {
      message.reaction('⏳', event.messageID);
    }

    try {
      const results = [];
      for (const attachment of attachments) {
        const stream = await global.utils.getStreamFromURL(attachment.url);
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', stream);

        const response = await axios.post('https://catbox.moe/user/api.php', form, {
          headers: form.getHeaders(),
          timeout: 20000
        });

        if (typeof response.data === 'string' && response.data.startsWith('http')) {
          results.push(response.data.trim());
        }
      }

      if (results.length === 0) {
        throw new Error('Upload to Catbox failed');
      }

      if (message && typeof message.reaction === 'function') message.reaction('✅', event.messageID);
      const replyMsg = `🐱 𝗖𝗮𝘁𝗯𝗼𝘅 𝗟𝗶𝗻𝗸(𝘀):\n\n${results.join('\n')}`;
      return message ? message.reply(replyMsg) : api.sendMessage(replyMsg, threadID);
    } catch (err) {
      if (message && typeof message.reaction === 'function') message.reaction('❌', event.messageID);
      const errMsg = `❌ Catbox upload failed: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
