<div align="center">
  <img src="https://raw.githubusercontent.com/frnAlt/InstaBOT/main/assets/banner.jpg" alt="InstaBOT Banner" width="100%" />

  # ⚡ InstaBOT
  **Next-Generation High-Performance Instagram Chatbot Engine**

  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![GitHub Repository](https://img.shields.io/badge/GitHub-frnAlt%2FInstaBOT-blue.svg?style=for-the-badge&logo=github)](https://github.com/frnAlt/InstaBOT)
  [![Build Status](https://img.shields.io/badge/Build-Passing-success.svg?style=for-the-badge)](https://github.com/frnAlt/InstaBOT)
  [![Commands Loaded](https://img.shields.io/badge/Commands-129%2B_Loaded-purple.svg?style=for-the-badge)](#-complete-command-catalog)
  [![ICA Engine](https://img.shields.io/badge/Engine-Native_ICA-red.svg?style=for-the-badge)](https://github.com/frnAlt/InstaBOT)
  [![License](https://img.shields.io/badge/License-MIT-orange.svg?style=for-the-badge)](LICENSE)

  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-interface--dashboard">Showcase</a> •
    <a href="#-architecture--core-components">Architecture</a> •
    <a href="#-complete-command-catalog-104-commands">Commands</a> •
    <a href="#-quick-start--installation">Installation</a> •
    <a href="#-configuration-reference">Configuration</a> •
    <a href="#-deployment-options">Deployment</a> •
    <a href="#-developers--credits">Credits</a>
  </p>

  ---
</div>

## 🌟 Overview

**InstaBOT** is a fully modular, enterprise-grade Instagram Direct Messenger chatbot built with an integrated native **Instagram Chat API (ICA)** engine. Engineered for maximum speed, security, and scalability, InstaBOT operates with dual command execution handlers (full backward compatibility for GoatBot V2 and standard formats), a 5-tier role hierarchy, anti-ban protections, AI conversational memory, web dashboard, and multimedia processing.

---

## 📸 Interface & Dashboard

<div align="center">
  <table>
    <tr>
      <td width="50%" align="center">
        <b>🖥️ Real-Time Web Dashboard</b><br/><br/>
        <img src="https://raw.githubusercontent.com/frnAlt/InstaBOT/main/assets/screenshots/dashboard-overview.jpg" alt="InstaBOT Dashboard Overview" width="100%" />
      </td>
      <td width="50%" align="center">
        <b>📱 Messenger Interactive Commands</b><br/><br/>
        <img src="https://raw.githubusercontent.com/frnAlt/InstaBOT/main/assets/screenshots/chat-commands.jpg" alt="InstaBOT Chat Commands Showcase" width="100%" />
      </td>
    </tr>
  </table>
</div>

---

## 🏗️ Architecture & Core Components

```text
                                 ┌─────────────────────────────┐
                                 │   Instagram Servers / MQTT  │
                                 └──────────────┬──────────────┘
                                                │ Realtime Stream
                                                ▼
                                 ┌─────────────────────────────┐
                                 │  Native Built-In ICA Engine │
                                 │      (ica/ - Zero Lock-In)  │
                                 └──────────────┬──────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
        ┌─────────────────────────────┐                   ┌─────────────────────────────┐
        │  Anti-Ban & Rate Limiter    │                   │   Event Dispatch Pipeline   │
        │ • Adaptive Cooling Windows  │                   │ • message, reaction, ready  │
        │ • Modern Chrome 133 Headers │                   │ • gc_join, gc_leave, error  │
        └──────────────┬──────────────┘                   └──────────────┬──────────────┘
                       │                                                 │
                       ▼                                                 ▼
        ┌─────────────────────────────┐                   ┌─────────────────────────────┐
        │  Outbound Message Queue     │                   │ Dual Command Loader Engine  │
        │ • Human-like Delay Jitter   │                   │ • Standard (run)            │
        │ • Automatic Retry & Backoff │                   │ • GoatBot V2 (onStart)      │
        └─────────────────────────────┘                   └──────────────┬──────────────┘
                                                                         │
                                                                         ▼
                                                          ┌─────────────────────────────┐
                                                          │ 5-Tier Permission & Storage │
                                                          │ • Normal, Admin, Dev (0-4)  │
                                                          │ • JSON / SQLite / MongoDB   │
                                                          └─────────────────────────────┘
```

---

## 🔥 Key Highlights

* 🚀 **Zero External API Lock-In**: Complete native Instagram Chat API (`ica/`) bundled directly into the codebase.
* 🛡️ **Anti-Ban & Stealth Protection**: Realistic Chrome 133 & Android 14/15 User-Agents with authentic `Sec-Fetch`, compression, and randomized typing jitter (40–200ms).
* 🔄 **Dual Command Architecture**: Supports standard `run()` functions as well as GoatBot V2 hooks (`onStart`, `onReply`, `onReaction`, `onChat`, `onFirstChat`, `onLoad`, `onReady`).
* 👑 **5-Tier Role System**: Granular permission checks (`0` Normal User, `1` Group Admin, `2` Bot Admin, `3` Premium User, `4` Developer).
* 🧠 **AI Intelligence Suite**: Integrated Gemini, GPT, Claude 3, Meta AI, Nano-Banana Pro (`!nbpro`), and image generation models.
* 🎬 **Media Downloader Engine**: Stream and fetch YouTube audio/video (`!sing`, `!video`), TikToks (`!tiktok`), Pinterest boards (`!pinterest`), and cloud uploads (`!imgbb`, Catbox, Imgur).
* 📊 **Live Web Dashboard**: Browser-based administration interface for real-time uptime, logs, statistics, and command monitoring.

---

## 👑 5-Tier Permission Hierarchy

| Role Level | Role Title | Access Description | Example Commands |
|:---:|:---|:---|:---|
| `0` | **Normal User** | Access to all public utilities, games, and info commands | `!help`, `!ai`, `!sing`, `!quote` |
| `1` | **Group Admin** | Group thread management, kicking members, group settings | `!kick`, `!warn`, `!bot on/off` |
| `2` | **Bot Admin** | Configured bot administrators in `config.adminBot` | `!ban`, `!approve`, `!whitelist` |
| `3` | **Premium User** | Priority queue and exclusive high-capacity AI features | `!fluxdev`, `!veo`, `!nbpro` |
| `4` | **Developer** | Unrestricted system commands, shell execution, code evaluation | `!eval`, `!shell`, `!restart`, `!cmd` |

---

## 📚 Complete Command Catalog (129+ Commands)

<details>
<summary><b>🤖 Artificial Intelligence & Generation (16 Commands)</b></summary>
<br/>

| Command | Triggers | Description | Usage |
|:---|:---|:---|:---|
| `ai` | `gpt`, `ask` | Chat with OpenAI GPT models | `!ai <prompt>` |
| `claude` | `cld` | Ask Claude 3 (Haiku) with multimodal image support | `!claude <question>` |
| `gemini` | `bard` | Query Google Gemini conversational AI | `!gemini <prompt>` |
| `metaai` | `meta`, `llama` | Chat with Meta AI with multi-turn memory | `!metaai <prompt>` |
| `nbpro` | `nb`, `nanobanana` | Generate or edit images using Nano-Banana Pro | `!nbpro <prompt>` |
| `flux` | `flux2`, `flux3` | High-definition AI image synthesis | `!flux <prompt>` |
| `fluxdev` | `fluxv` | FluxDev photo-realistic generator | `!fluxdev <prompt>` |
| `imagen3` | `imagen4` | Google Imagen generator | `!imagen3 <prompt>` |
| `dalle3` | `dalle` | OpenAI DALL-E 3 image generation | `!dalle3 <prompt>` |
| `genx` | `art`, `creart` | Artistic image generation models | `!genx <prompt>` |
| `nijix` | `niji` | Anime-style image generation with aspect ratios | `!nijix <prompt> --ar 16:9` |
| `veo` | `txt2video` | AI Text-to-Video generation | `!veo <prompt>` |
| `imggen` | `img` | Fast multi-engine AI image generator | `!imggen <prompt>` |
| `aiphoto` | `photoai` | Enhance and generate realistic portraits | `!aiphoto <prompt>` |
| `removebg` | `nobg`, `rbg` | AI image background removal (transparent PNG) | `!removebg (reply/url)` |
| `autotalk` | `bot` | Context-aware AI chatbot auto-reply | Auto-triggered |

</details>

<details>
<summary><b>🎬 Media, Video & Audio Downloaders (20 Commands)</b></summary>
<br/>

| Command | Triggers | Description | Usage |
|:---|:---|:---|:---|
| `sing` | `song`, `music` | Search and download YouTube audio tracks | `!sing <song name>` |
| `video` | `ytv`, `ytvideo` | Search and download YouTube videos | `!video <video title>` |
| `tiktok` | `tt` | Search and download TikTok videos without watermark | `!tiktok <query>` |
| `pinterest` | `pin` | Search and fetch high-resolution Pinterest images | `!pinterest <search>` |
| `movies` | `imdb`, `film` | Search movies & TV series via OMDb with posters | `!movies <title>` |
| `anime` | `ani`, `mal` | Search anime metadata, score, and art via Jikan | `!anime <anime>` |
| `manga` | `manhwa` | Search manga details, chapters, and cover art | `!manga <manga>` |
| `alldl` | `dl` | Universal social media video downloader | `!alldl <url>` |
| `ytb` | `youtube` | Direct YouTube downloader with resolution selector | `!ytb <url>` |
| `anisearch` | `animeedit` | Search and download anime edits and AMVs | `!anisearch <anime>` |
| `shazam` | `findsong` | Identify songs from audio/video clips | `!shazam (reply)` |
| `emojimix` | `mixemoji` | Google Emoji Kitchen composite graphic generator | `!emojimix 😭 🤣` |
| `meme` | `dankmeme` | Fetch random trending community memes | `!meme` |
| `imgbb` | `upload` | Upload images directly to ImgBB cloud storage | `!imgbb (reply to image)` |
| `imgur` | `imgurl` | Upload attachments to Imgur | `!imgur (reply to media)` |
| `catbox` | `cb` | Upload files to Catbox storage | `!catbox (reply to file)` |
| `say` | `tts`, `speak` | Synthesize text to native Instagram voice notes | `!say <text>` |
| `pfp` | `avatar` | Fetch full HD profile picture of any user | `!pfp <username>` |
| `pfpframe` | `frame` | Generate aesthetic framed avatar pictures | `!pfpframe (tag/user)` |
| `blur` | `filter` | Apply image filters and effects | `!blur (reply to photo)` |

</details>

<details>
<summary><b>🎲 Economy, Games & Fun (28 Commands)</b></summary>
<br/>

| Command | Triggers | Description | Usage |
|:---|:---|:---|:---|
| `bank` | `balance`, `bal` | Check balance and bank account funds | `!bank` |
| `daily` | `claim` | Claim daily economy reward | `!daily` |
| `economy` | `eco`, `pay` | Transfer coins and manage wealth | `!economy pay <@user> <amt>` |
| `coinflip` | `cf`, `flip` | Gamble coins on heads or tails | `!coinflip <heads\|tails> <amt>` |
| `slot` | `slots` | Spin slot machine for jackpot winnings | `!slot <bet>` |
| `mines` | `minesweeper` | 5x5 Casino minefield risk game with cashout | `!mines <bet>` |
| `richroll` | `rr`, `gamble` | High-stakes fortune roll gamble with 5x jackpot | `!richroll <bet>` |
| `wordgame` | `scramble` | Unscramble the hidden word for coin rewards | `!wordgame` |
| `mathquiz` | `math` | Fast mental arithmetic challenge with cash prize | `!mathquiz [diff]` |
| `guessnumber` | `guessnum` | Secret number guessing game (1-100) with hints | `!guessnumber` |
| `quiz` | `trivia` | Multi-category interactive trivia challenge | `!quiz` |
| `48law` | `lawsofpower` | Robert Greene's 48 Laws of Power wisdom | `!48law [1-48]` |
| `marry` | `wedding` | Propose, marry, and issue marriage certificates | `!marry @user` |
| `hug` | `cuddle` | Custom canvas composite cuddle/hug image | `!hug @user` |
| `kiss` | `smooch` | Romantic canvas composite kiss image | `!kiss @user` |
| `slap` | `hit` | Slap tagged user with custom canvas animation | `!slap <@user>` |
| `ship` | `pair`, `couple` | Matchmake and calculate compatibility | `!ship <@user>` |
| `dice` | `roll` | Roll virtual dice | `!dice` |
| `rps` | `rockpaperscissors` | Play Rock-Paper-Scissors against bot | `!rps <rock\|paper\|scissors>` |
| `dhbc` | `wordquiz` | Play interactive guess-the-word song puzzle | `!dhbc` |
| `bby` | `simi` | Cute interactive talk bot | `!bby <message>` |
| `joke` | `humor` | Tell random jokes | `!joke` |
| `quote` | `q` | Inspirational quotes & custom quote card generator | `!quote` |
| `wanted` | `jail` | Generate Wanted/Bounty posters | `!wanted (tag/reply)` |
| `rip` | `tomb` | Generate gravestone tribute memes | `!rip (tag/reply)` |
| `gay` | `howgay` | Fun compatibility meter | `!gay (tag)` |
| `choose` | `pick` | Randomly pick from multiple options | `!choose <opt1> \| <opt2>` |
| `dih` | `challenge` | Trivia challenge games | `!dih` |

</details>

<details>
<summary><b>🛡️ Moderation & Group Management (16 Commands)</b></summary>
<br/>

| Command | Triggers | Description | Role Req |
|:---|:---|:---|:---|
| `kick` | `remove` | Kick user from group thread | `1` (Admin) |
| `adduser` | `add` | Add user to Instagram group by ID | `1` (Admin) |
| `warn` | `warning` | Issue warning strikes to misbehaving members | `1` (Admin) |
| `ban` | `unban` | Ban/unban users from bot access | `2` (Bot Admin) |
| `whitelist` | `wl` | Manage thread/user whitelist mode | `2` (Bot Admin) |
| `approve` | `accept` | Approve pending message requests | `2` (Bot Admin) |
| `bot` | `botmode` | Toggle bot ON/OFF or Admin-Only mode | `1` (Admin) |
| `thread` | `group` | Manage thread title, photo, and settings | `1` (Admin) |
| `unsend` | `delete` | Unsend bot messages | `0` (User) |
| `unsendall` | `purge` | Unsend all bot messages in thread | `2` (Bot Admin) |
| `rules` | `rule` | Display group rules | `0` (User) |
| `busy` | `afk` | Set AFK status when away | `0` (User) |
| `filter` | `antispam` | Configure thread word filter | `1` (Admin) |
| `admin` | `admins` | List and manage bot administrators | `2` (Bot Admin) |
| `manage` | `managebot` | Thread permissions and feature locks | `1` (Admin) |
| `selflisten` | `self` | Toggle bot self-listening capability | `4` (Dev) |

</details>

<details>
<summary><b>🛠️ System, Diagnostics & Utilities (21 Commands)</b></summary>
<br/>

| Command | Triggers | Description | Usage |
|:---|:---|:---|:---|
| `help` | `menu`, `commands` | Show interactive categorized command menu | `!help [command]` |
| `info` | `about` | System information, node runtime & memory | `!info` |
| `safeguard` | `health` | System health, RAM allocation & security telemetry | `!safeguard` |
| `stats` | `statistics` | User ranking and bot usage stats | `!stats` |
| `ping` | `latency` | Measure bot response and network latency | `!ping` |
| `github` | `gh`, `git` | Query GitHub profile details or repository stats | `!github <user\|repo> <query>` |
| `screenshot` | `ss`, `webshot` | Capture rendered snapshots of any webpage URL | `!screenshot <url>` |
| `moon` | `moonphase` | High-res lunar calendar phase for any date | `!moon [DD/MM/YYYY]` |
| `tinyurl` | `shorturl` | Shorten links using TinyURL / is.gd | `!tinyurl <url>` |
| `quran` | `surah`, `ayah` | Read Holy Quran verses with Arabic & translations | `!quran <surah:ayah>` |
| `fancy` | `font`, `fonts` | Style text into 30+ Unicode typographic fonts | `!fancy [font] <text>` |
| `uid` | `id` | Get Instagram User ID of sender or target | `!uid [@user]` |
| `userinfo` | `whois` | Detailed Instagram profile inspector | `!userinfo <user>` |
| `weather` | `forecast` | Live global weather conditions and forecasts | `!weather <city>` |
| `translate` | `trans` | Translate text into any language | `!translate <lang> <text>` |
| `time` | `clock` | World clocks and timezones | `!time [timezone]` |
| `calc` | `calculate` | Mathematical expression evaluator | `!calc <expr>` |
| `eval` | `ev` | Execute JavaScript in bot context | `!eval <code>` (Dev) |
| `shell` | `sh`, `exec` | Execute terminal commands on host system | `!shell <cmd>` (Dev) |
| `restart` | `reboot` | Safely restart bot process | `!restart` (Dev) |
| `cmd` | `command` | Reload or load command modules on the fly | `!cmd load <name>` (Dev) |

</details>

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
* **Node.js**: `v20.0.0` or higher ([Download](https://nodejs.org/))
* **Git**: Installed on your system
* **Instagram Account**: Active Instagram account for bot usage

### 2. Clone Repository
```bash
git clone git@github.com:frnAlt/InstaBOT.git
cd InstaBOT
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Instagram Session (`account.txt`)
Export your Instagram session cookies from your browser (e.g. using *EditThisCookie* or *Cookie-Editor*) in **Netscape format** or **JSON format** and paste them into `account.txt` in the root folder:

```text
# Netscape HTTP Cookie File
.instagram.com	TRUE	/	TRUE	1798765432	sessionid	YOUR_SESSION_ID
.instagram.com	TRUE	/	TRUE	1798765432	ds_user_id	YOUR_USER_ID
.instagram.com	TRUE	/	TRUE	1798765432	csrftoken	YOUR_CSRF_TOKEN
```

### 5. Configure Default Settings
Edit `config/default.json` to customize your bot prefix, bot admin IDs, and features:

```jsonc
{
  "prefix": "!",
  "noPrefix": true,
  "adminBot": ["YOUR_INSTAGRAM_USER_ID"],
  "devUsers": ["YOUR_INSTAGRAM_USER_ID"],
  "nickNameBot": "InstaBOT",
  "language": "en",
  "optionsIca": {
    "stealthMode": true,
    "selfListen": true,
    "listenEvents": true
  }
}
```

### 6. Start the Bot
```bash
npm start
```

---

## ⚙️ Configuration Reference

### Environment Variables (`.env`)

You can optionally configure InstaBOT via environment variables:

| Variable | Type | Default | Description |
|:---|:---:|:---:|:---|
| `ACCOUNT_COOKIE` | String | `""` | Raw session cookie string |
| `ACCOUNT_EMAIL` | String | `""` | Fallback login email |
| `ACCOUNT_PASSWORD` | String | `""` | Fallback login password |
| `ACCOUNT_USER_AGENT` | String | `Chrome 133` | Custom browser / device User-Agent |
| `PREFIX` | String | `!` | Default command trigger prefix |
| `PORT` | Number | `3000` | Web dashboard HTTP server port |

---

## 🚢 Deployment Options

### 1. Running with PM2 (Recommended for VPS)
```bash
npm install -g pm2
pm2 start index.js --name "instabot"
pm2 save
pm2 startup
```

### 2. Running with Docker
```bash
docker build -t instabot .
docker run -d -p 3000:3000 --name instabot-app instabot
```

### 3. Replit Deployment
1. Import repository into Replit.
2. Add your cookies into `account.txt` or configure `ACCOUNT_COOKIE` in Secrets.
3. Click **Run** (`replit.md` workflow will auto-start bot & dashboard).

---

## 🔒 Security & Best Practices

1. **Keep `account.txt` Secret**: Never commit your `account.txt` or session tokens to public repositories.
2. **Use Realistic Delays**: InstaBOT includes adaptive rate limiters and human typing jitter (40–200ms) by default to prevent spam triggers.
3. **Admin Controls**: Ensure your Instagram ID is properly set in `adminBot` and `devUsers` to restrict sensitive commands like `!eval` and `!shell`.

---

## 👨‍💻 Developers & Credits

* **Core Developers / Maintainers**: 
  - [Gtajisan](https://github.com/Gtajisan)
  - [frnAlt](https://github.com/frnAlt)
* **Architecture & API**: Built-in native **ICA** (Instagram Chat API) Engine
* **GitHub Repository**: [frnAlt/InstaBOT](https://github.com/frnAlt/InstaBOT)
* **License**: [MIT License](LICENSE)

---

<div align="center">
  <sub>Crafted with ❤️ by <b>Gtajisan && frnAlt</b> • Powered by <b>InstaBOT Next-Gen Engine</b></sub><br/>
  <sub>⭐ If you find this project useful, please consider giving it a star on GitHub! ⭐</sub>
</div>
