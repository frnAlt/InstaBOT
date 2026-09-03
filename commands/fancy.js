/**
 * Fancy Font & Typography Command
 * Converts standard text into 30+ stylish Unicode fonts
 */

module.exports = {
  config: {
    name: "fancy",
    aliases: ["font", "fonts", "styletext"],
    version: "1.1.0",
    author: "Gtajisan && frnAlt",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Convert text to aesthetic Unicode fonts"
    },
    longDescription: {
      en: "Styles text with 30+ Unicode typographic alphabets (bold, italic, cursive, gothic, sans, bubbles, squares)."
    },
    category: "utility",
    guide: {
      en: "{p}fancy <text> or {p}fancy [font_name] <text>\nExample: {p}fancy bold Hello World"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;

    if (!args[0]) {
      const availableFonts = [
        "bold", "italic", "bold_italic", "script", "bold_script",
        "fraktur", "bold_fraktur", "double_struck", "sans", "sans_bold",
        "sans_italic", "sans_bold_italic", "monospace", "small_caps",
        "bubbles", "squares", "fullwidth"
      ];
      let msg = `✨ 𝗙𝗮𝗻𝗰𝘆 𝗙𝗼𝗻𝘁 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗼𝗿\n\n📌 𝗨𝘀𝗮𝗴𝗲:\n• /fancy <text> (Prevews all styles)\n• /fancy <style> <text>\n\n🎨 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗦𝘁𝘆𝗹𝗲𝘀:\n${availableFonts.join(", ")}`;
      return message ? message.reply(msg) : api.sendMessage(msg, threadID);
    }

    const firstWord = args[0].toLowerCase();
    const isNamedStyle = global.utils?.fonts && Boolean(global.utils.fonts.fontMap[firstWord] || global.utils.fonts.fonts[firstWord]);

    if (isNamedStyle && args.length > 1) {
      const textToStyle = args.slice(1).join(" ");
      const styled = global.utils.applyFont(textToStyle, firstWord);
      return message ? message.reply(styled) : api.sendMessage(styled, threadID);
    }

    // Otherwise render top styles preview
    const textToStyle = args.join(" ");
    const previewStyles = ["bold", "bold_italic", "script", "fraktur", "double_struck", "sans_bold", "small_caps", "bubbles", "squares"];
    
    let result = `✨ 𝗙𝗼𝗻𝘁 𝗦𝘁𝘆𝗹𝗲𝘀 𝗳𝗼𝗿: "${textToStyle}"\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
    for (const st of previewStyles) {
      const converted = global.utils ? global.utils.applyFont(textToStyle, st) : textToStyle;
      result += `▪️ ${st}: ${converted}\n`;
    }

    return message ? message.reply(result) : api.sendMessage(result, threadID);
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
