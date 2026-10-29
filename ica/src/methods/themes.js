'use strict';

/**
 * @fileoverview NKXICA - Instagram Chat Themes API
 * Verified catalog, theme searching, and thread theme switching via GraphQL & REST.
 */

const { ENDPOINTS, BASE_URL } = require('../utils/constants');
const CryptoUtils = require('../utils/crypto');

function compactKey(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const VERIFIED_THEMES = Object.freeze([
  { id: 'default', themeId: '3259963564026002', name: 'Default', aliases: ['reset', 'normal', 'standard'], colors: ['#AA00FF', '#0080FF'] },
  { id: 'classic', themeId: '3273938616164733', name: 'Classic', aliases: ['blue'], colors: ['#0099FF'] },
  { id: 'monochrome', themeId: '788274591712841', name: 'Monochrome', aliases: ['mono', 'bw', 'minimal'], colors: ['#F0F0F0'] },
  { id: 'ocean', themeId: '527564631955494', name: 'Ocean', aliases: ['sea', 'aqua'], colors: ['#00C7D3', '#3653E8'] },
  { id: 'lavender', themeId: '571193503540759', name: 'Lavender', aliases: ['lilac', 'pastelpurple'], colors: ['#A797FF'] },
  { id: 'berry', themeId: '724096885023603', name: 'Berry', aliases: ['berries'], colors: ['#005FFF', '#9200FF', '#FF2E19'] },
  { id: 'maple', themeId: '2533652183614000', name: 'Maple', aliases: ['autumn', 'fall'], colors: ['#550029', '#AA3232', '#D9A900'] },
  { id: 'sunset', themeId: '3650637715209675', name: 'Besties (Sunset)', aliases: ['besties', 'sunset-gradient', 'warm'], colors: ['#FB961E', '#FF7B01', '#FF6C02'] },
  { id: 'cyberpunk', themeId: '1060619084701625', name: 'Lo-Fi', aliases: ['lofi', 'lo-fi', 'neon', 'synthwave'], colors: ['#CA34FF', '#302CFF', '#BA009C'] },
  { id: 'love', themeId: '741311439775765', name: 'Love', aliases: ['heart', 'hearts', 'valentine'], colors: ['#FF0D9E', '#F9005A'] },
  { id: 'pride', themeId: '968524435055801', name: 'Pride', aliases: ['rainbow'], colors: ['#FF0018', '#FF8701', '#01C92D', '#3F77E6', '#8A39EF'] },
  { id: 'sky', themeId: '3190514984517598', name: 'Sky', aliases: ['clouds'], colors: ['#0080FF', '#9F1AFF'] },
  { id: 'tiedye', themeId: '230032715012014', name: 'Tie-dye', aliases: ['tie-dye'], colors: ['#0052CD', '#00A1E6'] },
  { id: 'cottagecore', themeId: '539927563794799', name: 'Cottagecore', aliases: ['meadow', 'nature'], colors: ['#00D52F', '#006528'] },
  { id: 'astrology', themeId: '3082966625307060', name: 'Astrology', aliases: ['zodiac', 'stars'], colors: ['#FF239A', '#FF8C21'] },
  { id: 'shadow', themeId: '271607034185782', name: 'Shadow', aliases: ['dark', 'midnight'], colors: ['#5E007E', '#331290', '#2825B5'] },
  { id: 'rose', themeId: '1257453361255152', name: 'Rose', aliases: ['red'], colors: ['#FF311E'] },
  { id: 'grape', themeId: '193497045377796', name: 'Grape', aliases: ['purple'], colors: ['#5E007E'] },
  { id: 'honey', themeId: '672058580051520', name: 'Honey', aliases: ['gold', 'yellow'], colors: ['#FAAF00'] },
  { id: 'kiwi', themeId: '3151463484918004', name: 'Kiwi', aliases: ['green', 'lime'], colors: ['#6EDF00'] },
  { id: 'apple', themeId: '403422283881973', name: 'Apple', aliases: ['crimson'], colors: ['#AA3232'] },
  { id: 'tulip', themeId: '2873642949430623', name: 'Tulip', aliases: ['pink'], colors: ['#FB45DE'] },
  { id: 'unicorn', themeId: '273728810607574', name: 'Unicorn', aliases: [], colors: ['#FB45DE', '#841DD5', '#3A1D8A'] },
  { id: 'sweets', themeId: '624266884847972', name: 'Sweets', aliases: ['candy'], colors: ['#FF8FB2', '#A797FF', '#00E5FF'] },
  { id: 'sushi', themeId: '909695489504566', name: 'Sushi', aliases: [], colors: ['#F25C54', '#F4845F', '#F7B267'] },
  { id: 'rocket', themeId: '582065306070020', name: 'Rocket', aliases: ['space'], colors: ['#FAAF00', '#FF2E2E', '#3A12FF'] },
  { id: 'coffee', themeId: '1299135724598332', name: 'Coffee', aliases: ['espresso'], colors: ['#632E00'] },
  { id: 'bubbletea', themeId: '195296273246380', name: 'Bubble tea', aliases: ['boba', 'bubble-tea'], colors: ['#886546', '#A27F57', '#C6A26E'] },
  { id: 'cats', themeId: '418793291211015', name: 'Cats', aliases: ['cat', 'kitty'], colors: ['#FF9900', '#DE7A00', '#BD5B00'] },
  { id: 'dogs', themeId: '1040328944732151', name: 'Dogs', aliases: ['dog', 'puppy'], colors: ['#402E15'] },
  { id: 'pixel', themeId: '2729200940784964', name: 'Pixel Dreamscape', aliases: ['pixel-dreamscape', '8bit', 'retro'], colors: ['#0D3F61'] },
  { id: 'goth', themeId: '846723720930746', name: 'Goth charms', aliases: ['goth-charms'], colors: ['#606060', '#2C2C2C', '#1A1A1A'] },
  { id: 'loops', themeId: '976389323536938', name: 'Loops', aliases: ['noir', 'charcoal'], colors: ['#060606', '#212121', '#424243'] },
  { id: 'foliage', themeId: '1633544640877832', name: 'Foliage', aliases: ['forest', 'emerald'], colors: ['#016741', '#006D59', '#006A71'] },
  { id: 'music', themeId: '339021464972092', name: 'Music', aliases: [], colors: ['#2FA9E4', '#648FEB', '#9B73F2'] },
  { id: 'care', themeId: '275041734441112', name: 'Care', aliases: [], colors: ['#4AC9E4', '#5890FF', '#8C91FF'] },
  { id: 'celebration', themeId: '627144732056021', name: 'Celebration', aliases: ['party'], colors: ['#F1614E', '#660F84'] },
  { id: 'sweetheart', themeId: '1121431622801436', name: 'Sweetheart', aliases: [], colors: ['#D71D93'] },
  { id: 'flirt', themeId: '611878928211423', name: 'Flirt', aliases: [], colors: ['#E11976'] },
  { id: 'lollipop', themeId: '292955489929680', name: 'Lollipop', aliases: [], colors: ['#00C5C5', '#01B4AF', '#02A49A'] },
  { id: 'avocado', themeId: '1508524016651271', name: 'Avocado', aliases: [], colors: ['#6B904E', '#568640', '#467729'] },
  { id: 'pizza', themeId: '704702021720552', name: 'Pizza', aliases: [], colors: ['#D21313'] }
]);

class Themes {
  constructor(httpClient, options = {}) {
    this.http = httpClient;
    this.uuid = options.uuid || CryptoUtils.generateUUID();
    this.verifiedThemes = VERIFIED_THEMES;
  }

  getThemes(callback) {
    const list = [...this.verifiedThemes];
    if (callback) callback(null, list);
    return Promise.resolve(list);
  }

  resolveTheme(input) {
    if (!input) return null;
    const raw = String(input).trim();
    const lower = raw.toLowerCase();
    const compact = compactKey(raw);

    if (lower === 'random') {
      return this.getRandomTheme();
    }

    if (/^\d{6,25}$/.test(raw)) {
      const existing = this.verifiedThemes.find(t => String(t.themeId) === raw);
      if (existing) return existing;
      return { id: raw, themeId: raw, name: `Theme #${raw}`, aliases: [], colors: [] };
    }

    const exact = this.verifiedThemes.find(t =>
      t.id.toLowerCase() === lower ||
      compactKey(t.id) === compact ||
      t.name.toLowerCase() === lower ||
      compactKey(t.name) === compact ||
      (Array.isArray(t.aliases) && t.aliases.some(a => a.toLowerCase() === lower || compactKey(a) === compact))
    );
    if (exact) return exact;

    if (compact.length >= 3) {
      const partial = this.verifiedThemes.find(t =>
        compactKey(t.name).includes(compact) ||
        compactKey(t.id).includes(compact) ||
        (Array.isArray(t.aliases) && t.aliases.some(a => compactKey(a).includes(compact)))
      );
      if (partial) return partial;
    }

    return null;
  }

  searchThemes(query) {
    const q = compactKey(query);
    if (!q) return [...this.verifiedThemes];
    return this.verifiedThemes.filter(t =>
      compactKey(t.name).includes(q) ||
      compactKey(t.id).includes(q) ||
      (Array.isArray(t.aliases) && t.aliases.some(a => compactKey(a).includes(q)))
    );
  }

  getRandomTheme() {
    const nonDefault = this.verifiedThemes.filter(t => t.id !== 'default');
    return nonDefault[Math.floor(Math.random() * nonDefault.length)] || this.verifiedThemes[0];
  }

  async setChatTheme(threadId, themeInput, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    try {
      const thread = String(threadId || '').trim();
      if (!thread) throw new Error('threadId is required');
      if (!themeInput) throw new Error('themeInput is required');

      const theme = this.resolveTheme(themeInput);
      const themeId = theme ? String(theme.themeId) : String(themeInput).trim();
      const themeName = theme ? theme.name : `Theme #${themeId}`;

      let res;
      // Primary: GraphQL SET_THEME mutation or REST fallback
      try {
        const payload = new URLSearchParams();
        payload.append('fb_api_caller_class', 'RelayModern');
        payload.append('fb_api_req_friendly_name', 'useIGDUpdateChatThemeOffMsysMutation');
        payload.append('doc_id', ENDPOINTS.GRAPHQL_DOCS.SET_THEME);
        payload.append('variables', JSON.stringify({
          ig_thread_igid: thread,
          theme_id: themeId
        }));
        res = await this.http.post(ENDPOINTS.GRAPHQL, payload.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      } catch (gqlErr) {
        // Fallback to direct_v2 set_theme
        res = await this.http.post(ENDPOINTS.SET_THEME(thread), { theme_id: themeId });
      }

      const result = {
        success: true,
        threadId: thread,
        themeId,
        themeName,
        theme: theme || { id: themeId, themeId, name: themeName },
        raw: res
      };

      if (callback) return callback(null, result);
      return result;
    } catch (error) {
      if (callback) return callback(error);
      throw error;
    }
  }

  async resetChatTheme(threadId, options = {}, callback) {
    return this.setChatTheme(threadId, 'default', options, callback);
  }
}

Themes.VERIFIED_THEMES = VERIFIED_THEMES;

module.exports = Themes;
