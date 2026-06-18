import { MessageFlags, SlashCommandBuilder } from "discord.js";

import {
  MAX_SPOT_NAME_LENGTH,
  MIN_SPOT_NAME_LENGTH,
  handleFishingSpotCommand,
} from "./utility/fishingspot-handler";
import type { Command } from "./index";

export default {
  data: new SlashCommandBuilder()
    .setName("fishingspot")
    .setDescription("Creates a temporary thread for you to fish in.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The spot's name. Format: (user)'s (name)")
        .setRequired(true)
        .setMinLength(MIN_SPOT_NAME_LENGTH)
        .setMaxLength(MAX_SPOT_NAME_LENGTH),
    )
    .addStringOption((option) =>
      option
        .setName("visibility")
        .setDescription("Should the fishing spot be public or private?")
        .setRequired(false)
        .addChoices(
          { name: "public", value: "public" },
          { name: "private", value: "private" },
        ),
    )
    .toJSON(),

  async execute(interaction, ctx) {
    const log = ctx.logger.child({
      channelId: interaction.channelId,
      command: "fishingspot",
      guildId: interaction.guildId,
      interactionId: interaction.id,
      userId: interaction.user.id,
    });

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await handleFishingSpotCommand(interaction, log);
  },
} satisfies Command;
