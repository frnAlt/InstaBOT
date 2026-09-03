/**
 * Moon Phase Command
 * Visualizes lunar phase and illumination for any chosen calendar date
 */

const moment = require("moment-timezone");
const axios = require("axios");

const MOON_IMAGES = [
  'https://i.ibb.co/9shyYH1/moon-0.png',
  'https://i.ibb.co/vBXLL37/moon-1.png',
  'https://i.ibb.co/0QCKK9D/moon-2.png',
  'https://i.ibb.co/Dp62X2j/moon-3.png',
  'https://i.ibb.co/xFKCtfd/moon-4.png',
  'https://i.ibb.co/m4L533L/moon-5.png',
  'https://i.ibb.co/VmshdMN/moon-6.png',
  'https://i.ibb.co/4N7R2B2/moon-7.png',
  'https://i.ibb.co/C2k4YB8/moon-8.png',
  'https://i.ibb.co/F62wHxP/moon-9.png',
  'https://i.ibb.co/Gv6R1mk/moon-10.png',
  'https://i.ibb.co/0ZYY7Kk/moon-11.png',
  'https://i.ibb.co/KqXC5F5/moon-12.png',
  'https://i.ibb.co/BGtLpRJ/moon-13.png',
  'https://i.ibb.co/jDn7pPx/moon-14.png',
  'https://i.ibb.co/kykn60t/moon-15.png',
  'https://i.ibb.co/qD4LFLs/moon-16.png',
  'https://i.ibb.co/qJm9gcQ/moon-17.png',
  'https://i.ibb.co/yYFYZx9/moon-18.png',
  'https://i.ibb.co/8bc7vpZ/moon-19.png',
  'https://i.ibb.co/jHG7DKs/moon-20.png',
  'https://i.ibb.co/5WD18Rn/moon-21.png',
  'https://i.ibb.co/3Y06yHM/moon-22.png',
  'https://i.ibb.co/4T8Zdfy/moon-23.png',
  'https://i.ibb.co/n1CJyP4/moon-24.png',
  'https://i.ibb.co/zFwJRqz/moon-25.png',
  'https://i.ibb.co/gVBmMCW/moon-26.png',
  'https://i.ibb.co/hRY89Hn/moon-27.png',
  'https://i.ibb.co/7C13s7Z/moon-28.png',
  'https://i.ibb.co/2hDTwB4/moon-29.png',
  'https://i.ibb.co/Rgj9vpj/moon-30.png',
  'https://i.ibb.co/s5z0w9R/moon-31.png'
];

function getMoonPhaseIndex(year, month, day) {
  let c = 0, e = 0, jd = 0, b = 0;
  if (month < 3) {
    year--;
    month += 12;
  }
  ++month;
  c = 365.25 * year;
  e = 30.6 * month;
  jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  b = parseInt(jd);
  jd -= b;
  b = Math.round(jd * 31);
  if (b >= 32) b = 0;
  return b;
}

module.exports = {
  config: {
    name: "moon",
    aliases: ["moonphase", "lunar"],
    version: "1.2.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View moon phase for any calendar date"
    },
    longDescription: {
      en: "Calculates astronomical lunar cycle and renders high-definition moon imagery for chosen date."
    },
    category: "image",
    guide: {
      en: "{p}moon [DD/MM/YYYY]\nExample: {p}moon 25/12/2024"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    const dateInput = args[0] || moment().format("DD/MM/YYYY");
    const parts = dateInput.split(/[\/\-\.]/);

    if (parts.length < 3) {
      const syntax = "❌ Please enter a valid date in DD/MM/YYYY format (e.g. /moon 15/08/2024).";
      return message ? message.reply(syntax) : api.sendMessage(syntax, threadID);
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
      const invalid = "❌ Invalid date. Please verify day, month, and year.";
      return message ? message.reply(invalid) : api.sendMessage(invalid, threadID);
    }

    const phaseIndex = getMoonPhaseIndex(year, month, day);
    const moonUrl = MOON_IMAGES[phaseIndex] || MOON_IMAGES[0];

    const phaseNames = [
      "New Moon", "Waxing Crescent", "Waxing Crescent", "Waxing Crescent",
      "Waxing Crescent", "Waxing Crescent", "Waxing Crescent", "First Quarter",
      "Waxing Gibbous", "Waxing Gibbous", "Waxing Gibbous", "Waxing Gibbous",
      "Waxing Gibbous", "Waxing Gibbous", "Waxing Gibbous", "Full Moon",
      "Waning Gibbous", "Waning Gibbous", "Waning Gibbous", "Waning Gibbous",
      "Waning Gibbous", "Waning Gibbous", "Waning Gibbous", "Third Quarter",
      "Waning Crescent", "Waning Crescent", "Waning Crescent", "Waning Crescent",
      "Waning Crescent", "Waning Crescent", "Waning Crescent", "New Moon"
    ];

    const phaseName = phaseNames[phaseIndex] || "Lunar Phase";
    const illumination = Math.round((1 - Math.cos((phaseIndex / 31) * 2 * Math.PI)) / 2 * 100);

    let caption = `🌕 𝗠𝗢𝗢𝗡 𝗣𝗛𝗔𝗦𝗘 — ${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}\n`;
    caption += `━━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `✨ 𝗣𝗵𝗮𝘀𝗲: ${phaseName}\n`;
    caption += `💡 𝗜𝗹𝗹𝘂𝗺𝗶𝗻𝗮𝘁𝗶𝗼𝗻: ~${illumination}%\n`;
    caption += `🌙 𝗟𝘂𝗻𝗮𝗿 𝗔𝗴𝗲: ${phaseIndex} / 31 days`;

    const stream = await global.utils.getStreamFromURL(moonUrl, `moon_${phaseIndex}.png`).catch(() => null);
    if (stream) {
      return message 
        ? message.reply({ body: caption, attachment: stream })
        : api.sendMessage({ body: caption, attachment: stream }, threadID);
    }

    return message ? message.reply(caption) : api.sendMessage(caption, threadID);
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
