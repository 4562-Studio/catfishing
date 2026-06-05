import type { Command } from "./index";
import { MessageFlags } from "discord.js";

export default {
  data: {
    description: "Manage your rods.",
    name: "rod",
  },
  execute: async (interaction) => {
    await interaction.reply({
      content: "Rod command executed successfully!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
