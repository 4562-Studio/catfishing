# catfishing

A fishing game discord bot for the Ninajirachi server that uses cats instead of fish

## Prerequisites

Install [mise](https://mise.jdx.dev).

## Project Structure

| Layer              | Tool                               |
| ------------------ | ---------------------------------- |
| Runtime            | Node.js ≥22.12, ESM                |
| Language           | TypeScript ~6.0                    |
| Bot framework      | discord.js v14                     |
| Env var management | @t3-oss/env-core + zod             |
| Logging            | pino (pretty in dev, JSON in prod) |
| Dev runner         | tsx                                |
| Bundler            | rolldown                           |
| Linter             | oxlint                             |
| Formatter          | oxfmt                              |
| Tests              | vitest                             |
| Toolchain manager  | mise                               |

### File Structure

| Path                 | Description                                 |
| -------------------- | ------------------------------------------- |
| `src/`               | All bot source code                         |
| `src/commands/`      | Slash command implementations               |
| `src/events/`        | Discord event handlers                      |
| `src/lib/`           | Shared game logic                           |
| `src/util/`          | Infrastructure (env, logging, formatting)   |
| `.env.example`       | Template for required environment variables |
| `mise.toml`          | Node.js version + pnpm toolchain config     |
| `tsconfig.json`      | TypeScript config                           |
| `oxlint.config.ts`   | Linter rules                                |
| `oxfmt.config.ts`    | Formatter config                            |
| `rolldown.config.ts` | Bundler config                              |

## Setup

```sh
mise install        # installs Node.js and pnpm
pnpm install        # installs dependencies
cp .env.example .env
```

Edit `.env` and fill in:

| Variable         | Description                                   |
| ---------------- | --------------------------------------------- |
| `DISCORD_TOKEN`  | Bot authentication token                      |
| `APPLICATION_ID` | Discord application ID                        |
| `GUILD_ID`       | Server ID for the bot to register commands in |
| `CATFISHING_CHANNEL_ID`       | ID of channel designated for fishing |

## Development

```sh
pnpm dev
```

Runs the bot locally using tsx (no build step required). This uses watch mode, so any source code changes should trigger an automatic restart of the bot. Note that mise will auto-load `.env`.

## Build

```sh
pnpm build
```

Bundles to `dist/index.js` via rolldown.

## Other scripts

| Command                 | Description                 |
| ----------------------- | --------------------------- |
| `pnpm run lint`         | Lint with oxlint            |
| `pnpm run lint:fix`     | Auto-fix lint issues        |
| `pnpm run format`       | Apply formatting            |
| `pnpm run format:check` | Check formatting            |
| `pnpm run typecheck`    | Type-check without emitting |
| `pnpm run test`         | Run tests with vitest       |

## Development Practices

### Environment Variables

When using an environment variable, add it to [util/env.ts](src/util/env.ts) and then import this module. This validates it at bot startup via zod, which will exit the bot with a clear error if any environment variables are malformed or missing.

### Adding a Command

Create a new file in `src/commands/` and export an object satisfying the `Command` interface.

```ts
export default {
  data: { name: "mycommand", description: "Does something." },
  async execute(interaction, ctx) {
    // your logic here
  },
} satisfies Command;
```

Then import and add it to `cmdList` in [commands/index.ts](src/commands/index.ts). Commands are guild registered on bot startup, so they will be available in Discord immediately upon next bot run (or after the bot automatically restarts via watch mode if using `pnpm dev`).

If your command hits an unrecoverable error, throw an exception. The interaction handler catches it and sends an ephemeral error reply automatically.

### Logging

The bot uses pino for logging. Import the shared logger from [util/logger.ts](src/util/logger.ts), and scope it to your command with .child() so log output is easy to filter.

```ts
const log = ctx.logger.child({ command: "mycommand" });
log.info("doing a thing");
log.debug({ userId: interaction.user.id }, "user invoked command");
```

In development, the output is human-readable via pino-pretty. In production (when NODE_ENV=production is set) it emits JSON. You can override the log level at any time by setting LOG_LEVEL in your .env (e.g. LOG_LEVEL=debug).
