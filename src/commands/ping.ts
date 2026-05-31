import { MessageFlags, bold, italic } from "discord.js";
import type { Command } from "./index";

export default {
  data: {
    description: "Ping!",
    name: "ping",
  },
  async execute(interaction) {
    const { client } = interaction;
    const emoji = client.emojis.cache.random()?.toString() ?? "";
    await interaction.reply({
      content: `${bold(italic("PONG!"))} ${emoji}`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
