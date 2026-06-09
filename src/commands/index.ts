import {
  type ChatInputCommandInteraction,
  Collection,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import type { Logger } from "pino";
import ping from "./ping";
import user from "./utility/user";
import bait from "./bait";
import cat from "./cat";
import cosmetic from "./cosmetic";
import inventory from "./inventory";
import rod from "./rod";
import sell from "./sell";
import fishingarea from "./fishingarea";

/**
 * Shared state passed as the second argument to every command's `execute` handler.
 * Add shared resources here as the bot grows (e.g. database clients, API wrappers).
 * Keeping these here avoids module-level singletons and makes handlers easier to test.
 */
export interface BotContext {
  /** Bot-level logger. Commands should call `logger.child({ command: "<name>" })` for scoped logs. */
  logger: Logger;
}

/** The shape every command module must export. */
export interface Command {
  /** Slash command definition. Used for Discord API registration and interaction routing by name. */
  data: RESTPostAPIChatInputApplicationCommandsJSONBody;

  /**
   * Called when a user invokes the command.
   * Should throw on unrecoverable errors - the caller in index.ts catches and sends an error reply.
   */
  execute: (
    interaction: ChatInputCommandInteraction,
    ctx: BotContext,
  ) => Promise<void>;
}

// Add new commands here. Each entry is keyed by its slash command name at startup.
const cmdList = [bait, cat, cosmetic, inventory, ping, rod, sell, user, fishingarea];

/**
 * A `Collection` (Discord.js Map subclass) of all registered commands, keyed by name.
 * Built once at module load. The `InteractionCreate` handler looks up commands from here.
 */
export const commands = new Collection<string, Command>(
  cmdList.map((cmd) => [cmd.data.name, cmd]),
);
