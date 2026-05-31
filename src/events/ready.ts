import { type BotContext, commands } from "../commands";
import { type Client, REST } from "discord.js";
import { API } from "@discordjs/core/http-only";
import env from "../util/env";

export default async function ready(client: Client<true>, ctx: BotContext) {
  const { logger } = ctx;
  logger.info({ tag: client.user.tag }, "Bot starting!");

  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
  const api = new API(rest);

  const body = [...commands.values()].map((cmd) => cmd.data);

  // Re-register on every startup so command definitions stay in sync with code.
  // Guild-scoped commands update instantly, global commands take up to 1 hour.
  // NOTE: Discord rate limits to 200 slash command creations per day per guild, but recreating an existing command is performed as an upsert and doesn't count against this quota.
  // See https://docs.discord.com/developers/interactions/application-commands#registering-a-command
  try {
    // Const result = await api.applicationCommands.bulkOverwriteGlobalCommands(
    //   Env.APPLICATION_ID,
    //   Body,
    // );
    // Api.applicationCommands.bulkOverwriteGuildCommands;
    await api.applicationCommands.bulkOverwriteGuildCommands(
      env.APPLICATION_ID,
      env.GUILD_ID,
      body,
    );
    logger.info({ count: body.length }, "Registered guild commands");
  } catch (error) {
    logger.error({ error }, "Failed to register commands");
  }
}
