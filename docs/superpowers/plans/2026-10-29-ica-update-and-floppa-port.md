# ICA Update and Floppa-Chatbot Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Overview
This plan implements two major upgrades for InstaBOT:
1. **ICA Upgrade:** Integrate new features from `jarif098/instagram-chat-api` into the embedded `ica` library (Instagram Direct Notes API, Chat Themes API with 42+ verified presets, Sharing & DM Polls API, Nicknames API, Message actions: edit/pin/unpin/forward, and User moderation/friendship actions: follow/unfollow/block/restrict).
2. **Floppa-Chatbot Rebuild & Port:** Port game systems, economy, RPG modules, community utilities, and handlers from `frnAlt/Floppa-Chatbot` to `InstaBOT`, adapting all FCA calls to native `ica` Instagram APIs.
3. **Commit Standards:** Every commit must follow conventional commit specifications and include pro-developer trailers:
   - `Signed-off-by: Farhan Muh Tasim <sultana01537118@gmail.com>`
   - `Change-Id: I<40-hex-digits>`

---

## Tasks

### Task 1: Update ICA with New Features from `jarif098/instagram-chat-api`
- [ ] Create `ica/src/methods/notes.js` implementing NotesService (getNotes, getMyNote, getNoteByUser, createNote, likeNote, unlikeNote, deleteNote, replyToNote)
- [ ] Create `ica/src/methods/themes.js` implementing ThemesService (verified presets catalog, getThemes, setChatTheme, resetChatTheme, searchThemes, getRandomTheme)
- [ ] Create `ica/src/methods/sharing.js` implementing SharingService (resolveMediaId, sharePost, shareReel, shareStory, shareProfile, shareLink, shareGIF, sendPoll)
- [ ] Create `ica/src/methods/nicknames.js` implementing NicknamesService (getNicknames, setNickname, clearNickname)
- [ ] Extend `ica/src/methods/sendMessage.js` and `ica/src/methods/unsend.js` with `editMessage`, `forwardMessage`, `pinMessage`, `unpinMessage`
- [ ] Extend `ica/src/methods/user.js` with friendship and moderation actions: `followUser`, `unfollowUser`, `getFollowers`, `getFollowing`, `getFollowRequests`, `approveFollowRequest`, `ignoreFollowRequest`, `blockUser`, `unblockUser`, `restrictUser`, `unrestrictUser`, `muteUser`, `unmuteUser`, `checkFriendship`
- [ ] Wire all new methods into `ica/src/instagramChat.js`, `ica/index.js`, and `platforms/instagram/adapter/apiWrapper.js`
- [ ] Add unit tests in `test/run.js` for all new ICA methods
- [ ] Run test suite (`npm test`) and verify all tests pass
- [ ] Commit changes with `feat(ica): integrate notes, themes, sharing, polls, nicknames, and moderation from jarif-ica`

### Task 2: Port Core Functions, Compatibility Helpers & Command Loader
- [ ] Enhance `src/commandLoader.js` and `core/commandLoader.js` to seamlessly support `meta` / `config` exports and TypeScript/CommonJS hybrid Floppa commands
- [ ] Verify Floppa utilities in `func/` and ensure currency / item helpers, styled text, and state managers operate cleanly with InstaBOT
- [ ] Add tests in `test/run.js` for the enhanced loader and helper shims
- [ ] Run test suite (`npm test`) and verify all tests pass
- [ ] Commit changes with `feat(core): enhance command loaders and ecosystem shims for floppa compatibility`

### Task 3: Port Floppa Economy, RPG & Interactive Game Systems
- [ ] Port Economy commands: `balance.js`, `work.js`, `daily.js`, `pay.js`, `donate.js`, `bank.js`, `shop.js`, `buy.js`
- [ ] Port RPG & Gathering commands: `adventure.js`, `arena.js`, `duel.js`, `fish.js`, `farm.js`, `mine.js`, `dig.js`, `chop.js`
- [ ] Port Interactive Mini-games: `casino.js`, `slot.js`, `flipcoin.js`, `ttt.js`, `wordgame.js`, `quiz.js`
- [ ] Adapt all output formatting to Instagram chat constraints (Unicode styling, no broken Facebook-specific mentions)
- [ ] Add unit tests in `test/run.js` for ported economy and game modules
- [ ] Run test suite (`npm test`) and verify all tests pass
- [ ] Commit changes with `feat(commands): port floppa economy, rpg, and interactive game modules to ica`

### Task 4: Port Floppa Social, Community & New Instagram-ICA Commands
- [ ] Port Community & Social commands from Floppa: `48law.js`, `quote_canv.js`, `fakepost.js`, `rank.js`, `pair.js`, `calc.js`
- [ ] Add new Instagram-ICA native commands:
  - `commands/notes.js`: post, read, delete, and reply to Instagram status notes
  - `commands/poll.js`: create interactive DM polls
  - `commands/nickname.js`: view and set chat nicknames in direct threads
  - `commands/follow.js`: follow, unfollow, and inspect Instagram friendship statuses
  - `commands/pin.js`: pin and unpin messages in Instagram threads
  - Update `commands/theme.js` to utilize the full verified theme catalog and live query
- [ ] Add tests in `test/run.js` verifying each new command's configuration and dispatch
- [ ] Run test suite (`npm test`) and verify all tests pass
- [ ] Commit changes with `feat(commands): add instagram notes, polls, nicknames, follow commands and floppa community tools`

### Task 5: End-to-End Verification and Clean-up
- [ ] Run full test suite (`npm test`) and verify 100% pass rate
- [ ] Validate git log commit formatting and trailers (`Signed-off-by`, `Change-Id`)
- [ ] Clean up temporary files in `/tmp`
