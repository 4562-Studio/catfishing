import type { Command } from "./index";
import { MessageFlags } from "discord.js";

export default {
  data: {
    description: "Manage cosmetics and appearances for your cat.",
    name: "cosmetics",
  },
  execute: async (interaction) => {
    await interaction.reply({
      content: "Cosmetics command executed successfully!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
