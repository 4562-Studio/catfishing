import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ChannelType,
  type ChatInputCommandInteraction,
  ComponentType,
  type Guild,
  type TextChannel,
  ThreadAutoArchiveDuration,
  type ThreadChannel,
} from "discord.js";
import type { Logger } from "pino";

interface FishingSpot {
  guildId: string;
  threadId: string;
  threadName: string;
  userId: string;
}

interface FishingSpotRequest {
  channel: TextChannel;
  displayName: string;
  fishingSpotKey: string;
  guildId: string;
  isPrivate: boolean;
  spotName: string;
  userId: string;
}

const DEFAULT_VISIBILITY = "public";
const FISHING_SPOT_CUSTOM_ID_PREFIX = "fishingspot:";
const JUMP_TO_FISHING_SPOT_CUSTOM_ID = "fishingspot:jump";
export const MAX_SPOT_NAME_LENGTH = 50;
export const MIN_SPOT_NAME_LENGTH = 1;
const PRIVATE_VISIBILITY = "private";
const REPLACE_FISHING_SPOT_CUSTOM_ID = "fishingspot:replace";
const WAIT_FOR_BUTTON_TIME_MS = 30_000;

// Move from memory to DB at some point.
const activeFishingSpots = new Map<string, FishingSpot>();
const activeFishingSpotPrompts = new Set<string>();

async function getGuildOrReply(
  interaction: ChatInputCommandInteraction,
): Promise<Guild | null> {
  const { guild } = interaction;

  if (guild !== null) {
    return guild;
  }

  await interaction.editReply({
    content: "You can only use this command in a server.",
  });

  return null;
}

async function getTextChannelOrReply(
  interaction: ChatInputCommandInteraction,
): Promise<TextChannel | null> {
  const { channel } = interaction;

  if (channel?.type === ChannelType.GuildText) {
    return channel as TextChannel;
  }

  await interaction.editReply({
    content: "You can only create a fishing spot in a text channel.",
  });

  return null;
}

async function getFishingSpotRequest(params: {
  interaction: ChatInputCommandInteraction;
  channel: TextChannel;
  guild: Guild;
}): Promise<FishingSpotRequest> {
  const { interaction, channel, guild } = params;

  const userId = interaction.user.id;
  const member = await guild.members.fetch(userId);

  const spotName = interaction.options.getString("name", true);
  const visibility =
    interaction.options.getString("visibility") ?? DEFAULT_VISIBILITY;

  return {
    channel,
    displayName: member.displayName,
    fishingSpotKey: `${guild.id}:${userId}`,
    guildId: guild.id,
    isPrivate: visibility === PRIVATE_VISIBILITY,
    spotName,
    userId,
  };
}

async function fetchExistingFishingSpotThread(
  interaction: ChatInputCommandInteraction,
  fishingSpotKey: string,
): Promise<ThreadChannel | null> {
  const fishingSpot = activeFishingSpots.get(fishingSpotKey);

  if (fishingSpot === undefined) {
    return null;
  }

  const thread = await interaction.client.channels
    .fetch(fishingSpot.threadId)
    .catch(() => null);

  if (thread?.isThread()) {
    return thread;
  }

  activeFishingSpots.delete(fishingSpotKey);
  return null;
}

function buildExistingFishingSpotButtons(
  existingThread: ThreadChannel,
): ActionRowBuilder<ButtonBuilder> {
  const jumpButton = new ButtonBuilder()
    .setCustomId(JUMP_TO_FISHING_SPOT_CUSTOM_ID)
    .setLabel(existingThread.archived ? "Reopen!" : "Jump to your spot!")
    .setStyle(ButtonStyle.Primary);

  const replaceButton = new ButtonBuilder()
    .setCustomId(REPLACE_FISHING_SPOT_CUSTOM_ID)
    .setLabel("Delete and replace!")
    .setStyle(ButtonStyle.Danger);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    jumpButton,
    replaceButton,
  );
}

async function waitForFishingSpotButton(
  interaction: ChatInputCommandInteraction,
  userId: string,
): Promise<ButtonInteraction | null> {
  const reply = await interaction.fetchReply();

  return reply
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (buttonInteraction) =>
        buttonInteraction.user.id === userId &&
        buttonInteraction.customId.startsWith(FISHING_SPOT_CUSTOM_ID_PREFIX),
      time: WAIT_FOR_BUTTON_TIME_MS,
    })
    .catch(() => null);
}

