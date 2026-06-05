import type { Command } from "./index";
import { MessageFlags } from "discord.js";

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
