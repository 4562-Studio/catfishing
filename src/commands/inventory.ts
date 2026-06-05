import type { Command } from "./index";
import { MessageFlags } from "discord.js";

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
