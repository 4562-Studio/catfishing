import { Client, Events, GatewayIntentBits } from "discord.js";
import type { BotContext } from "./commands";
import env from "./util/env";
import interactionCreate from "./events/interaction-create";
import logger from "./util/logger";
import ready from "./events/ready";

const client = new Client({
  intents: [
    // Required for slash command routing and guild membership APIs.
    GatewayIntentBits.Guilds,
    // Required to populate `client.emojis.cache` with guild emojis.
    GatewayIntentBits.GuildExpressions,
  ],
});

const ctx: BotContext = { logger };

// once() so reconnects don't re-trigger startup logic like command registration
client.once(
  Events.ClientReady,
  async (readyClient) => await ready(readyClient, ctx),
);

// on() since interactions keep firing throughout the bot's lifetime
client.on(
  Events.InteractionCreate,
  async (interaction) => await interactionCreate(interaction, ctx),
);

client.login(env.DISCORD_TOKEN);
