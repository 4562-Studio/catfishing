import type { Command } from "./index";
import env from "../util/env";
import {
  ChannelType,
  SlashCommandBuilder,
  ThreadAutoArchiveDuration,
} from "discord.js";

type FishingArea = {
  threadId: string;
  threadName: string;
  userId: string; // Needed for later.
};

const activeFishingAreas = new Map<string, FishingArea>(); // Move from memory to DB at some point?

export default {
  data: new SlashCommandBuilder()
    .setName("fishingarea")
    .setDescription("Creates a temporary thread for you to fish in.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The thread's name. Format: (user)'s (name)")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(50),
    )
    .addBooleanOption((option) =>
      option
        .setName("private")
        .setDescription("Should the thread be private?"),
    ).toJSON(),

  async execute(interaction) {
    const botChannel = interaction.guild?.channels.cache.get(env.CATFISHING_CHANNEL_ID);
    const userFishingArea = activeFishingAreas.get(interaction.user.id);
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    const displayName = member?.displayName ?? interaction.user.username;

    if (botChannel == undefined || interaction.channelId !== botChannel.id || botChannel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "You can only use this command in the #catfishing channel!",
        ephemeral: true,
      });
      return;
    }

    if (userFishingArea != undefined) {
      const existingThread = await interaction.client.channels
        .fetch(userFishingArea.threadId)
        .catch(() => null);

      if (existingThread?.isThread() && !existingThread.archived) {
        await interaction.reply({
          content: `You already have a fishing channel called ${userFishingArea.threadName}!`,
          ephemeral: true,
        });
        return;
      }
      activeFishingAreas.delete(interaction.user.id);
    }

    const threadName = interaction.options.getString("name", true);
    const isPrivate = interaction.options.getBoolean("private") ?? false;

    const thread = await botChannel.threads.create({
      name: `${displayName}'s ${threadName}`,
      reason: "Go fish!",
      autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
      type: isPrivate ? ChannelType.PrivateThread : ChannelType.PublicThread,
    });

    const fishingArea: FishingArea = {
        threadId: thread.id,
        threadName: thread.name,
        userId: interaction.user.id,
        };

    activeFishingAreas.set(interaction.user.id, fishingArea);
    
    await thread.members.add(interaction.user.id);
    await thread.send("Good luck! 🎣");

    await interaction.reply({
      content: `Created fishing area: ${thread}`,
      ephemeral: true,
    });
  },
} satisfies Command;
