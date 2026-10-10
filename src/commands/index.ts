import type { BaseInteraction, ButtonInteraction } from "discord.js";
import {
  type ChatInputCommandInteraction,
  Collection,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import type { Logger } from "pino";
import bait from "./bait";
import cat from "./cat";
import cosmetic from "./cosmetic";
import fish, { buttonfish } from "./fish";
import fishingspot from "./fishingspot";
import inventory from "./inventory";
import ping from "./ping";
import rod from "./rod";
import sell from "./sell";
import user from "./utility/user";

/**
 * Shared state passed as the second argument to every command's `execute` handler.
 * Add shared resources here as the bot grows (e.g. database clients, API wrappers).
 * Keeping these here avoids module-level singletons and makes handlers easier to test.
 */
export interface BotContext {
  /** Bot-level logger. Commands should call `logger.child({ command: "<name>" })` for scoped logs. */
  logger: Logger;
}

/** Generic interactions interface for routing based on registry and executing commands*/
interface InteractionModule<IdentifierType, I extends BaseInteraction> {
  /** @param IdentifierType - generic identifier to route incoming interations, whether via Discord API (REST
   * POST method .name field for slash commands) or client-side UI buttons (button ID)
   *
   * @param I - generic subclass of BaseInteraction, invoked when user interacts
   * with the bot. Should throw on unrecoverable errors - the caller in index.ts catches and sends an error reply.
   */
  data: IdentifierType;

  execute: (interation: I, ctx: BotContext) => Promise<void>;
}

/**
 * Identified by
 */
export interface Command extends InteractionModule<
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  ChatInputCommandInteraction
> {}

export interface Button extends InteractionModule<string, ButtonInteraction> {}

/** LISTS OF NAMES TO BE REGISTERED
 * Add new commands and buttons here.
 * Commands: each entry is keyed by its slash command name at startup. Served
 * globally via Discord API
 * Buttons: client-side UI elements, identifiers work via button.customId.
 * TODO: Handle buttons with prefixed customId instead of whole words
 * (e.g., "inventory-next-page-1" vs. "inventory")
 */
const cmdList = [
  bait,
  cat,
  cosmetic,
  fish,
  fishingspot,
  inventory,
  ping,
  rod,
  sell,
  user,
];

const btnList = [buttonfish];

/** REGISTRIES
 * A `Collection` (Discord.js Map subclass) of all registered commands, keyed by name.
 * Built once at module load. The `InteractionCreate` handler looks up commands from here.
 */

export const commands = new Collection<string, Command>(
  cmdList.map((cmd) => [cmd.data.name, cmd]),
);

export const buttons = new Map<string, Button>(
  btnList.map((btn) => [btn.data, btn]),
);
