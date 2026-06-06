import type { Command } from "./index";
import { MessageFlags } from "discord.js";

export default {
  data: {
    description: "Show yours or another user's profile card.",
    name: "cat",
  },
  execute: async (interaction) => {
    await interaction.reply({
      content: "Cat card command executed successfully!",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
