# catfishing

## Prerequisites

Install [mise](https://mise.jdx.dev).

## Setup

```sh
mise install        # installs Node.js and pnpm
pnpm install        # installs dependencies
cp .env.example .env
```

Edit `.env` and fill in:

| Variable         | Description              |
| ---------------- | ------------------------ |
| `DISCORD_TOKEN`  | Bot authentication token |
| `APPLICATION_ID` | Discord application ID   |

## Development

```sh
pnpm dev
```

Runs the bot locally using tsx (no build step required). mise auto-loads `.env`.

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
| `pnpm run format`       | Check formatting            |
| `pnpm run format:check` | Apply formatting            |
| `pnpm run typecheck`    | Type-check without emitting |
| `pnpm run test`         | Run tests with vitest       |
