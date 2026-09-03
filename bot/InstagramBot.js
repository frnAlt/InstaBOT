'use strict';

const { login } = require('../ica');

const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const cron = require('node-cron');
const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const CommandLoader = require('../utils/commandLoader');
const EventLoader   = require('../utils/eventLoader');
const Banner        = require('../utils/banner');

class InstagramBot {
  constructor() {
    const TTLMap           = require('../func/TTLMap');
    global.utils           = require('../utils.js');
    global.GoatBot         = global.GoatBot || {};
    global.GoatBot.config  = config;
    global.GoatBot.onReply = global.GoatBot.onReply || new TTLMap({ ttl: 30 * 60 * 1000, maxSize: 500 });
    global.GoatBot.onReaction = global.GoatBot.onReaction || new TTLMap({ ttl: 30 * 60 * 1000, maxSize: 500 });
    global.GoatBot.onEvent = global.GoatBot.onEvent || new Map();
    global.GoatBot.onChat  = global.GoatBot.onChat || new Map();
    global.GoatBot.instance = this;
    global.client          = global.client || {};

    this.config            = config;
    this.ig                = null;
    this.api               = null;
    this.userID            = null;
    this.username          = null;
    this.commandLoader     = new CommandLoader();
    this.eventLoader       = new EventLoader(this);
    this.reconnectAttempts = 0;
    this.shouldReconnect   = config.AUTO_RECONNECT;
    this.isRunning         = false;
    this.connectionStatus  = 'offline'; // 'offline', 'online', 'reconnecting', 'auth_error'
    this.lastErrorReason   = null;
    this._mqttRestartTimer  = null;
    this._cookieRefreshTimer = null;
    this._reminderTimer     = null;
    this._autoRemoveTimer   = null;
    this._sessionCheckerTimer = null;
  }

