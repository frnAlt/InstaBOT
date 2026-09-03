/**
 * Remove Background Command
 * Removes backgrounds from photos with AI and exports transparent PNGs
 */

const axios = require("axios");

function extractImageUrl(args, event) {
  let imageUrl = args.find(arg => typeof arg === 'string' && (arg.startsWith('http://') || arg.startsWith('https://')));

  if (!imageUrl && event.messageReply?.attachments?.length > 0) {
    const imageAttachment = event.messageReply.attachments.find(att => att.type === 'photo' || att.type === 'image');
    if (imageAttachment?.url) imageUrl = imageAttachment.url;
  } else if (!imageUrl && event.attachments?.length > 0) {
    const imageAttachment = event.attachments.find(att => att.type === 'photo' || att.type === 'image');
    if (imageAttachment?.url) imageUrl = imageAttachment.url;
  }
  return imageUrl;
}

module.exports = {
  config: {
    name: "removebg",
    aliases: ["nobg", "bgremove", "rembg", "rbg"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 8,
    role: 0,
    shortDescription: {
      en: "Remove image backgrounds with AI"
    },
    longDescription: {
      en: "Extracts foreground subjects and removes the backdrop to generate a transparent PNG."
    },
    category: "ai-image",
    guide: {
      en: "Reply to an image with {p}removebg or provide an image link"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    const imageUrl = extractImageUrl(args, event);

    if (!imageUrl) {
      const prompt = "🖼️ Please reply to a photo or provide an image URL with `/removebg`.";
      return message ? message.reply(prompt) : api.sendMessage(prompt, threadID);
    }

    if (message && typeof message.reaction === 'function') {
      message.reaction("⏳", event.messageID);
    }

    try {
      // Primary removebg API
      const primaryUrl = `https://api.removal.ai/3.0/remove`; // or free proxy
      const proxyUrl = `https://api.siputzx.my.id/api/ai/removebg?url=${encodeURIComponent(imageUrl)}`;
      
      let stream = await global.utils.getStreamFromURL(proxyUrl, "nobg.png").catch(() => null);

      if (!stream) {
        // Fallback endpoint
        const fallbackUrl = `https://widpe.com/removebg?url=${encodeURIComponent(imageUrl)}`;
        stream = await global.utils.getStreamFromURL(fallbackUrl, "nobg.png").catch(() => null);
      }

      if (stream) {
        if (message && typeof message.reaction === 'function') message.reaction("✨", event.messageID);
        const caption = "✨ 𝗕𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱 𝗥𝗲𝗺𝗼𝘃𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!";
        return message 
          ? message.reply({ body: caption, attachment: stream })
          : api.sendMessage({ body: caption, attachment: stream }, threadID);
      }

      const failMsg = "❌ Unable to remove background from this image. Please ensure the image is clear and under 5MB.";
      return message ? message.reply(failMsg) : api.sendMessage(failMsg, threadID);
    } catch (err) {
      const errMsg = `❌ Error removing background: ${err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
