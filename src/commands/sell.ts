import type { Button, Command } from "./index";
import { ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";

export default {
  data: {
    description: "Sell items for coins.",
    name: "sell",
  },
  execute: async (interaction) => {
    await interaction.reply({
      content: "Sell command executed successfully!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;

const BUTTON_ID_SELL = "sell";
const BUTTON_LABEL_SELL = "SELL";

export const buttonsell = {
  data: BUTTON_ID_SELL,

  async execute(interaction, ctx) {
    const _log = ctx.logger.child({
      channelId: interaction.channelId,
      command: "fish",
      guildId: interaction.guildId,
      interactionId: interaction.id,
      userId: interaction.user.id,
    });

    //TODO: Implement sell-handler
  },
} satisfies Button;

export function buildButtonSell(
  id: string = BUTTON_ID_SELL,
  label: string = BUTTON_LABEL_SELL,
  style: ButtonStyle = ButtonStyle.Primary,
): ButtonBuilder {
  return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
}