  startHealthServer() {
    let port = parseInt(process.env.PORT || config.DASHBOARD_PORT || 3000, 10);
    const dashboardHtml = fs.existsSync(path.join(process.cwd(), 'dashboard', 'index.html'))
      ? path.join(process.cwd(), 'dashboard', 'index.html')
      : path.join(__dirname, '..', 'dashboard', 'index.html');

    const recentActivity = [];
    this._logActivity = (text) => {
      recentActivity.unshift({ text, time: Date.now() });
      if (recentActivity.length > 20) recentActivity.pop();
    };

    const server = http.createServer(async (req, res) => {
      const url = req.url.split('?')[0];

      // ── Dashboard HTML ──────────────────────────────────────────────
      if (url === '/' || url === '/dashboard') {
        try {
          const html = fs.readFileSync(dashboardHtml, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end(html);
        } catch (err) {
          logger.error('Dashboard HTML error', { error: err.message });
          res.writeHead(500); return res.end(`Dashboard error: ${err.message}`);
        }
      }

      // ── API routes ──────────────────────────────────────────────────
      const json = (data) => {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(data));
      };

      if (!url.startsWith('/api/')) {
        res.writeHead(404); return res.end('Not Found');
      }

      const route = url.slice(4); // strip /api

      // GET /api/status
      if (route === '/status') {
        const database = require('../utils/database');
        const mem  = process.memoryUsage();
        const users = database.getAllUsers();
        return json({
          connected:    this.isRunning,
          status:       this.connectionStatus,
          errorReason:  this.lastErrorReason,
          userID:       this.userID,
          username:     this.username,
          botName:      config.BOT_NAME || config.NICK_NAME_BOT || 'GoatBot-IG',
          version:      config.BOT_VERSION || '1.0.0',
          uptime:       Math.floor(process.uptime()),
          prefix:       config.PREFIX || '!',
          commandCount: this.commandLoader.getAllCommandNames().length,
          eventCount:   this.eventLoader.getAllEventNames().length,
          memory:       { heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, rss: mem.rss },
          nodeVersion:  process.version,
          platform:     process.platform,
          arch:         process.arch,
          totalUsers:   users.length,
          stats:        database.getAllStats(),
          recentActivity
        });
      }

      // GET /api/threads
      if (route === '/threads') {
        try {
          const inbox = await this.ig.getInbox({ limit: 40 });
          const threads = (inbox?.threads || inbox?.items || []).map(t => {
            let name = t.thread_title || t.name || t.title || '';
            const isGroup = t.is_group || t.isGroup || false;
            const participants = t.users || t.participants || [];

            if (!name && !isGroup && participants.length > 0) {
              const otherUser = participants.find(u => String(u.pk || u.id || u.userID) !== String(this.userID)) || participants[0];
              if (otherUser) {
                name = otherUser.fullName || otherUser.full_name || otherUser.username || `User ${otherUser.pk || otherUser.id}`;
              }
            }
            if (!name) name = isGroup ? 'Unnamed Group' : 'Direct Message';

            // Cache participant details
            const database = require('../utils/database');
            participants.forEach(u => {
              const userId = u.pk || u.id || u.userID;
              if (userId) {
                const user = database.getUser(userId);
                let updated = false;
                const pName = u.fullName || u.full_name || u.name;
                const pUser = u.username;
                const pAvatar = u.profilePicUrlHd || u.profile_pic_url_hd || u.profilePicUrl;
                if (!user.name && pName) { user.name = pName; updated = true; }
                if (!user.username && pUser) { user.username = pUser; updated = true; }
                if (!user.avatarUrl && pAvatar) { user.avatarUrl = pAvatar; updated = true; }
                if (updated) {
                  database.updateUser(userId, user);
                }
              }
            });

            return {
              threadID:        t.thread_id || t.threadID || t.id,
              name:            name,
              isGroup:         isGroup,
              participantCount: participants.length,
              snippet:         t.last_permanent_item?.text || t.snippet || ''
            };
          });
          require('../utils/database').save();
          return json({ threads });
        } catch (e) {
          return json({ threads: [], error: e.message });
        }
      }

      // GET /api/thread/:id
      const threadMatch = route.match(/^\/thread\/(.+)$/);
      if (threadMatch) {
        const threadID = threadMatch[1];
        try {
          const info = await this.ig.getThreadInfo(threadID);
          const raw  = info || {};
          const participants = (raw.users || raw.participants || raw.items || []).map(u => ({
            userID:   u.pk || u.id || u.user_id || u.userID,
            name:     u.full_name || u.fullName || u.name || '',
            username: u.username || '',
            isAdmin:  u.is_admin || u.isAdmin || false,
            nickname: u.nickname || ''
          }));

          // Asynchronously update database with these participants
          const database = require('../utils/database');
          let anyUpdated = false;
          participants.forEach(p => {
            const user = database.getUser(p.userID);
            let updated = false;
            if (!user.name && p.name) { user.name = p.name; updated = true; }
            if (!user.username && p.username) { user.username = p.username; updated = true; }
            if (updated) {
              database.updateUser(p.userID, user);
              anyUpdated = true;
            }
          });
          if (anyUpdated) {
            database.save();
          }

          return json({ threadID, participants, raw: { name: raw.thread_title || '', isGroup: raw.is_group } });
        } catch (e) {
          return json({ threadID, participants: [], error: e.message });
        }
      }

      // GET /api/users
      if (route === '/users') {
        const database = require('../utils/database');
        const users  = database.getAllUsers().sort((a, b) => (b.messageCount||0) - (a.messageCount||0));

        // Resolve names for any user that doesn't have them, up to 10 users at a time to prevent rate limits
        const unresolved = users.filter(u => !u.name || !u.username).slice(0, 10);
        if (unresolved.length > 0) {
          let anyUpdated = false;
          await Promise.all(unresolved.map(async (u) => {
            try {
              const info = await this.ig.getUserInfo(u.id);
              if (info) {
                u.name = info.fullName || info.full_name || info.name || '';
                u.username = info.username || '';
                u.avatarUrl = info.profilePicUrlHd || info.profile_pic_url_hd || info.profilePicUrl || '';
                database.updateUser(u.id, u);
                anyUpdated = true;
              }
            } catch (err) {
              // Ignore error
            }
          }));
          if (anyUpdated) {
            database.save();
          }
        }

        const economy = database.data.economy || {};
        const banned  = [...(database.data.bannedUsers || [])];
        return json({ users, economy, banned });
      }

      // GET /api/commands
      if (route === '/commands') {
        const cmds = [];
        for (const [key, cmd] of this.commandLoader.commands) {
          if (cmd.config.name !== key) continue;
          cmds.push({
            name:        cmd.config.name,
            description: cmd.config.description || '',
            category:    cmd.config.category || 'other',
            aliases:     cmd.config.aliases || [],
            role:        cmd.config.role || 0,
            cooldown:    cmd.config.cooldown || 0,
            usage:       cmd.config.usage || '',
            prefix:      config.PREFIX || '!'
          });
        }
        return json({ commands: cmds.sort((a,b) => a.name.localeCompare(b.name)) });
      }

      // GET /api/logs
      if (route === '/logs') {
        const moment = require('moment-timezone');
        const today = moment().tz(config.TIMEZONE || 'UTC').format('YYYY-MM-DD');
        const logFile = path.join(process.cwd(), 'logs', `combined-${today}.log`);
        try {
          let raw = '';
          if (fs.existsSync(logFile)) raw = fs.readFileSync(logFile, 'utf-8');
          const logs = raw.trim().split('\n').filter(Boolean).slice(-300).map(line => {
            try {
              const parsed = JSON.parse(line);
              return { time: parsed.timestamp || parsed.time || '', level: parsed.level?.toUpperCase() || 'INFO', message: parsed.message || line };
            } catch {
              const m = line.match(/\[([\d:]+)\].*?(INFO|WARN|ERROR|DEBUG).*?(.+)/);
              return m ? { time: m[1], level: m[2], message: m[3].trim() } : { time: '', level: 'INFO', message: line };
            }
          });
          return json({ logs: logs.reverse() });
        } catch (e) {
          return json({ logs: [], error: e.message });
        }
      }

      // POST /api/action/save-db
      if (route === '/action/save-db') {
        try {
          require('../utils/database').save();
          return json({ success: true, message: 'Database saved to disk successfully' });
        } catch (e) {
          return json({ success: false, error: e.message });
        }
      }

      // POST /api/action/restart-listener
      if (route === '/action/restart-listener') {
        try {
          if (this.ig && typeof this.ig.stopListening === 'function') {
            this.ig.stopListening();
          }
          setTimeout(() => {
            if (this.isRunning) this.startListening();
          }, 1000);
          return json({ success: true, message: 'Message listener restart initiated' });
        } catch (e) {
          return json({ success: false, error: e.message });
        }
      }

      // GET /api/debug
      if (route === '/debug') {
        const mem = process.memoryUsage();
        return json({
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
          cwd: process.cwd(),
          memory: mem,
          uptime: Math.floor(process.uptime()),
          commands: this.commandLoader.getAllCommandNames(),
          events: this.eventLoader.getAllEventNames(),
          activeOnReply: global.GoatBot.onReply ? global.GoatBot.onReply.size : 0,
          activeOnReaction: global.GoatBot.onReaction ? global.GoatBot.onReaction.size : 0,
          configPrefix: config.PREFIX,
          noPrefix: config.NO_PREFIX
        });
      }

      res.writeHead(404); res.end('Not found');
    });

    server.listen(port, '0.0.0.0', () => {
      logger.info(`Dashboard running on port ${port} — visit http://localhost:${port}/ to open`);
    });
    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`Dashboard port ${port} in use, trying ${port + 1}...`);
        port++;
        setTimeout(() => server.listen(port, '0.0.0.0'), 500);
      } else {
        logger.error('Dashboard server error', { error: err.message });
      }
    });
    return server;
  }

  async start() {
      this.startHealthServer();
    try {
      Banner.display();
      logger.info('Starting Instagram Bot...');

      const database = require('../utils/database');
      await database.ready;
      global.db = database;
      global.utils = require('../utils.js');
      global.GoatBot = global.GoatBot || {};
      global.GoatBot.config = config;
      global.GoatBot.instance = this;
      global.client = global.client || {};
      global.client.database = {
          usersData: database.usersData,
          threadsData: database.threadsData,
          globalData: database.globalData
      };
      const path = require('path');
      global.client.dirConfig = path.resolve(__dirname, '../config/default.json');

      await this.commandLoader.loadCommands();
      await this.eventLoader.loadEvents();
      this.eventLoader.registerEvents();

      if (login && typeof login.setOptions === 'function') {
        login.setOptions(config.OPTIONS_ICA || config.OPTIONS_FCA);
      }

      await this.loadAndLogin();

      this._scheduleAutoRestart();
      this._scheduleAutoUptime();
    } catch (error) {
      logger.error('Failed to start bot', { error: error.message, stack: error.stack });
      this.isRunning = false;
      this.connectionStatus = 'offline';
      this.lastErrorReason = error.message;
      await this.eventLoader.handleEvent('error', error);
      if (this.shouldReconnect && this.reconnectAttempts < config.MAX_RECONNECT_ATTEMPTS) {
        this.scheduleReconnect();
      } else {
        logger.error('Unable to start bot, exiting...');
        process.exit(1);
      }
    }
  }

  async loadAndLogin() {
    let cookieData = null;
    const cookieFilePath = config.ACCOUNT_FILE || './account.txt';

    try {
      if (fs.existsSync(cookieFilePath)) {
        cookieData = fs.readFileSync(cookieFilePath, 'utf8').trim();
      }
    } catch (e) {
      logger.warn('Could not read account.txt file');
    }

    if (!cookieData && config.ACCOUNT_COOKIE) {
      cookieData = config.ACCOUNT_COOKIE;
    }

    const hasCredentials = !!(config.ACCOUNT_EMAIL && config.ACCOUNT_PASSWORD);

    if (cookieData) {
      logger.info('Loading cookies and logging in to Instagram...');
      try {
        let appState;
        if (cookieData.startsWith('[') || cookieData.startsWith('{')) {
          const parsed = JSON.parse(cookieData);
          if (parsed.cookies && Array.isArray(parsed.cookies.cookies)) appState = parsed.cookies.cookies;
          else if (parsed.cookies && Array.isArray(parsed.cookies)) appState = parsed.cookies;
          else if (Array.isArray(parsed)) appState = parsed;
          else appState = parsed;
        } else if (cookieData.includes('=')) {
          appState = cookieData.split(';').map(cookie => {
            const parts = cookie.trim().split('=');
            const name = parts[0];
            const value = parts.slice(1).join('=');
            if (!name || !value) return null;
            return {
              key: name.trim(),
              value: value.trim(),
              domain: '.instagram.com',
              path: '/'
            };
          }).filter(Boolean);

          if (appState.length === 0) {
            appState = [{ name: 'sessionid', value: cookieData.replace('sessionid=', '').trim(), domain: '.instagram.com', path: '/' }];
          }
        } else {
          appState = [{ name: 'sessionid', value: cookieData.trim(), domain: '.instagram.com', path: '/' }];
        }

        this.ig = await login({ appState });
      } catch (firstErr) {
        try {
          let cleanCookie = cookieData.replace('sessionid=', '').trim();
          this.ig = await login(`sessionid=${cleanCookie}`);
        } catch (secondErr) {
          if (hasCredentials) {
            logger.info('Cookie login failed — attempting fallback email/password login...');
            this.ig = await login({
              email: config.ACCOUNT_EMAIL,
              password: config.ACCOUNT_PASSWORD
            });
          } else {
            throw new Error('Cookie login failed. Please check if your cookies are valid or expired: ' + secondErr.message);
          }
        }
      }
    } else if (hasCredentials) {
      logger.info('No cookies found — logging in with email/password...');
      this.ig = await login({
        email: config.ACCOUNT_EMAIL,
        password: config.ACCOUNT_PASSWORD
      });
    } else {
      throw new Error(
        'No valid cookies in account.txt and no email/password configured. ' +
        'Please add Instagram cookies to account.txt or set ACCOUNT_EMAIL/ACCOUNT_PASSWORD.'
      );
    }

    if (!this.ig) {
      throw new Error('Login returned empty or invalid instance.');
    }

    this._afterLogin();

    if (hasCredentials && config.AUTO_REFRESH_FBSTATE && config.INTERVAL_GET_NEW_COOKIE) {
      this._scheduleCookieRefresh();
    }
  }

  _hasValidCookies(content) {
    try {
      const trimmed = content.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) return true;
    } catch (_) {}
    return content.split('\n').some(line => {
      const t = line.trim();
      if (!t || (t.startsWith('#') && !t.startsWith('#HttpOnly'))) return false;
      return t.includes('sessionid');
    });
  }

  saveSession() {
    try {
      if (!this.ig) return;
      let sessionData;
      if (typeof this.ig.exportSession === 'function') {
        sessionData = this.ig.exportSession('json');
      } else if (typeof this.ig.getSession === 'function') {
        sessionData = JSON.stringify(this.ig.getSession(), null, 2);
      }
      if (sessionData) {
        fs.writeFileSync(config.ACCOUNT_FILE, sessionData, 'utf-8');
        logger.info('Session state saved cleanly', { file: config.ACCOUNT_FILE });
      }
    } catch (e) {
      logger.error('Failed to save session', { error: e.message });
    }
  }

  _afterLogin() {
    try {
      const idResult = this.ig.getCurrentUserID();
      this.userID = typeof idResult === 'object'
        ? (idResult.userID || idResult.userId || String(idResult))
        : String(idResult);
    } catch (e) {
      this.userID = 'unknown';
    }

    this.username          = this.userID !== 'unknown' ? this.userID : 'unknown';
    this.api               = this.createAPIWrapper();
    global.GoatBot.icaApi  = this.api;
    global.GoatBot.fcaApi  = this.api;
    global.GoatBot.instance = this;

    // Call onLoad for commands now that API is ready
    const database = require('../utils/database');
    for (const [name, cmd] of this.commandLoader.commands) {
        if (typeof cmd.onLoad === 'function') {
            try {
                cmd.onLoad({
                    api: this.api,
                    bot: this,
                    database,
                    usersData: database.usersData,
                    threadsData: database.threadsData
                });
            } catch (e) {
                logger.error(`Error in onLoad of ${name}`, { error: e.message });
            }
        }
    }

    // custom.js support
    try {
        const custom = require('./custom.js');
        custom({
            api: this.api,
            bot: this,
            database,
            usersData: database.usersData,
            threadsData: database.threadsData,
            globalData: database.globalData,
            getText: (head, key, ...args) => require('../utils.js').getText(head, key, ...args)
        }).catch(e => logger.error('Error in custom.js', { error: e.message }));
    } catch (e) {
        logger.error('Failed to load custom.js', { error: e.message });
    }

    this.reconnectAttempts = 0;
    this.isRunning         = true;
    this.connectionStatus  = 'online';
    this.lastErrorReason   = null;
    logger.info('Connected to Instagram', { userID: this.userID });

    if (this.ig && typeof this.ig.on === 'function') {
      this.ig.on('cookiesUpdated', () => {
        logger.info('Session cookies refreshed by Instagram server — saving to account.txt');
        this.saveSession();
      });
    }

    this.saveSession();

    this.eventLoader.handleEvent('ready', {}).then(() => {
      this.startListening();
      this._startReminderScheduler();
      this._startAutoRemoveScheduler();
      this._startSessionChecker();
    });
  }

  startListening() {
    logger.info('Starting message listener...');

    this.ig.listen((err, event) => {
      if (err) {
        const msg = err.message || String(err);
        logger.error('Listen error', { error: msg });

        this.isRunning = false;
        this.lastErrorReason = msg;

        const isAuthError = /not authorized|login_required|unauthorized|checkpoint/i.test(msg);
        if (isAuthError) {
          this.connectionStatus = 'auth_error';
          logger.error('Session expired or invalid. Update account.txt or credentials in config.');
          this._sendMqttErrorNotification(msg);
          if (config.AUTO_RESTART_WHEN_MQTT_ERROR) {
            this.scheduleReconnect();
          }
        } else {
          this.connectionStatus = 'offline';
          if (this.shouldReconnect) {
            this.scheduleReconnect();
          }
        }
        return;
      }

      if (!event) return;

      if (event.type === 'message') {
        this.handleMessage(event).catch(error => {
          logger.error('Error handling message', { error: error.message });
        });
      } else if (event.type === 'event') {
        this.handleThreadEvent(event).catch(error => {
          logger.error('Error handling thread event', { error: error.message });
        });
      } else if (event.type === 'message_reaction') {
        this.handleReactionEvent(event).catch(error => {
          logger.error('Error handling reaction event', { error: error.message });
        });
      }
    });

    if (config.RESTART_LISTEN_MQTT.enable) {
      this._scheduleMqttRestart();
    }

    this.keepAlive();
  }

  _scheduleMqttRestart() {
    if (this._mqttRestartTimer) clearInterval(this._mqttRestartTimer);
    const { timeRestart, delayAfterStopListening, logNoti } = config.RESTART_LISTEN_MQTT;
    this._mqttRestartTimer = setInterval(() => {
      if (logNoti) logger.info('Periodic MQTT listener restart...');
      try { this.ig.stopListening(); } catch (_) {}
      setTimeout(() => {
        if (this.isRunning) this.startListening();
      }, delayAfterStopListening);
    }, timeRestart);
  }

  async handleMessage(event) {
    try {
      const { senderID, threadID, messageID, timestamp } = event;

      const currentBotID = this.userID || (this.ig && typeof this.ig.getCurrentUserID === 'function' ? this.ig.getCurrentUserID() : null);
      const botIDStr = typeof currentBotID === 'object' ? (currentBotID.userID || currentBotID.userId) : String(currentBotID || '');

      if (event.isSelf || (senderID && botIDStr && String(senderID) === String(botIDStr))) return;

      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      if ((timestamp || 0) < fiveMinutesAgo && timestamp) return;

      const msgKey  = messageID ? `${threadID}-${messageID}` : `${threadID}-${timestamp}`;
      const database = require('../utils/database');
      if (database.isMessageProcessed(msgKey)) return;
      database.markMessageAsProcessed(msgKey);

      if (this._logActivity && event.body) {
        const u = database.getUser(senderID);
        const thread = database.getThreadData(threadID);
        const isGroup = event.isGroup || false;

        // Asynchronously resolve user profile details if missing
        if (!u.name || !u.username) {
          this.ig.getUserInfo(senderID).then(info => {
            if (info) {
              u.name = info.fullName || info.full_name || info.name || '';
              u.username = info.username || '';
              u.avatarUrl = info.profilePicUrlHd || info.profile_pic_url_hd || info.profilePicUrl || '';
              database.updateUser(senderID, u);
              database.save();
            }
          }).catch(() => {});
        }

        // Asynchronously resolve group name if missing and is a group
        if (isGroup && (!thread.name || thread.name === 'Group Chat')) {
          this.ig.getThreadInfo(threadID).then(info => {
            if (info && info.thread_title) {
              thread.name = info.thread_title;
              database.setThreadData(threadID, thread);
              database.save();
            }
          }).catch(() => {});
        }

        const userName = u && (u.name || u.username) ? `${u.name} (@${u.username})` : senderID;
        const threadName = thread && thread.name ? thread.name : (isGroup ? 'Group Chat' : 'Direct Message');
        const preview = event.body.slice(0, 60) + (event.body.length > 60 ? '...' : '');
        this._logActivity(`Message from ${userName} in ${threadName}: "${preview}"`);
      }

      let normalizedReply = null;
      if (event.messageReply) {
        const r = event.messageReply;
        const rSender = r.senderID || r.senderId || r.user_id || r.userId || r.author;
        const rMsgId = r.messageID || r.messageId || r.item_id || r.itemId || event.replyTo;
        normalizedReply = {
          ...r,
          senderID: rSender,
          senderId: rSender,
          messageID: rMsgId,
          messageId: rMsgId,
          item_id: rMsgId,
          body: r.body || r.text || '',
          attachments: r.attachments || []
        };
      } else if (event.replyTo) {
        normalizedReply = {
          messageID: event.replyTo,
          messageId: event.replyTo,
          item_id: event.replyTo,
          senderID: null,
          senderId: null,
          body: '',
          attachments: []
        };
      }

      const isReply = !!normalizedReply;
      const normalizedEvent = {
        threadID,
        threadId: threadID,
        messageID,
        messageId: messageID,
        senderID,
        senderId: senderID,
        body:           event.body           || '',
        timestamp:      timestamp            || Date.now(),
        type:           isReply ? 'message_reply' : (event.type || 'message'),
        attachments:    event.attachments    || [],
        isVoiceMessage: event.isVoiceMessage || false,
        isGroup:        event.isGroup        || false,
        mentions:       event.mentions       || {},
        replyToItemId:  event.replyTo || (normalizedReply ? normalizedReply.messageID : null),
        messageReply:   normalizedReply
      };

      await this.eventLoader.handleEvent('message', normalizedEvent);

      // Global onChat for GoatBot V2 commands
      for (const [name, cmd] of this.commandLoader.commands) {
        if (typeof cmd.onChat === 'function') {
          cmd.onChat({
            api: this.api,
            event: normalizedEvent,
            bot: this,
            database: require('../utils/database'),
            usersData: require('../utils/database').usersData,
            threadsData: require('../utils/database').threadsData,
            getLang: (...args) => require('../utils.js').getText(cmd.config.name, ...args),
            message: {
                reply: (form, callback) => this.api.sendMessage(form, normalizedEvent.threadId, callback, normalizedEvent.messageID),
                send: (form, callback) => this.api.sendMessage(form, normalizedEvent.threadId, callback),
                reaction: (emoji, messageID, callback) => this.api.setMessageReaction(emoji, messageID || normalizedEvent.messageID, callback),
                unsend: (messageID, callback) => this.api.unsendMessage(messageID || normalizedEvent.messageID, callback),
                err: async (err) => {
                    const msg = typeof err === 'object' ? err.message || JSON.stringify(err) : String(err);
                    return await this.api.sendMessage(`❌ Error: ${msg}`, normalizedEvent.threadId);
                }
            }
          }).catch(error => logger.error(`onChat error in ${name}`, { error: error.message }));
        }
      }
    } catch (error) {
      logger.error('Error in handleMessage', { error: error.message, stack: error.stack });
    }
  }

  async handleThreadEvent(event) {
    try {
      const threadID = event.threadID;
      const logType  = event.logMessageType || '';
      const database = require('../utils/database');

      // Global onEvent for GoatBot V2 commands
      for (const [name, cmd] of this.commandLoader.commands) {
          if (typeof cmd.onEvent === 'function') {
              cmd.onEvent({
                  api: this.api,
                  event,
                  bot: this,
                  database,
                  usersData: database.usersData,
                  threadsData: database.threadsData,
                  getLang: (...args) => require('../utils.js').getText(cmd.config.name, ...args),
                  message: {
                      reply: (form, callback) => this.api.sendMessage(form, event.threadID || event.threadId, callback, event.messageID),
                      send: (form, callback) => this.api.sendMessage(form, event.threadID || event.threadId, callback),
                      reaction: (emoji, messageID, callback) => this.api.setMessageReaction(emoji, messageID || event.messageID, callback),
                      unsend: (messageID, callback) => this.api.unsendMessage(messageID || event.messageID, callback),
                      err: async (err) => {
                          const msg = typeof err === 'object' ? err.message || JSON.stringify(err) : String(err);
                          return await this.api.sendMessage(`❌ Error: ${msg}`, event.threadID || event.threadId);
                      }
                  }
              }).catch(e => logger.error(`onEvent error in ${name}`, { error: e.message }));
          }
      }

      if (logType === 'log:subscribe') {
        const added = event.logMessageData?.addedParticipants || [];
        const botAdded = added.some(p =>
          String(p.userFbId || p.userId || '') === String(this.userID)
        );

        if (botAdded) {
          await this.eventLoader.handleEvent('bot_added', {
            threadID,
            threadId: threadID,
            addedBy: event.author || event.senderID || '',
            addedParticipants: added,
            timestamp: event.timestamp || Date.now()
          });
        } else {
          await this.eventLoader.handleEvent('gc_join', {
            threadID,
            threadId: threadID,
            addedParticipants: added,
            addedBy: event.author || event.senderID || '',
            timestamp: event.timestamp || Date.now()
          });
        }
      } else if (logType === 'log:unsubscribe') {
        const leftUserId = event.logMessageData?.leftParticipantFbId
          || event.logMessageData?.leftParticipantUserFbId
          || '';

        await this.eventLoader.handleEvent('gc_leave', {
          threadID,
          threadId: threadID,
          leftUserId: String(leftUserId),
          timestamp: event.timestamp || Date.now()
        });
      }
    } catch (error) {
      logger.error('Error in handleThreadEvent', { error: error.message });
    }
  }

  async handleReactionEvent(event) {
    try {
      await this.eventLoader.handleEvent('message_reaction', {
        threadID:        event.threadID,
        threadId:        event.threadID,
        senderID:        event.senderID,
        senderId:        event.senderID,
        messageID:       event.messageID,
        messageId:       event.messageID,
        reaction:        event.reaction,
        reactionStatus:  event.reactionStatus,
        targetMessageID: event.targetMessageID,
        targetMessageId: event.targetMessageID,
        timestamp:       event.timestamp || Date.now()
      });
    } catch (error) {
      logger.error('Error in handleReactionEvent', { error: error.message });
    }
  }

  _threadInfoCache = new Map();

  async getThreadInfo(threadID) {
    const cached = this._threadInfoCache.get(String(threadID));
    if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.data;
    try {
      const info = await this.api.getThread(threadID);
      this._threadInfoCache.set(String(threadID), { data: info, ts: Date.now() });
      return info;
    } catch {
      return null;
    }
  }

  createAPIWrapper() {
    const ig = new Proxy({}, { get: (_, prop) => this.ig?.[prop] });
    const utils = require('../utils.js');

    return {
      sendMessage: async (form, threadID, callback, replyToMessageID) => {
        try {
          if (typeof threadID === 'function') {
              callback = threadID;
              threadID = null;
          }
          if (!threadID) threadID = form.threadID || form.threadId;

          let text = typeof form === 'object' ? (form.body !== undefined ? form.body : '') : String(form);
          let attachment = typeof form === 'object' ? (form.attachment || form.photo || form.image || form.video || form.audio || form.voice || form.media || null) : null;

          if (config.TYPING_INDICATOR && threadID && ig?.sendTypingIndicator) {
            ig.sendTypingIndicator(threadID).catch(() => {});
            const typingJitter = Math.min(Math.max((text?.length || 0) * 3, 40), 200);
            await new Promise(resolve => setTimeout(resolve, typingJitter));
          }

          let result;
          if (attachment) {
              const rawList = Array.isArray(attachment) ? attachment : [attachment];
              const tempFiles = [];

              for (const rawItem of rawList) {
                  let item = (rawItem && typeof rawItem === 'object' && !rawItem.readable && !rawItem.pipe && !Buffer.isBuffer(rawItem))
                      ? (rawItem.url || rawItem.path || rawItem.photo || rawItem.video || rawItem.audio || rawItem.voice || rawItem.image || rawItem)
                      : rawItem;

                  let mediaPath = null;

                  // 1. Handle URL strings
                  if (typeof item === 'string' && item.startsWith('http')) {
                      try {
                          const stream = await utils.getStreamFromURL(item);
                          const headerType = (stream.headers?.['content-type'] || '').split(';')[0].trim().toLowerCase();
                          let ext = utils.getExtFromMimeType(headerType);
                          if (!ext || ext === 'unknown') {
                              if (headerType.startsWith('video/')) ext = 'mp4';
                              else if (headerType.startsWith('audio/')) ext = 'mp3';
                              else if (item.toLowerCase().includes('.mp4')) ext = 'mp4';
                              else if (item.toLowerCase().includes('.mp3')) ext = 'mp3';
                              else ext = 'jpg';
                          }
                          const tempPath = path.join(process.cwd(), 'temp', `media_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`);
                          await fs.ensureDir(path.dirname(tempPath));
                          const writer = fs.createWriteStream(tempPath);
                          stream.pipe(writer);
                          await new Promise((resolve, reject) => {
                              writer.on('finish', resolve);
                              writer.on('error', reject);
                          });
                          mediaPath = tempPath;
                          tempFiles.push(tempPath);
                      } catch (e) {
                          logger.error('Failed to download attachment from URL', { url: item, error: e.message });
                      }
                  }
                  // 2. Handle Streams and Buffers
                  else if (item && (item.readable || item.pipe || Buffer.isBuffer(item))) {
                      let rawExt = item.filename ? path.extname(item.filename) : (item.name ? path.extname(item.name) : (item.path ? path.extname(item.path) : (item._path ? path.extname(item._path) : '')));
                      if (!rawExt && item.mimeType) {
                          rawExt = utils.getExtFromMimeType(item.mimeType);
                      }
                      if (!rawExt || rawExt === '.' || rawExt === '') rawExt = '.jpg';
                      const ext = rawExt.startsWith('.') ? rawExt : `.${rawExt}`;
                      const tempPath = path.join(process.cwd(), 'temp', `media_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
                      await fs.ensureDir(path.dirname(tempPath));

                      if (Buffer.isBuffer(item)) {
                          await fs.writeFile(tempPath, item);
                      } else {
                          const writer = fs.createWriteStream(tempPath);
                          item.pipe(writer);
                          await new Promise((resolve, reject) => {
                              writer.on('finish', resolve);
                              writer.on('error', reject);
                          });
                      }
                      mediaPath = tempPath;
                      tempFiles.push(tempPath);
                  }
                  // 3. Handle local existing file paths
                  else if (typeof item === 'string' && fs.existsSync(item)) {
                      mediaPath = item;
                  }

                  if (mediaPath) {
                      const lowerPath = mediaPath.toLowerCase();
                      const opts = { caption: text };
                      if (replyToMessageID) opts.replyToMessageID = replyToMessageID;

                      try {
                          if (lowerPath.endsWith('.mp4') || lowerPath.endsWith('.mov') || lowerPath.endsWith('.mkv') || lowerPath.endsWith('.webm') || lowerPath.endsWith('.avi') || lowerPath.endsWith('.m4v')) {
                              result = await ig.sendVideo(threadID, mediaPath, opts);
                          } else if (lowerPath.endsWith('.mp3') || lowerPath.endsWith('.wav') || lowerPath.endsWith('.m4a') || lowerPath.endsWith('.ogg') || lowerPath.endsWith('.aac') || lowerPath.endsWith('.opus') || lowerPath.endsWith('.flac')) {
                              result = await ig.sendVoice(threadID, mediaPath);
                          } else {
                              result = await ig.sendPhoto(threadID, mediaPath, opts);
                          }
                      } catch (mediaErr) {
                          logger.error('Error dispatching media to Instagram API', { error: mediaErr.message, mediaPath });
                          if (text) {
                              result = await ig.sendMessage(text, threadID).catch(() => {});
                          }
                      }
                  }
              }
              // Cleanup temp files after sending
              for (const f of tempFiles) {
                  fs.unlink(f).catch(() => {});
              }
          } else {
              if (replyToMessageID) {
                  try {
                      result = await ig.replyToMessage(threadID, text, replyToMessageID);
                  } catch (e) {
                      result = await ig.sendMessage(text, threadID);
                  }
              } else {
                  result = await ig.sendMessage(text, threadID);
              }
          }

          if (result?.messageID || result?.messageId) {
            const mID = result.messageID || result.messageId;
            const db = require('../utils/database');
            db.storeSentMessage(threadID, mID);
          }
          if (typeof callback === 'function') callback(null, result);
          return result;
        } catch (error) {
          logger.error('Failed to send message', { error: error.message, threadID });
          if (/login_required|not authorized|unauthorized|checkpoint/i.test(error.message)) {
            logger.warn('Auth error detected during sendMessage, triggering reconnection...');
            this.connectionStatus = 'auth_error';
            this.lastErrorReason = error.message;
            this.isRunning = false;
            this.scheduleReconnect();
          }
          if (typeof callback === 'function') callback(error);
          throw error;
        }
      },

      sendMessageToUser: async (userID, text) => {
        try {
          return await ig.sendDirectMessage(userID, text);
        } catch (error) {
          logger.error('Failed to send direct message', { error: error.message, userID });
          throw error;
        }
      },

      getThread: async (threadID, callback) => {
        try {
          const info = await ig.getThreadInfo(threadID);
          if (typeof callback === 'function') callback(null, info);
          return info;
        } catch (error) {
          logger.error('Failed to get thread', { error: error.message, threadID });
          if (typeof callback === 'function') callback(error);
          throw error;
        }
      },

      getThreadInfo: async (threadID, callback) => {
        try {
          const info = await ig.getThreadInfo(threadID);
          if (typeof callback === 'function') callback(null, info);
          return info;
        } catch (error) {
          logger.error('Failed to get thread', { error: error.message, threadID });
          if (typeof callback === 'function') callback(error);
          throw error;
        }
      },

      getInbox: async () => {
        try {
          return await ig.getInbox();
        } catch (error) {
          logger.error('Failed to get inbox', { error: error.message });
          throw error;
        }
      },

      markAsSeen: async (threadID) => {
        try {
          return await ig.markAsRead(threadID, true);
        } catch (error) {
          logger.error('Failed to mark as seen', { error: error.message, threadID });
        }
      },

      sendPhoto: async (arg1, arg2, opts = {}) => {
        try {
          let threadID = arg1;
          let photoPath = arg2;
          if (typeof arg1 === 'string' && (arg1.includes('/') || arg1.includes('\\') || arg1.startsWith('http')) && !/^\d+$/.test(arg1)) {
            photoPath = arg1;
            threadID = arg2;
          }
          if (config.TYPING_INDICATOR && threadID) {
            ig.sendTypingIndicator(threadID).catch(() => {});
          }
          return await ig.sendPhoto(threadID, photoPath, opts);
        } catch (error) {
          logger.error('Failed to send photo', { error: error.message });
          if (/login_required|not authorized|unauthorized|checkpoint/i.test(error.message)) {
            logger.warn('Auth error detected during sendPhoto, triggering reconnection...');
            this.connectionStatus = 'auth_error';
            this.lastErrorReason = error.message;
            this.isRunning = false;
            this.scheduleReconnect();
          }
          throw error;
        }
      },

      sendVideo: async (arg1, arg2, opts = {}) => {
        try {
          let threadID = arg1;
          let videoPath = arg2;
          if (typeof arg1 === 'string' && (arg1.includes('/') || arg1.includes('\\') || arg1.startsWith('http')) && !/^\d+$/.test(arg1)) {
            videoPath = arg1;
            threadID = arg2;
          }
          if (config.TYPING_INDICATOR && threadID) {
            ig.sendTypingIndicator(threadID).catch(() => {});
          }
          return await ig.sendVideo(threadID, videoPath, opts);
        } catch (error) {
          logger.error('Failed to send video', { error: error.message });
          if (/login_required|not authorized|unauthorized|checkpoint/i.test(error.message)) {
            logger.warn('Auth error detected during sendVideo, triggering reconnection...');
            this.connectionStatus = 'auth_error';
            this.lastErrorReason = error.message;
            this.isRunning = false;
            this.scheduleReconnect();
          }
          throw error;
        }
      },

      sendAudio: async (arg1, arg2, opts = {}) => {
        try {
          let threadID = arg1;
          let audioPath = arg2;
          if (typeof arg1 === 'string' && (arg1.includes('/') || arg1.includes('\\') || arg1.startsWith('http')) && !/^\d+$/.test(arg1)) {
            audioPath = arg1;
            threadID = arg2;
          }
          if (config.TYPING_INDICATOR && threadID) {
            ig.sendTypingIndicator(threadID).catch(() => {});
          }
          return await ig.sendVoice(threadID, audioPath, opts);
        } catch (error) {
          logger.error('Failed to send audio', { error: error.message });
          if (/login_required|not authorized|unauthorized|checkpoint/i.test(error.message)) {
            logger.warn('Auth error detected during sendAudio, triggering reconnection...');
            this.connectionStatus = 'auth_error';
            this.lastErrorReason = error.message;
            this.isRunning = false;
            this.scheduleReconnect();
          }
          throw error;
        }
      },

      sendVoice: async (arg1, arg2, opts = {}) => {
        try {
          let threadID = arg1;
          let audioPath = arg2;
          if (typeof arg1 === 'string' && (arg1.includes('/') || arg1.includes('\\') || arg1.startsWith('http')) && !/^\d+$/.test(arg1)) {
            audioPath = arg1;
            threadID = arg2;
          }
          if (config.TYPING_INDICATOR && threadID) {
            ig.sendTypingIndicator(threadID).catch(() => {});
          }
          return await ig.sendVoice(threadID, audioPath, opts);
        } catch (error) {
          logger.error('Failed to send voice', { error: error.message });
          throw error;
        }
      },

      unsendMessage: async (messageID, threadID, callback) => {
        if (typeof threadID === 'function') {
          callback = threadID;
          threadID = null;
        }
        try {
          const res = await ig.unsendMessage(messageID);
          if (typeof callback === 'function') callback(null, res);
          return res;
        } catch (error) {
          const cleanErr = new Error(`Failed to unsend message: ${error?.message || 'Message cannot be unsent'}`);
          logger.error('Failed to unsend message', { error: cleanErr.message, messageID });
          if (typeof callback === 'function') callback(cleanErr);
          return false;
        }
      },

      getLastSentMessage: (threadID) => {
        const db = require('../utils/database');
        return db.getLastSentMessage(threadID);
      },

      getAvatarUrl: async (userID) => {
        try {
          if (!userID) return '';
          const clean = String(userID).replace(/^@+/, '').trim();
          let info = null;
          if (/^\d+$/.test(clean)) {
            info = await ig.getUserInfo(clean).catch(() => null);
          } else {
            info = await ig.getUserInfoByUsername(clean).catch(() => null);
          }
          return info?.profilePicUrlHd || info?.profile_pic_url_hd || info?.profilePicUrl || info?.profile_pic_url || '';
        } catch (_) {
          return '';
        }
      },

      getUserInfo: async (userID, callback) => {
        try {
          const fetchSingle = async (id) => {
            if (!id) return {};
            const clean = String(id).replace(/^@+/, '').trim();
            let raw = null;
            if (/^\d+$/.test(clean)) {
              raw = await ig.getUserInfo(clean).catch(() => null);
            } else {
              raw = await ig.getUserInfoByUsername(clean).catch(() => null);
            }
            if (!raw || typeof raw !== 'object') raw = {};

            const cleanId = String(raw.pk || raw.id || raw.userID || raw.userId || clean || '');
            const mapped = {
              userID: cleanId,
              userId: cleanId,
              pk: cleanId,
              name: raw.fullName || raw.full_name || raw.name || raw.username || '',
              fullName: raw.fullName || raw.full_name || raw.name || '',
              full_name: raw.fullName || raw.full_name || raw.name || '',
              username: raw.username || '',
              vanity: raw.username || '',
              firstName: (raw.fullName || raw.full_name || raw.name || '').split(' ')[0] || '',
              profilePicUrl: raw.profilePicUrl || raw.profile_pic_url || raw.profilePicUrlHd || raw.profile_pic_url_hd || '',
              profilePicUrlHd: raw.profilePicUrlHd || raw.profile_pic_url_hd || raw.profilePicUrl || raw.profile_pic_url || '',
              thumbSrc: raw.profilePicUrl || raw.profile_pic_url || raw.profilePicUrlHd || raw.profile_pic_url_hd || '',
              profileUrl: raw.username ? `https://instagram.com/${raw.username}` : '',
              bio: raw.biography || raw.bio || '',
              biography: raw.biography || raw.bio || '',
              isPrivate: Boolean(raw.isPrivate || raw.is_private),
              isVerified: Boolean(raw.isVerified || raw.is_verified),
              followerCount: Number(raw.followerCount || raw.follower_count || 0),
              followingCount: Number(raw.followingCount || raw.following_count || 0),
              mediaCount: Number(raw.mediaCount || raw.media_count || 0),
              gender: raw.gender || '',
              type: 'user',
              isFriend: false,
              isBirthday: false
            };
            return mapped;
          };

          const ids = Array.isArray(userID) ? userID : [userID];
          const resMap = {};
          for (const id of ids) {
            const key = String(id);
            resMap[key] = await fetchSingle(id);
          }

          let finalResult;
          if (Array.isArray(userID)) {
            finalResult = resMap;
          } else {
            const singleKey = String(userID);
            const singleVal = resMap[singleKey] || {};
            finalResult = { [singleKey]: singleVal, ...singleVal };
          }

          if (typeof callback === 'function') callback(null, finalResult);
          return finalResult;
        } catch (error) {
          logger.error('Failed to get user info', { error: error.message, userID });
          const ids = Array.isArray(userID) ? userID : [userID];
          const errRes = {};
          for (const id of ids) {
            const cleanId = String(id);
            errRes[cleanId] = {
              userID: cleanId, userId: cleanId, pk: cleanId, name: '', fullName: '', full_name: '', username: '', vanity: '', firstName: '', profilePicUrl: '', profilePicUrlHd: '', thumbSrc: '', profileUrl: '', bio: '', biography: '', isPrivate: false, isVerified: false, followerCount: 0, followingCount: 0, mediaCount: 0, gender: '', type: 'user', isFriend: false, isBirthday: false
            };
          }
          const finalErr = Array.isArray(userID) ? errRes : { [String(userID)]: errRes[String(userID)], ...errRes[String(userID)] };
          if (typeof callback === 'function') callback(null, finalErr);
          return finalErr;
        }
      },

      getUserInfoByUsername: async (username) => {
        try {
          const clean = String(username).replace(/^@+/, '').trim();
          return await ig.getUserInfoByUsername(clean);
        } catch (error) {
          logger.error('Failed to get user info by username', { error: error.message, username });
          throw error;
        }
      },

      sendPhotoFromUrl: async (threadID, url, opts = {}) => {
        try {
          if (typeof ig.sendPhotoFromUrl === 'function') {
            return await ig.sendPhotoFromUrl(threadID, url, opts);
          }
          const utils = require('../utils.js');
          const stream = await utils.getStreamFromURL(url);
          const headerType = (stream.headers?.['content-type'] || '').split(';')[0].trim().toLowerCase();
          let ext = utils.getExtFromMimeType(headerType);
          if (!ext || ext === 'unknown') ext = 'jpg';
          const tempPath = path.join(process.cwd(), 'temp', `photo_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`);
          await fs.ensureDir(path.dirname(tempPath));
          const writer = fs.createWriteStream(tempPath);
          stream.pipe(writer);
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          const result = await ig.sendPhoto(threadID, tempPath, opts);
          fs.unlink(tempPath).catch(() => {});
          return result;
        } catch (error) {
          logger.error('Failed to send photo from url', { error: error.message, threadID });
          throw error;
        }
      },

      sendVideoFromUrl: async (threadID, url, opts = {}) => {
        try {
          if (typeof ig.sendVideoFromUrl === 'function') {
            return await ig.sendVideoFromUrl(threadID, url, opts);
          }
          const utils = require('../utils.js');
          const stream = await utils.getStreamFromURL(url);
          const headerType = (stream.headers?.['content-type'] || '').split(';')[0].trim().toLowerCase();
          let ext = utils.getExtFromMimeType(headerType);
          if (!ext || ext === 'unknown') ext = 'mp4';
          const tempPath = path.join(process.cwd(), 'temp', `video_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`);
          await fs.ensureDir(path.dirname(tempPath));
          const writer = fs.createWriteStream(tempPath);
          stream.pipe(writer);
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          const result = await ig.sendVideo(threadID, tempPath, opts);
          fs.unlink(tempPath).catch(() => {});
          return result;
        } catch (error) {
          logger.error('Failed to send video from url', { error: error.message, threadID });
          throw error;
        }
      },

      sendVoiceFromUrl: async (threadID, url, opts = {}) => {
        try {
          if (typeof ig.sendVoiceFromUrl === 'function') {
            return await ig.sendVoiceFromUrl(threadID, url, opts);
          }
          const utils = require('../utils.js');
          const stream = await utils.getStreamFromURL(url);
          const headerType = (stream.headers?.['content-type'] || '').split(';')[0].trim().toLowerCase();
          let ext = utils.getExtFromMimeType(headerType);
          if (!ext || ext === 'unknown') ext = 'mp3';
          const tempPath = path.join(process.cwd(), 'temp', `audio_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`);
          await fs.ensureDir(path.dirname(tempPath));
          const writer = fs.createWriteStream(tempPath);
          stream.pipe(writer);
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          const result = await ig.sendVoice(threadID, tempPath, opts);
          fs.unlink(tempPath).catch(() => {});
          return result;
        } catch (error) {
          logger.error('Failed to send voice from url', { error: error.message, threadID });
          throw error;
        }
      },

      sendReaction: async (reaction, messageID) => {
        try {
          return await ig.sendReaction(reaction, messageID);
        } catch (error) {
          logger.error('Failed to send reaction', { error: error.message, messageID });
        }
      },

      replyToMessage: async (threadID, text, replyToMessageID) => {
        try {
          if (config.TYPING_INDICATOR && threadID) {
            ig.sendTypingIndicator(threadID).catch(() => {});
          }
          return await ig.replyToMessage(threadID, text, replyToMessageID);
        } catch (error) {
          logger.error('Failed to reply to message', { error: error.message, threadID });
          throw error;
        }
      },

      setMessageReaction: async (reaction, messageID, callback, force) => {
          try {
              const res = await ig.sendReaction(reaction, messageID);
              if (typeof callback === 'function') callback(null, res);
              return res;
          } catch (e) {
              logger.error('Failed to set reaction', { error: e.message });
              if (typeof callback === 'function') callback(e);
          }
      },

      changeNickname: async (nickname, threadID, userID) => {
          logger.warn('changeNickname is not fully supported by underlying API');
          return true;
      },

      resolvePhotoUrl: async (photoID) => {
          // Mock for rank card etc.
          return photoID;
      },

      getThreadList: async (limit, timestamp, tags) => {
          try {
              // Map tags to folder if needed, e.g. ['PENDING'] -> 'pending'
              let folder = 'inbox';
              if (tags && tags.includes('PENDING')) folder = 'pending';
              if (tags && tags.includes('OTHER')) folder = 'other';

              const result = await ig.getThreadList(limit, folder);
              // Normalize result to array if it's an object with threads
              return result?.threads || result?.items || result || [];
          } catch (error) {
              logger.error('Failed to get thread list', { error: error.message });
              throw error;
          }
      },

      getCurrentUserID: () => this.userID,

      deleteMessage: async (threadID, messageID) => {
          return await ig.unsendMessage(messageID);
      },

      addUserToGroup: async (arg1, arg2) => {
          try {
              let userIDs = arg1;
              let threadID = arg2;
              if (Array.isArray(arg2) || (typeof arg2 === 'string' && /^\d+$/.test(arg2) && typeof arg1 === 'string' && arg1.length > 15)) {
                  userIDs = arg2;
                  threadID = arg1;
              }
              if (typeof ig.addUserToGroup === 'function') return await ig.addUserToGroup(userIDs, threadID);
              if (ig.threadManagement && typeof ig.threadManagement.addUsers === 'function') return await ig.threadManagement.addUsers(threadID, userIDs);
              logger.warn('addUserToGroup not supported by API');
          } catch (e) {
              logger.error('addUserToGroup error', { error: e.message });
              throw e;
          }
      },

      removeUserFromGroup: async (userID, threadID) => {
          try {
              if (typeof ig.removeUserFromGroup === 'function') return await ig.removeUserFromGroup(userID, threadID);
              if (typeof ig.removeParticipant === 'function') return await ig.removeParticipant(threadID, userID);
              logger.warn('removeUserFromGroup not supported by API');
          } catch (e) {
              logger.error('removeUserFromGroup error', { error: e.message });
              throw e;
          }
      },

      setTitle: async (arg1, arg2) => {
          try {
              let title = arg1;
              let threadID = arg2;
              if (typeof arg1 === 'string' && /^\d+$/.test(arg1) && typeof arg2 === 'string') {
                  threadID = arg1;
                  title = arg2;
              }
              if (typeof ig.setTitle === 'function') return await ig.setTitle(title, threadID);
              if (typeof ig.setThreadTitle === 'function') return await ig.setThreadTitle(threadID, title);
              if (typeof ig.changeThreadTitle === 'function') return await ig.changeThreadTitle(threadID, title);
              logger.warn('setTitle not supported by API');
          } catch (e) {
              logger.error('setTitle error', { error: e.message });
          }
      },

      changeAdminStatus: async (threadID, userID, isAdmin) => {
          logger.warn('changeAdminStatus not fully supported');
          return true;
      },

      getThreadHistory: async (threadID, limit) => {
          try {
              return await ig.getThreadHistory(threadID, limit);
          } catch (e) {
              return [];
          }
      },

      shareContact: async (text, senderID, threadID) => {
          return await ig.sendMessage(text, threadID);
      },

      getAvatarUrl: async (userID) => {
          try {
              if (!userID) return null;
              if (typeof userID === 'string' && userID.startsWith('http')) return userID;

              const db = require('../utils/database');
              const cleanInput = String(userID).replace(/^@+/, '').trim();

              const dbUser = db.getUser(cleanInput) || db.getUser(userID);
              if (dbUser && dbUser.avatarUrl && dbUser.avatarUrl.startsWith('http')) {
                  return dbUser.avatarUrl;
              }

              let info;
              if (!/^\d+$/.test(cleanInput)) {
                  info = await ig.getUserInfoByUsername(cleanInput).catch(() => null);
              } else {
                  info = await ig.getUserInfo(cleanInput).catch(() => null);
              }

              const url = info?.profilePicUrlHd || info?.hdProfilePicUrlInfo?.url || info?.profile_pic_url_hd || info?.profilePicUrl || info?.avatarUrl;
              if (url && url.startsWith('http')) {
                  if (dbUser) {
                      dbUser.avatarUrl = url;
                      db.updateUser(cleanInput, dbUser);
                  }
                  return url;
              }

              return `https://www.instagram.com/p/avatar/${cleanInput}`;
          } catch (e) {
              return `https://www.instagram.com/p/avatar/${userID}`;
          }
      },

      sendTypingIndicator: async (threadID) => {
          try {
              return await ig.sendTypingIndicator(threadID);
          } catch (e) {
              return false;
          }
      },

      markAsRead: async (threadID) => {
          try {
              return await ig.markAsRead(threadID);
          } catch (e) {
              return false;
          }
      }
    };
  }

  _startSessionChecker() {
    if (this._sessionCheckerTimer) clearInterval(this._sessionCheckerTimer);
    // Check every 3 minutes
    this._sessionCheckerTimer = setInterval(async () => {
      if (!this.isRunning || !this.ig) return;
      try {
        await this.ig.getInbox({ limit: 1 });
      } catch (err) {
        const msg = err.message || String(err);
        const isAuthError = /not authorized|login_required|unauthorized|checkpoint/i.test(msg);
        if (isAuthError) {
          logger.error('Session checker detected expired/invalid session', { error: msg });
          this.isRunning = false;
          this.connectionStatus = 'auth_error';
          this.lastErrorReason = msg;
          this._sendMqttErrorNotification(msg);
          if (config.AUTO_RESTART_WHEN_MQTT_ERROR) {
            this.scheduleReconnect();
          }
        }
      }
    }, 180000); // 3 minutes
    logger.info('Session checker started (checks every 3m)');
  }

  _startReminderScheduler() {
    if (this._reminderTimer) clearInterval(this._reminderTimer);
    this._reminderTimer = setInterval(async () => {
      try {
        const database = require('../utils/database');
        const due = database.getDueReminders();
        for (const reminder of due) {
          database.removeReminder(reminder.id);
          try {
            await this.api.sendMessageToUser(reminder.userId, `⏰ Reminder!\n\n"${reminder.message}"`);
          } catch (err) {
            logger.warn('Could not deliver reminder', { userId: reminder.userId, error: err.message });
          }
        }
        if (due.length > 0) database.save();
      } catch (err) {
        logger.error('Reminder scheduler error', { error: err.message });
      }
    }, 30000);
    logger.info('Reminder scheduler started (checks every 30s)');
  }


  _startAutoRemoveScheduler() {
    if (this._autoRemoveTimer) clearInterval(this._autoRemoveTimer);
    if (!config.AUTO_REMOVE_ERROR?.enable) return;

    this._autoRemoveTimer = setInterval(async () => {
      try {
        const database = require('../utils/database');
        const expired = database.getExpiredAutoRemoveMessages();
        for (const msg of expired) {
          try {
            await this.api.unsendMessage(msg.messageId);
          } catch (err) {
            // Ignore errors (message might already be unsent or permission issue)
          }
        }
      } catch (err) {
        logger.error('Auto-remove scheduler error', { error: err.message });
      }
    }, 5000); // Check every 5 seconds
    logger.info('Auto-remove scheduler started (checks every 5s)');
  }

  _scheduleAutoRestart() {
    const time = config.AUTO_RESTART_TIME;
    if (!time) return;

    if (typeof time === 'string' && cron.validate(time)) {
      logger.info(`Auto-restart scheduled with cron: ${time}`);
      cron.schedule(time, () => {
        logger.info('Auto-restart triggered by cron.');
        process.exit(0);
      }, { timezone: config.TIMEZONE });
    } else {
      const ms = parseInt(time, 10);
      if (ms > 0) {
        logger.info(`Auto-restart scheduled every ${ms}ms.`);
        setTimeout(() => {
          logger.info('Auto-restart triggered.');
          process.exit(0);
        }, ms);
      }
    }
  }

  _scheduleAutoUptime() {
    if (!config.AUTO_UPTIME_ENABLE) return;
    const intervalMs = config.AUTO_UPTIME_INTERVAL * 1000;
    const url = config.AUTO_UPTIME_URL || process.env.REPLIT_DEV_DOMAIN || '';
    if (!url) return;

    logger.info(`Auto-uptime ping to ${url} every ${config.AUTO_UPTIME_INTERVAL}s`);
    setInterval(() => {
      axios.get(url).catch(() => {});
    }, intervalMs);
  }

  _scheduleCookieRefresh() {
    if (this._cookieRefreshTimer) clearInterval(this._cookieRefreshTimer);
    const intervalMs = (config.INTERVAL_GET_NEW_COOKIE || 1440) * 60 * 1000;
    logger.info(`Cookie auto-refresh scheduled every ${config.INTERVAL_GET_NEW_COOKIE} minutes.`);
    this._cookieRefreshTimer = setInterval(async () => {
      logger.info('Refreshing cookies via email/password login...');
      try {
        this.ig = await login({
          email:    config.ACCOUNT_EMAIL,
          password: config.ACCOUNT_PASSWORD
        });
        this._afterLogin();
        this.saveSession();
        logger.info('Cookie refresh successful.');
      } catch (err) {
        logger.error('Cookie refresh failed.', { error: err.message });
      }
    }, intervalMs);
  }

  async _sendMqttErrorNotification(errorMsg) {
    const { telegram, discordHook } = config.NOTI_MQTT_ERROR;
    if (telegram.enable && telegram.botToken) {
      const chatIds = telegram.chatId.split(/[, ]+/).filter(Boolean);
      for (const chatId of chatIds) {
        axios.post(`https://api.telegram.org/bot${telegram.botToken}/sendMessage`, {
          chat_id: chatId,
          text: `⚠️ Bot MQTT error:\n${errorMsg}`
        }).catch(() => {});
      }
    }
    if (discordHook.enable && discordHook.webhookUrl) {
      const urls = discordHook.webhookUrl.split(/[ ]+/).filter(Boolean);
      for (const url of urls) {
        axios.post(url, { content: `⚠️ Bot MQTT error:\n${errorMsg}` }).catch(() => {});
      }
    }
  }

  scheduleReconnect() {
    this.connectionStatus  = 'reconnecting';
    this.isRunning         = false;
    this.reconnectAttempts++;
    if (this.reconnectAttempts >= config.MAX_RECONNECT_ATTEMPTS) {
      logger.error('Max reconnection attempts reached. Stopping bot.');
      this.connectionStatus = 'offline';
      this.lastErrorReason = 'Max reconnection attempts reached';
      process.exit(1);
    }
    logger.info(`Reconnecting in 5s (attempt ${this.reconnectAttempts}/${config.MAX_RECONNECT_ATTEMPTS})...`);
    setTimeout(() => {
      this.loadAndLogin().catch(err => {
        logger.error('Reconnection failed', { error: err.message });
        this.connectionStatus = 'offline';
        this.lastErrorReason = err.message;
        this.scheduleReconnect();
      });
    }, 5000);
  }

  reconnect() {
    this.scheduleReconnect();
  }

  keepAlive() {
    const shutdown = (signal) => {
      logger.info(`Received ${signal}, shutting down...`);
      this.isRunning       = false;
      this.connectionStatus  = 'offline';
      this.shouldReconnect = false;
      if (this._mqttRestartTimer)   clearInterval(this._mqttRestartTimer);
      if (this._cookieRefreshTimer) clearInterval(this._cookieRefreshTimer);
      if (this._reminderTimer)      clearInterval(this._reminderTimer);
      if (this._autoRemoveTimer)    clearInterval(this._autoRemoveTimer);
      if (this._sessionCheckerTimer) clearInterval(this._sessionCheckerTimer);
      try { if (this.ig) this.ig.stopListening(); } catch (_) {}
      logger.info('Bot shutdown complete');
      process.exit(0);
    };

    process.on('SIGINT',  () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', { reason: String(reason) });
    });
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = InstagramBot;
