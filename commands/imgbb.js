/**
 * ImgBB Image Cloud Hosting Command
 * Upload images directly to ImgBB and return permanent CDN URLs
 */

const axios = require('axios');
const FormData = require('form-data');

const IMGBB_API_KEY = '1b4d99fa0c3195efe42ceb62670f2a25';

module.exports = {
  config: {
    name: 'imgbb',
    aliases: ['uploadimg', 'imgupload'],
    version: '1.2.0',
    author: 'Gtajisan && frnAlt',
    cooldown: 5,
    role: 0,
    shortDescription: {
      en: 'Upload images to ImgBB cloud'
    },
    longDescription: {
      en: 'Uploads images to ImgBB hosting service and returns permanent public links.'
    },
    category: 'utility',
    usage: '{p}imgbb (reply to photo or send with photo)'
  },

  onStart: async function ({ api, event, message }) {
    const threadID = event.threadId || event.threadID;

    let attachments = [];
    if (event.messageReply?.attachments?.length > 0) {
      attachments = event.messageReply.attachments;
    } else if (event.attachments?.length > 0) {
      attachments = event.attachments;
    }

    const photoAttachments = attachments.filter(a =>
      a.type === 'photo' || a.type === 'image' || (a.url && /\.(jpg|jpeg|png|gif|webp)/i.test(a.url))
    );

    if (photoAttachments.length === 0) {
      const prompt = '❌ Please reply to an image or send a photo with the `/imgbb` command.';
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    if (message && typeof message.reaction === 'function') {
      message.reaction('⏳', event.messageID);
    }

    try {
      const links = await Promise.all(
        photoAttachments.map(async (att, i) => {
          const imgRes = await axios.get(att.url, { responseType: 'arraybuffer', timeout: 15000 });
          const form = new FormData();
          form.append('image', Buffer.from(imgRes.data), { filename: `image_${Date.now()}_${i}.jpg` });

          const res = await axios.post('https://api.imgbb.com/1/upload', form, {
            headers: form.getHeaders(),
            params: { key: IMGBB_API_KEY },
            timeout: 15000
          });

          return res.data?.data?.url || res.data?.data?.display_url;
        })
      );

      const validLinks = links.filter(Boolean);
      if (validLinks.length === 0) {
        throw new Error('Could not upload image to ImgBB');
      }

      if (message && typeof message.reaction === 'function') message.reaction('✅', event.messageID);
      const replyMsg = `🖼️ 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱 ${validLinks.length} 𝗶𝗺𝗮𝗴𝗲(𝘀) 𝘁𝗼 𝗜𝗺𝗴𝗕𝗕:\n\n${validLinks.join('\n')}`;
      return message ? message.reply(replyMsg) : api.sendMessage(replyMsg, threadID);
    } catch (error) {
      if (message && typeof message.reaction === 'function') message.reaction('❌', event.messageID);
      const errMsg = `❌ Failed to upload image to ImgBB: ${error.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
