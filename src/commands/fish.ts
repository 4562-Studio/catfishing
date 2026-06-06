import type { Command } from "./index";
import { MessageFlags } from "discord.js";

export default {
  data: {
    description: "Go Fishing!",
    name: "fish",
  },
  execute: async (interaction) => {
    await interaction.reply({
      content: "Fish command executed successfully!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
