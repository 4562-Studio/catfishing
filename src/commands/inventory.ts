import type { Button, Command } from "./index";
import { ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";

export default {
  data: {
    description: "Show your inventory of items and cosmetics.",
    name: "inventory",
  },
  execute: async (interaction) => {
    await interaction.reply({
      content: "Inventory command executed successfully!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;

const BUTTON_LABEL_INVENTORY = "RETURN";
const BUTTON_ID_INVENTORY = "inventory";

export const buttonfish = {
  data: BUTTON_ID_INVENTORY,

  async execute(interaction, ctx) {
    const _log = ctx.logger.child({
      channelId: interaction.channelId,
      command: "fish",
      guildId: interaction.guildId,
      interactionId: interaction.id,
      userId: interaction.user.id,
    });

    // TODO: Implement inventory handler Inventory display component will show
    // Different buttons at the bottom. Need to implement flexible
    // ActionRowBuilder depending on where `inventory` is triggered
  },
} satisfies Button;

export function buildButtonInventory(
  id: string = BUTTON_ID_INVENTORY,
  label: string = BUTTON_LABEL_INVENTORY,
  style: ButtonStyle = ButtonStyle.Primary,
): ButtonBuilder {
  return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
}
