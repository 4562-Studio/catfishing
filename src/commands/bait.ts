import type { Command } from "./index";
import { MessageFlags } from "discord.js";

export default {
  data: {
    description: "Manage bait.",
    name: "bait",
  },
  execute: async (interaction) => {
    await interaction.reply({
      content: "Bait command executed successfully!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
