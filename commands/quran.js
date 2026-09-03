/**
 * Quran Surah & Ayah Command
 * Fetches Quranic verses, Arabic calligraphy, English translation, and audio recitation
 */

const axios = require("axios");

const SURAH_NAMES = {
  1: "Al-Fatihah (The Opening)",
  2: "Al-Baqarah (The Cow)",
  3: "Ali 'Imran (Family of Imran)",
  4: "An-Nisa (The Women)",
  5: "Al-Ma'idah (The Table Spread)",
  6: "Al-An'am (The Cattle)",
  7: "Al-A'raf (The Heights)",
  8: "Al-Anfal (The Spoils of War)",
  9: "At-Tawbah (The Repentance)",
  10: "Yunus (Jonah)",
  11: "Hud (Hud)",
  12: "Yusuf (Joseph)",
  13: "Ar-Ra'd (The Thunder)",
  14: "Ibrahim (Abraham)",
  15: "Al-Hijr (The Rocky Tract)",
  16: "An-Nahl (The Bee)",
  17: "Al-Isra (The Night Journey)",
  18: "Al-Kahf (The Cave)",
  19: "Maryam (Mary)",
  20: "Ta-Ha",
  21: "Al-Anbiya (The Prophets)",
  22: "Al-Hajj (The Pilgrimage)",
  23: "Al-Mu'minun (The Believers)",
  24: "An-Nur (The Light)",
  25: "Al-Furqan (The Criterion)",
  26: "Ash-Shu'ara (The Poets)",
  27: "An-Naml (The Ant)",
  28: "Al-Qasas (The Stories)",
  29: "Al-'Ankabut (The Spider)",
  30: "Ar-Rum (The Romans)",
  36: "Ya-Sin",
  55: "Ar-Rahman (The Beneficent)",
  56: "Al-Waqi'ah (The Inevitable)",
  67: "Al-Mulk (The Sovereignty)",
  112: "Al-Ikhlas (The Sincerity)",
  113: "Al-Falaq (The Daybreak)",
  114: "An-Nas (Mankind)"
};

module.exports = {
  config: {
    name: "quran",
    aliases: ["surah", "ayah", "ayat"],
    version: "1.1.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Read Quranic verses with translations and recitations"
    },
    longDescription: {
      en: "Fetches Arabic script, English translation, and audio recitations for any Surah and Ayah."
    },
    category: "religion",
    guide: {
      en: "{p}quran <surah:ayah>\nExample: {p}quran 1:1 or {p}quran 2:255"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    const query = args[0] || "1:1";
    const parts = query.split(/[:\s-]+/);
    const surah = parseInt(parts[0], 10) || 1;
    const ayah = parseInt(parts[1], 10) || 1;

    if (surah < 1 || surah > 114) {
      const err = "❌ Invalid Surah number. Please choose between 1 and 114.";
      return message ? message.reply(err) : api.sendMessage(err, threadID);
    }

    try {
      // Fetch Arabic & Translation via AlQuran Cloud API
      const [arRes, enRes] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.alafasy`, { timeout: 8000 }),
        axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.asad`, { timeout: 8000 })
      ]);

      const arData = arRes.data?.data;
      const enData = enRes.data?.data;

      if (!arData || !enData) {
        throw new Error("Ayah not found");
      }

      const surahName = SURAH_NAMES[surah] || `${arData.surah?.englishName} (${arData.surah?.englishNameTranslation})`;
      let responseText = `📖 𝗧𝗵𝗲 𝗛𝗼𝗹𝘆 𝗤𝘂𝗿'𝗮𝗻 — Surah ${surahName} [${surah}:${ayah}]\n`;
      responseText += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      responseText += `🕌 ${arData.text}\n\n`;
      responseText += `📝 𝗧𝗿𝗮𝗻𝘀𝗹𝗮𝘁𝗶𝗼𝗻:\n"${enData.text}"\n\n`;
      responseText += `✨ Revelation: ${arData.surah?.revelationType} | Total Verses: ${arData.surah?.numberOfAyahs}`;

      // If audio recitation URL is available
      if (arData.audio) {
        const audioStream = await global.utils.getStreamFromURL(arData.audio, `quran_${surah}_${ayah}.mp3`).catch(() => null);
        if (audioStream) {
          return message ? message.reply({ body: responseText, attachment: audioStream }) : api.sendMessage({ body: responseText, attachment: audioStream }, threadID);
        }
      }

      return message ? message.reply(responseText) : api.sendMessage(responseText, threadID);
    } catch (err) {
      const errMsg = `❌ Quran lookup error: ${err.response?.data?.message || err.message}`;
      return message ? message.reply(errMsg) : api.sendMessage(errMsg, threadID);
    }
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
