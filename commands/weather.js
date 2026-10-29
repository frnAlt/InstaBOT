'use strict';

/**
 * Weather Command - Real-time worldwide weather forecasts
 */

const axios = require('axios');

module.exports = {
  config: {
    name: 'weather',
    aliases: ['forecast', 'climate', 'temp'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 3,
    role: 0,
    category: 'utilities',
    description: 'Check live weather and temperature forecasts for any city',
    usage: 'weather <city name>'
  },

  async run({ api, event, args, message }) {
    const tid = event.threadID || event.threadId;
    const query = args.join(' ').trim();

    if (!query) {
      const err = '❌ Please enter a city or location: *weather Tokyo (or *weather New York, London, Paris)';
      return message?.reply ? message.reply(err) : api?.sendMessage(err, tid, undefined, event.messageID);
    }

    try {
      const url = `https://wttr.in/${encodeURIComponent(query)}?format=j1`;
      const res = await axios.get(url, { timeout: 8000 });
      const current = res.data?.current_condition?.[0];
      const area = res.data?.nearest_area?.[0];

      if (!current || !area) {
        throw new Error('Location not found or no weather data available.');
      }

      const cityName = area.areaName?.[0]?.value || query;
      const country = area.country?.[0]?.value || '';
      const condition = current.weatherDesc?.[0]?.value || 'Clear';
      const tempC = current.temp_C;
      const tempF = current.temp_F;
      const feelsLike = current.FeelsLikeC;
      const humidity = current.humidity;
      const windKmph = current.windspeedKmph;
      const uv = current.uvIndex;

      const text =
        `🌤️ 𝐖𝐄𝐀𝐓𝐇𝐄𝐑 𝐑𝐄𝐏𝐎𝐑𝐓: ${cityName.toUpperCase()}, ${country.toUpperCase()}\n` +
        `─`.repeat(28) + `\n` +
        `🌡️ Temperature:   ${tempC}°C / ${tempF}°F\n` +
        `🤔 Feels Like:     ${feelsLike}°C\n` +
        `☁️ Condition:      ${condition}\n` +
        `💧 Humidity:       ${humidity}%\n` +
        `💨 Wind Speed:     ${windKmph} km/h\n` +
        `☀️ UV Index:       ${uv}\n` +
        `─`.repeat(28) + `\n` +
        `🕒 Observed at:    ${current.observation_time || 'Recent'}`;

      return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
    } catch (err) {
      const errText = `❌ Could not fetch weather for "${query}": ${err.message}`;
      return message?.reply ? message.reply(errText) : api.sendMessage(errText, tid, undefined, event.messageID);
    }
  }
};
