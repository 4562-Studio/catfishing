import { type BotContext, commands } from "../commands";
import { type Client, REST } from "discord.js";
import { API } from "@discordjs/core/http-only";
import env from "../util/env";

export default async function ready(client: Client<true>, ctx: BotContext) {
  const log = ctx.logger.child({ event: "ready" });
  log.info({ user: client.user.tag }, "Bot starting");

  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
  const api = new API(rest);

  const body = commands.map((cmd) => cmd.data);

  // Re-register on every startup so command definitions stay in sync with code.
  // Guild-scoped commands update instantly, global commands take up to 1 hour.
  // NOTE: Discord rate limits to 200 slash command creations per day per guild, but recreating an existing command is performed as an upsert and doesn't count against this quota.
  // See https://docs.discord.com/developers/interactions/application-commands#registering-a-command
  try {
    await api.applicationCommands.bulkOverwriteGuildCommands(
      env.APPLICATION_ID,
      env.GUILD_ID,
      body,
    );
    log.info({ count: body.length }, "Registered guild commands");
  } catch (error) {
    log.error({ err: error }, "Failed to register commands");
    // eslint-disable-next-line no-magic-numbers
    process.exit(1);
  }
}
