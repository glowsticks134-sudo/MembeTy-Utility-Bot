# AeroX AIO V3 — Discord Bot

## Overview

A feature-rich Discord bot built with Discord.js v14 featuring music playback, moderation, tickets, giveaways, and more. Uses hybrid sharding for scalability.

## Tech Stack

- **Runtime:** Node.js >= 18 (ES Modules)
- **Framework:** discord.js v14
- **Sharding:** discord-hybrid-sharding (ClusterManager)
- **Music:** lavalink-client (requires external Lavalink node)
- **Database:** better-sqlite3 (SQLite)
- **Other:** express, @napi-rs/canvas, discord-giveaways, axios, dotenv

## Project Structure

```
src/
  shard.js          # Entry point — spawns sharding clusters
  index.js          # Bot client initialization per shard
  commands/         # Slash commands (modular)
  events/           # Discord/music/node event handlers
  config/           # Config loaded from env vars
  database/         # SQLite repos + schema
  structures/       # Client classes and handlers
  managers/         # Music/Player/Queue managers
  utils/            # Helpers, logging, Spotify, image service
fonts/              # Font assets for canvas rendering
```

## Configuration

Copy `example.env` to `.env` and fill in required values:

- `DISCORD_TOKEN` — Your bot token (required)
- `CLIENT_ID` — Your bot's client/application ID (required)
- `OWNER_IDS` — Comma-separated Discord user IDs of bot owners (required)
- `LAVALINK_HOST/PORT/PASSWORD` — Lavalink server credentials (required for music)
- Spotify and Last.fm keys are optional

## Running

```bash
npm install
npm run start     # Production (node src/shard.js)
npm run dev       # Dev with auto-restart (node --watch src/shard.js)
```

## New Commands Added (Big-Server Update)

### Admin (10 commands)
`autorole`, `welcome`, `goodbye`, `modlog`, `joinlog`, `boostmsg`, `massrole`, `selfrole`, `autopingsetup`, `autopublish`

### Moderation (14 commands)
`softban`, `timeout`, `untimeout`, `voicekick`, `voicemove`, `massban`, `slowmode`, `announce`, `giverole`, `removerole`, `deafen`, `undeafen`, `note`, `lockdown`

### Utility (11 commands)
`poll`, `timestamp`, `membercount`, `channelinfo`, `rolemembers`, `permissions`, `inviteinfo`, `firstmessage`, `serverroles`, `color`, `calculator`

### Fun (11 commands)
`8ball`, `coinflip`, `rps`, `roast`, `compliment`, `ship`, `wouldyourather`, `riddle`, `roll`, `joke`, `trivia`

### New Event Handlers
- `guildMemberAdd` — autorole, welcome message, join log (plus existing invite tracking)
- `guildMemberRemove` — goodbye message, leave log
- `guildMemberUpdate` — boost message when a member starts boosting
- `autopublishAutoping` (messageCreate) — auto-publishes announcement channel messages, sends and deletes role pings

### Settings Database
`src/database/repo/Settings.js` — guild-level config for all the above features (SQLite, `settings.bread`).

## Deployment

- **Type:** VM (always-on — required for a persistent Discord bot)
- **Run command:** `node src/shard.js`
- Configure all required env vars as Replit Secrets before deploying
