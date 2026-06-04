import { type BotContext, commands } from "../commands";
import {
  type CacheType,
  type Interaction,
  type InteractionReplyOptions,
  MessageFlags,
  codeBlock,
} from "discord.js";
import { getEmoji } from "../util/format";

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

  const log = ctx.logger.child({ command: interaction.commandName });

  try {
    await command.execute(interaction, ctx);
  } catch (error) {
    log.error(
      {
        err: error,
        user: interaction.user.id,
      },
      "Command execution failed",
    );

    const emoji = getEmoji("catsurprised", interaction.client);
    // String() because thrown values aren't guaranteed to be Error instances
    const codeBlockContent = codeBlock(String(error));

    const msg: InteractionReplyOptions = {
      content: `### Oh no... I ran into an error! ${emoji}\n${codeBlockContent}`,
      // Only the invoking user sees the error, not the whole channel.
      flags: MessageFlags.Ephemeral,
    };

    // Reply() throws if already replied/deferred, followUp() works in both cases.
    await (interaction.replied || interaction.deferred
      ? interaction.followUp(msg)
      : interaction.reply(msg));
  }
}
