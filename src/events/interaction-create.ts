import { type BotContext, commands } from "../commands";
import {
  type CacheType,
  type Interaction,
  type InteractionReplyOptions,
  MessageFlags,
  codeBlock,
} from "discord.js";
import { getEmoji } from "../util/format";
import logger from "../util/logger";

export default async function interactionCreate(
  interaction: Interaction<CacheType>,
  ctx: BotContext,
) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands.get(interaction.commandName);
  // Interaction arrived for a command not in our registry - Discord sent stale data.
  if (!command) {
    return;
  }

  try {
    await command.execute(interaction, ctx);
  } catch (error) {
    logger.error(
      {
        command: interaction.commandName,
        error,
        user: interaction.user.id,
      },
      "Command execution failed",
    );

    const emoji = getEmoji("catsurpised", interaction.client);
    // String() because thrown values aren't guaranteed to be Error instances
    const codeBlockContent = codeBlock(String(error));

    const msg: InteractionReplyOptions = {
      content: `### Oh no... I ran into an error! ${emoji}\n${codeBlockContent}`,
      // Only the invoking user sees the error, not the whole channel.
      flags: MessageFlags.Ephemeral,
    };

    // Reply() throws if the interaction was already replied to or deferred.
    // FollowUp() works in both cases, so we branch to avoid a double-reply error.
    const response =
      interaction.replied || interaction.deferred
        ? interaction.followUp
        : interaction.reply;

    await response(msg);
  }
}
