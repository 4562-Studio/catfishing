import type { ButtonInteraction } from "discord.js";
import {
  type ChatInputCommandInteraction,
  type Guild,
  type TextChannel,
  type ThreadChannel,
} from "discord.js";

import type { Command } from "../index";

export interface UserInfo {
  biome: string; // TODO: to create biome type
  fishingRod: string; // TODO: to create fishing rod type
  displayName: string;
  level: number;
  userId: string;
}

export default {
  data: {
    description: "Provides information about the user.",
    name: "user",
  },
  async execute(interaction) {
    await interaction.reply(
      `This command was run by ${interaction.user.username}.`,
    );
  },
} satisfies Command;

export async function getUserInfo(params: {
  interaction: ChatInputCommandInteraction | ButtonInteraction;
  channel: TextChannel | ThreadChannel;
  guild: Guild;
  userId: string;
}): Promise<UserInfo | null> {
  // TODO: Fetch from cache or database, a global cache class must be created so other commands can
  // Fetch from cache
  const { guild, userId } = params;
  const member = await guild.members.fetch(userId);
  return {
    biome: "localhost",
    displayName: member.displayName,
    fishingRod: "Wooden Rod",
    level: 1,
    userId,
  };
}
