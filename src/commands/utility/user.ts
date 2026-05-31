import type { Command } from "../index";

export default {
  data: {
    description: "Provides information about the user.",
    name: "user",
  },
  async execute(interaction) {
    await interaction.reply(`This command was run by ${interaction.user.username}.`);
  },
} satisfies Command;
