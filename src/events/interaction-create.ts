import { type BotContext, buttons, commands } from "../commands";
import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
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
  if (interaction.isChatInputCommand()) {
    routeChatInputCommand(interaction, ctx);
    return;
  }

  if (interaction.isButton()) {
    routeButtonInteraction(interaction, ctx);
  }
}

export async function replyWithError(
  interaction: Interaction<CacheType>,
  error: string,
): Promise<void> {
  const emoji = getEmoji("catsurprised", interaction.client);
  const codeBlockContent = codeBlock(error);

  const msg: InteractionReplyOptions = {
    content: `### Oh no... I ran into an error! ${emoji}\n${codeBlockContent}`,
    // Only the invoking user sees the error, not the whole channel.
    flags: MessageFlags.Ephemeral,
  };

  // If other types of interactions are added to interactionCreate()
  // Then error handling will also need to be extended
  if (interaction.isChatInputCommand() || interaction.isButton()) {
    // Reply() throws if already replied/deferred, followUp() works in both cases.
    await (interaction.replied || interaction.deferred
      ? interaction.followUp(msg)
      : interaction.reply(msg));
  }
}

export async function routeChatInputCommand(
  interaction: ChatInputCommandInteraction<CacheType>,
  ctx: BotContext,
) {
  const command = commands.get(interaction.commandName);
  // Interaction arrived for a command not in our registry - Discord sent stale data.
  if (!command) {
    return;
  }

  const log = ctx.logger.child({ command: interaction.commandName });

  try {
    await command.execute(interaction, ctx);
    log.info({
      cmd: command,
      user: interaction.user.id,
    });
  } catch (error) {
    log.error(
      {
        err: error,
        user: interaction.user.id,
      },
      "Command execution failed",
    );

    replyWithError(
      interaction,
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function routeButtonInteraction(
  interaction: ButtonInteraction<CacheType>,
  ctx: BotContext,
) {
  const button = buttons.get(interaction.customId);
  if (!button) {
    return;
  }
  const log = ctx.logger.child({ button: interaction.customId });

  // Need to create button registry
  try {
    await button.execute(interaction, ctx);
    log.info({
      btn: button,
      user: interaction.user.id,
    });
  } catch (error) {
    log.error(
      {
        err: error,
        user: interaction.user.id,
      },
      "Button execution failed",
    );

    replyWithError(
      interaction,
      error instanceof Error ? error.message : String(error),
    );
  }
}
