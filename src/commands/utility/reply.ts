import type { ButtonInteraction } from "discord.js";
import {
  ChannelType,
  type ChatInputCommandInteraction,
  type Guild,
  type TextChannel,
} from "discord.js";

/**
 * Helper get-or-null functions for command handlers to check if their
 * associated commands were called in the right place.
 *
 * @param replyMessage - The message to send back if getter returns null
 * @returns The object or null if it doesn't exist in `interaction` parameter
 */

export async function getGuildOrReply(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  replyMessage: string,
): Promise<Guild | null> {
  const { guild } = interaction;

  if (guild !== null) {
    return guild;
  }

  await interaction.editReply({
    content: replyMessage,
  });

  return null;
}

export async function getTextChannelOrReply(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  replyMessage: string,
): Promise<TextChannel | null> {
  const { channel } = interaction;

  if (
    channel?.type === ChannelType.GuildText ||
    channel?.type === ChannelType.PublicThread ||
    channel?.type === ChannelType.PrivateThread
  ) {
    return channel as TextChannel;
  }

  await interaction.editReply({
    content: replyMessage,
  });

  return null;
}
