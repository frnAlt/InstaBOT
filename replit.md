# InstaBOT - Instagram Chat Bot

## Developers
- **Main Developers**: Gtajisan && frnAlt
- **GitHub Repository**: https://github.com/frnAlt/InstaBOT

## Credits
- **Instagram Bot Architecture**: InstaBOT Engine & ICA
- **Instagram Chat API**: ICA by Tanvir & Contributors

## Overview
InstaBOT is a high-performance, modular Instagram chatbot built with an integrated native Instagram Chat API (ICA) engine. It supports dual command structures (GoatBot V2 & standard formats) while running exclusively on Instagram Direct Messages.

## Project Status
**DEPLOYED AND RUNNING** - Bot is connected to Instagram account `farhanalt01` (ID: 79639057329)

## Key Information
- **Bot ID**: 79639057329
- **Username**: farhanalt01
- **Prefix**: `/` (commands start with /)
- **Commands Loaded**: 80
- **Events Loaded**: 7
- **Database**: JSON-based (stored in /database/)

## Project Structure
```
/
├── index.js                 # Main entry point
├── InstagramGoat.js         # Instagram bot core with login handler
├── config.json              # Bot configuration
├── configCommands.json      # Command settings
├── account.txt              # Instagram cookies (JSON format)
├── ig-chat-api/             # Instagram Chat API (FCA-compatible)
│   ├── index.js             # Main API entry
│   └── src/                 # API methods (sendMessage, listen, etc.)
├── scripts/
│   ├── cmds/                # Bot commands (80+ commands)
│   └── events/              # Event handlers (7 events)
├── bot/
│   ├── login/               # Login handlers
│   └── handler/             # Message/event handlers
├── database/                # JSON database files
├── logger/                  # Logging utilities
└── func/                    # Utility functions
```

## How It Works
1. Reads Instagram cookies from `account.txt`
2. Validates session with Instagram API
3. Loads all commands from `scripts/cmds/`
4. Loads all events from `scripts/events/`
5. Starts message polling every 3 seconds
6. Processes commands when users send messages starting with prefix

## Configuration
Edit `config.json` to modify:
- `prefix`: Command prefix (default: "/")
- `adminBot`: Array of admin user IDs
- `language`: Bot language (default: "en")
- `database.type`: Database type ("json" or "sqlite")

## Available Commands (80 total)
Key commands include:
- `/help` - List all commands
- `/balance` - Check balance
- `/daily` - Daily reward
- `/rank` - View rank card
- `/admin` - Admin commands
- `/gpt` - AI chat
- `/translate` - Translate text
- `/weather` - Weather info
- And many more...

## Authentication
Uses cookie-based session authentication. Cookies required:
- `sessionid` - Instagram session ID
- `ds_user_id` - User ID
- `csrftoken` - CSRF token

## Recent Changes
- 2025-12-09: Initial deployment and setup
- Fixed libuuid dependency for canvas commands
- All 80 commands loading successfully
- Bot listening for messages via polling

## Development Notes
- The bot uses polling mode (every 3s) to check for new messages
- Instagram has rate limits - 429 errors handled with 60s delay
- Session automatically saved to session.json after login
