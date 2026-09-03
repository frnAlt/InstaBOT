const axios = require("axios");
const Jimp = require("jimp");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "edit",
    aliases: ["imgedit", "photoedit", "filterimg"],
    version: "2.0.0",
    author: "Jisan && frnAlt",
    cooldown: 5,
    role: 0,
    description: "Edit photos with AI prompts or apply filters (grayscale, invert, sepia, blur, flip, rotate)",
    category: "image",
    usage: "edit <prompt> | edit [grayscale|invert|sepia|blur|flip|rotate] (reply to an image)"
  },

  onStart: async function ({ api, event, args, message, logger }) {
    let imageUrl = null;

    const reply = event.messageReply;
    if (reply && Array.isArray(reply.attachments) && reply.attachments.length > 0) {
      const photo = reply.attachments.find(a => a.type === "photo" || a.type === "image");
      if (photo) imageUrl = photo.url;
    } else if (args[0] && args[0].startsWith("http")) {
      imageUrl = args.shift();
    }

    const prompt = args.join(" ").trim().toLowerCase();

    if (!prompt && !imageUrl) {
      return message.reply(
        "❌ Please provide a prompt or reply to an image!\n\nExamples:\n!edit a futuristic neon city\n!edit grayscale (reply to an image)\n!edit make it anime style (reply to an image)"
      );
    }

    message.reaction("⏳");

    try {
      // 1. If user specified a Jimp local filter on a replied image
      const localFilters = ["grayscale", "greyscale", "invert", "sepia", "blur", "flip", "rotate", "pixelate"];
      const filterMatch = localFilters.find(f => prompt.includes(f));

      if (imageUrl && filterMatch) {
        message.reply(`🖌 Applying local filter [${filterMatch.toUpperCase()}]...`);
        const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const img = await Jimp.read(Buffer.from(res.data));

        if (filterMatch === "grayscale" || filterMatch === "greyscale") img.grayscale();
        else if (filterMatch === "invert") img.invert();
        else if (filterMatch === "sepia") img.sepia();
        else if (filterMatch === "blur") img.blur(10);
        else if (filterMatch === "flip") img.flip(true, false);
        else if (filterMatch === "rotate") img.rotate(90);
        else if (filterMatch === "pixelate") img.pixelate(8);

        const tempPath = path.join(os.tmpdir(), `edit_${Date.now()}.png`);
        await img.writeAsync(tempPath);

        message.reaction("✅");
        return message.reply({
          body: `✅ Filter [${filterMatch.toUpperCase()}] applied successfully!`,
          attachment: tempPath
        });
      }

      // 2. AI Prompted Photo Edit or Image Generation
      const fullPrompt = prompt || "high quality 4k photo edit";
      let editedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?nologo=true&seed=${Date.now()}`;
      if (imageUrl) {
        editedUrl += `&image=${encodeURIComponent(imageUrl)}`;
      }

      message.reaction("✅");
      return message.reply({
        body: imageUrl
          ? `🖌 AI Photo Edit Result:\nPrompt: "${fullPrompt}"`
          : `🖼 AI Generated Image:\nPrompt: "${fullPrompt}"`,
        attachment: editedUrl
      });

    } catch (err) {
      logger.error("EDIT Command Error:", err.message);
      message.reaction("❌");
      message.reply("❌ Failed to process image. Please try again.");
    }
  }
};
