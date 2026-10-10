import { ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";
import type { Button, Command } from "./index";
import { handleFishCommand } from "./utility/fish-handler";

export default {
  data: new SlashCommandBuilder()
    .setName("fish")
    .setDescription("Go Fishing!")
    .toJSON(),

  async execute(interaction, ctx) {
    const log = ctx.logger.child({
      channelId: interaction.channelId,
      command: "fish",
      guildId: interaction.guildId,
      interactionId: interaction.id,
      userId: interaction.user.id,
    });

    await handleFishCommand(interaction, log);
  },
} satisfies Command;

const BUTTON_ID_FISH = "fish";
const BUTTON_LABEL_FISH = "FISH AGAIN!";

export const buttonfish = {
  data: BUTTON_ID_FISH,

  async execute(interaction, ctx) {
    const log = ctx.logger.child({
      channelId: interaction.channelId,
      command: "fish",
      guildId: interaction.guildId,
      interactionId: interaction.id,
      userId: interaction.user.id,
    });

    await handleFishCommand(interaction, log);
  },
} satisfies Button;

export function buildButtonFish(
  id: string = BUTTON_ID_FISH,
  label: string = BUTTON_LABEL_FISH,
  style: ButtonStyle = ButtonStyle.Primary,
): ButtonBuilder {
  return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
}
