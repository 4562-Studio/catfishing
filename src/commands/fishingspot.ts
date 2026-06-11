import type { Command } from "./index";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  MessageFlags,
  SlashCommandBuilder,
  ThreadAutoArchiveDuration,
  type TextChannel,
} from "discord.js";

interface FishingSpot {
  guildId: string;
  threadId: string;
  threadName: string;
  userId: string;
}

// Move from memory to DB at some point?
const activeFishingSpots = new Map<string, FishingSpot>();
const activeFishingSpotPrompts = new Set<string>();

export default {
  data: new SlashCommandBuilder()
    .setName("fishingspot")
    .setDescription("Creates a temporary thread for you to fish in.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The spot's name. Format: (user)'s (name)")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(50),
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

    const guild = interaction.guild;

    if (!guild) {
      await interaction.editReply({
        content: "You can only use this command in a server.",
      });
      return;
    }

    if (interaction.channel?.type !== ChannelType.GuildText) {
      await interaction.editReply({
        content: "You can only create a fishing spot in a text channel.",
      });
      return;
    }

    // Constants
    const channel = interaction.channel as TextChannel;
    const userId = interaction.user.id;
    const fishingSpotKey = `${guild.id}:${userId}`;
    const member = await guild.members.fetch(userId);
    const displayName = member.displayName;
    const spotName = interaction.options.getString("name", true);
    const visibility = interaction.options.getString("visibility") ?? "public";
    const isPrivate = visibility === "private";
    const userFishingSpot = activeFishingSpots.get(fishingSpotKey);

    if (userFishingSpot !== undefined) {
      const existingThread = await interaction.client.channels
        .fetch(userFishingSpot.threadId)
        .catch(() => undefined);

      if (existingThread?.isThread()) {
        if (activeFishingSpotPrompts.has(fishingSpotKey)) {
          await interaction.editReply({
            content:
              "You already have a fishing spot prompt open. Please use that one first.",
          });
          return;
        }

        activeFishingSpotPrompts.add(fishingSpotKey);

        try {
          const jumpButton = new ButtonBuilder()
            .setCustomId("fishingspot:jump")
            .setLabel(
              existingThread.archived ? "Reopen!" : "Jump to your spot!",
            )
            .setStyle(ButtonStyle.Primary);

          const replaceButton = new ButtonBuilder()
            .setCustomId("fishingspot:replace")
            .setLabel("Delete and replace!")
            .setStyle(ButtonStyle.Danger);

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            jumpButton,
            replaceButton,
          );

          const literalThreadType = existingThread.archived
            ? "archived"
            : "active";

          await interaction.editReply({
            components: [row],
            content: `You already have an ${literalThreadType} fishing spot called **${existingThread.name}**.`,
          });

          const reply = await interaction.fetchReply();

          const buttonInteraction = await reply
            .awaitMessageComponent({
              componentType: ComponentType.Button,
              filter: (buttonInteraction) =>
                buttonInteraction.user.id === userId &&
                buttonInteraction.customId.startsWith("fishingspot:"),
              time: 30_000,
            })
            .catch(() => undefined);

          if (buttonInteraction === undefined) {
            await interaction.editReply({
              components: [],
              content: "No changes made.",
            });
            return;
          }

          await buttonInteraction.deferUpdate();

          switch (buttonInteraction.customId) {
            case "fishingspot:jump": {
              if (existingThread.archived) {
                const reopenedThread = await existingThread
                  .setArchived(false)
                  .catch((error: unknown) => {
                    log.warn(
                      {
                        err: error,
                        fishingSpotKey,
                        threadId: existingThread.id,
                      },
                      "Failed to reopen fishing spot thread",
                    );
                    return undefined;
                  });

                if (reopenedThread === undefined) {
                  await interaction.editReply({
                    components: [],
                    content:
                      "I found your fishing spot, but I couldn't reopen it. I may be missing permission to manage threads.",
                  });
                  return;
                }
              }

              await existingThread.members
                .add(userId)
                .catch((error: unknown) => {
                  log.warn(
                    {
                      err: error,
                      fishingSpotKey,
                      threadId: existingThread.id,
                    },
                    "Failed to add user to fishing spot thread",
                  );
                });

              await interaction.editReply({
                components: [],
                content: `Here is your fishing spot: ${existingThread}`,
              });
              return;
            }

            case "fishingspot:replace": {
              const deletedThread = await existingThread
                .delete()
                .catch((error: unknown) => {
                  log.warn(
                    {
                      err: error,
                      fishingSpotKey,
                      threadId: existingThread.id,
                    },
                    "Failed to delete old fishing spot thread",
                  );
                  return undefined;
                });

              if (deletedThread === undefined) {
                await interaction.editReply({
                  components: [],
                  content:
                    "I couldn't delete your old fishing spot. I may be missing permission to manage threads.",
                });
                return;
              }

              activeFishingSpots.delete(fishingSpotKey);
              break;
            }

            default: {
              await interaction.editReply({
                components: [],
                content: "No changes made.",
              });
              return;
            }
          }
        } finally {
          activeFishingSpotPrompts.delete(fishingSpotKey);
        }
      } else {
        activeFishingSpots.delete(fishingSpotKey);
      }
    }

    const thread = await channel.threads
      .create({
        autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
        name: `${displayName}'s ${spotName}`,
        reason: "Go fish!",
        type: isPrivate ? ChannelType.PrivateThread : ChannelType.PublicThread,
      })
      .catch((error: unknown) => {
        log.warn(
          {
            channelId: channel.id,
            err: error,
            fishingSpotKey,
            isPrivate,
          },
          "Failed to create fishing spot thread",
        );
        return undefined;
      });

    if (thread === undefined) {
      await interaction.editReply({
        components: [],
        content:
          "I couldn't create that fishing spot. I may be missing permission to create threads in this channel.",
      });
      return;
    }

    const fishingSpot: FishingSpot = {
      guildId: guild.id,
      threadId: thread.id,
      threadName: thread.name,
      userId,
    };

    activeFishingSpots.set(fishingSpotKey, fishingSpot);

    await thread.members.add(userId).catch((error: unknown) => {
      log.warn(
        {
          err: error,
          fishingSpotKey,
          threadId: thread.id,
        },
        "Failed to add user to created fishing spot thread",
      );
    });

    await thread.send("Good luck! 🎣").catch(() => undefined);

    if (!isPrivate) {
      await channel
        .send(`${interaction.user} created a fishing spot: ${thread}`)
        .catch(() => undefined);
    }

    await interaction.editReply({
      components: [],
      content: `Created fishing spot: ${thread}`,
    });
  },
} satisfies Command;
