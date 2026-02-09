# Astralune Bot

WhatsApp Bot powered by Baileys and maintained by bot.astralune.cv

## Features

- Modular command system
- Customizable prefixes
- Self/Public mode
- System information commands
- Ping command
- Menu command
- Error handling
- Logging system

## Installation

1. Clone this repository
2. Install dependencies using pnpm:
```bash
pnpm install
```

3. Start the bot:
```bash
pnpm start
```

## Configuration

Edit `config.js` to customize:
- Bot name
- Owner number
- Default prefixes
- Session path
- Data path
- Logging settings

## Commands

### Main Commands:
- menu (aliases: list, command)
- ping (aliases: p)
- info (aliases: specs, system)
- self/public (aliases: mode) - owner only
- setprefix (aliases: ubahprefix, gantiprefix) - owner only

## Directory Structure

```
Astralune/
├── lib/
│   └── index.js
├── commands/
│   ├── main-menu.js
│   ├── main-ping.js
│   ├── main-info.js
│   ├── main-mode.js
│   └── main-prefix.js
├── utils/
│   └── index.js
├── helper/
│   └── index.js
├── data/
│   └── database.json
├── config.js
├── index.js
├── handler.js
└── package.json
```

## Development

For development, use:
```bash
pnpm dev
```

This will start the bot with nodemon for automatic restart on file changes.

## License

MIT