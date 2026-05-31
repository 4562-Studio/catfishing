import type { Command } from "./index";

export default {
  data: {
    description: "Ping!",
    name: "ping",
  },
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
} satisfies Command;