async function jumpToExistingFishingSpot(params: {
  interaction: ChatInputCommandInteraction;
  existingThread: ThreadChannel;
  request: FishingSpotRequest;
  log: Logger;
}): Promise<void> {
  const { interaction, existingThread, request, log } = params;

  if (existingThread.archived) {
    const reopenedThread = await existingThread
      .setArchived(false)
      .catch((error: unknown) => {
        log.warn(
          {
            err: error,
            fishingSpotKey: request.fishingSpotKey,
            threadId: existingThread.id,
          },
          "Failed to reopen fishing spot thread",
        );

        return null;
      });

    if (reopenedThread === null) {
      await interaction.editReply({
        components: [],
        content:
          "I found your fishing spot, but I couldn't reopen it. I may be missing permission to manage threads.",
      });
      return;
    }
  }

  await existingThread.members.add(request.userId).catch((error: unknown) => {
    log.warn(
      {
        err: error,
        fishingSpotKey: request.fishingSpotKey,
        threadId: existingThread.id,
      },
      "Failed to add user to fishing spot thread",
    );
  });

  await interaction.editReply({
    components: [],
    content: `Here is your fishing spot: ${existingThread}`,
  });
}

async function replaceExistingFishingSpot(params: {
  interaction: ChatInputCommandInteraction;
  existingThread: ThreadChannel;
  fishingSpotKey: string;
  log: Logger;
}): Promise<boolean> {
  const { interaction, existingThread, fishingSpotKey, log } = params;

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

      return null;
    });

  if (deletedThread === null) {
    await interaction.editReply({
      components: [],
      content:
        "I couldn't delete your old fishing spot. I may be missing permission to manage threads.",
    });
    return false;
  }

  activeFishingSpots.delete(fishingSpotKey);
  return true;
}

async function replyNoFishingSpotChanges(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.editReply({
    components: [],
    content: "No changes made.",
  });
}

async function startFishingSpotPrompt(
  interaction: ChatInputCommandInteraction,
  fishingSpotKey: string,
): Promise<boolean> {
  if (!activeFishingSpotPrompts.has(fishingSpotKey)) {
    activeFishingSpotPrompts.add(fishingSpotKey);
    return true;
  }

  await interaction.editReply({
    content:
      "You already have a fishing spot prompt open. Please use that one first.",
  });

  return false;
}

async function showExistingFishingSpotPrompt(
  interaction: ChatInputCommandInteraction,
  existingThread: ThreadChannel,
): Promise<void> {
  const row = buildExistingFishingSpotButtons(existingThread);
  const literalThreadType = existingThread.archived ? "archived" : "active";

  await interaction.editReply({
    components: [row],
    content: `You already have an ${literalThreadType} fishing spot called **${existingThread.name}**.`,
  });
}

async function handleExistingFishingSpotButton(params: {
  interaction: ChatInputCommandInteraction;
  existingThread: ThreadChannel;
  request: FishingSpotRequest;
  log: Logger;
}): Promise<boolean> {
  const { interaction, existingThread, request, log } = params;

  const buttonInteraction = await waitForFishingSpotButton(
    interaction,
    request.userId,
  );

  if (buttonInteraction === null) {
    await replyNoFishingSpotChanges(interaction);
    return false;
  }

  await buttonInteraction.deferUpdate();

  if (buttonInteraction.customId === JUMP_TO_FISHING_SPOT_CUSTOM_ID) {
    await jumpToExistingFishingSpot({
      existingThread,
      interaction,
      log,
      request,
    });
    return false;
  }

  if (buttonInteraction.customId === REPLACE_FISHING_SPOT_CUSTOM_ID) {
    return replaceExistingFishingSpot({
      existingThread,
      fishingSpotKey: request.fishingSpotKey,
      interaction,
      log,
    });
  }

  await replyNoFishingSpotChanges(interaction);
  return false;
}

async function promptForExistingFishingSpot(params: {
  interaction: ChatInputCommandInteraction;
  existingThread: ThreadChannel;
  request: FishingSpotRequest;
  log: Logger;
}): Promise<boolean> {
  const { interaction, existingThread, request, log } = params;

  const shouldStartPrompt = await startFishingSpotPrompt(
    interaction,
    request.fishingSpotKey,
  );

  if (!shouldStartPrompt) {
    return false;
  }

  try {
    await showExistingFishingSpotPrompt(interaction, existingThread);

    return handleExistingFishingSpotButton({
      existingThread,
      interaction,
      log,
      request,
    });
  } finally {
    activeFishingSpotPrompts.delete(request.fishingSpotKey);
  }
}

async function shouldCreateFishingSpot(params: {
  interaction: ChatInputCommandInteraction;
  request: FishingSpotRequest;
  log: Logger;
}): Promise<boolean> {
  const { interaction, request, log } = params;

  const existingThread = await fetchExistingFishingSpotThread(
    interaction,
    request.fishingSpotKey,
  );

  if (existingThread === null) {
    return true;
  }

  return promptForExistingFishingSpot({
    existingThread,
    interaction,
    log,
    request,
  });
}

async function createFishingSpotThread(params: {
  interaction: ChatInputCommandInteraction;
  request: FishingSpotRequest;
  log: Logger;
}): Promise<ThreadChannel | null> {
  const { interaction, request, log } = params;

  const thread = await request.channel.threads
    .create({
      autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
      name: `${request.displayName}'s ${request.spotName}`,
      reason: "Go fish!",
      type: request.isPrivate
        ? ChannelType.PrivateThread
        : ChannelType.PublicThread,
    })
    .catch((error: unknown) => {
      log.warn(
        {
          channelId: request.channel.id,
          err: error,
          fishingSpotKey: request.fishingSpotKey,
          isPrivate: request.isPrivate,
        },
        "Failed to create fishing spot thread",
      );

      return null;
    });

  if (thread === null) {
    await interaction.editReply({
      components: [],
      content:
        "I couldn't create that fishing spot. I may be missing permission to create threads in this channel.",
    });
  }

  return thread;
}

function rememberFishingSpot(
  request: FishingSpotRequest,
  thread: ThreadChannel,
): void {
  activeFishingSpots.set(request.fishingSpotKey, {
    guildId: request.guildId,
    threadId: thread.id,
    threadName: thread.name,
    userId: request.userId,
  });
}

async function setupFishingSpotThread(params: {
  interaction: ChatInputCommandInteraction;
  request: FishingSpotRequest;
  thread: ThreadChannel;
  log: Logger;
}): Promise<void> {
  const { interaction, request, thread, log } = params;

  await thread.members.add(request.userId).catch((error: unknown) => {
    log.warn(
      {
        err: error,
        fishingSpotKey: request.fishingSpotKey,
        threadId: thread.id,
      },
      "Failed to add user to created fishing spot thread",
    );
  });

  await thread.send("Good luck! 🎣").catch(() => null);

  if (!request.isPrivate) {
    await request.channel
      .send(`${interaction.user} created a fishing spot: ${thread}`)
      .catch(() => null);
  }
}

async function createAndSetupFishingSpot(params: {
  interaction: ChatInputCommandInteraction;
  request: FishingSpotRequest;
  log: Logger;
}): Promise<void> {
  const { interaction, request, log } = params;

  const thread = await createFishingSpotThread({
    interaction,
    log,
    request,
  });

  if (thread === null) {
    return;
  }

  rememberFishingSpot(request, thread);

  await setupFishingSpotThread({
    interaction,
    log,
    request,
    thread,
  });

  await interaction.editReply({
    components: [],
    content: `Created fishing spot: ${thread}`,
  });
}

export async function handleFishingSpotCommand(
  interaction: ChatInputCommandInteraction,
  log: Logger,
): Promise<void> {
  const guild = await getGuildOrReply(interaction);

  if (guild === null) {
    return;
  }

  const channel = await getTextChannelOrReply(interaction);

  if (channel === null) {
    return;
  }

  const request = await getFishingSpotRequest({
    channel,
    guild,
    interaction,
  });

  const shouldCreateSpot = await shouldCreateFishingSpot({
    interaction,
    log,
    request,
  });

  if (!shouldCreateSpot) {
    return;
  }

  await createAndSetupFishingSpot({
    interaction,
    log,
    request,
  });
}