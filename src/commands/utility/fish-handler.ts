import type { ButtonBuilder, ButtonInteraction } from "discord.js";
import {
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  ContainerBuilder,
  type Guild,
  MessageFlags,
  type TextChannel,
} from "discord.js";
import { type FishingResult, play } from "../../lib/fish";
import { getGuildOrReply, getTextChannelOrReply } from "./reply";
import { type UserInfo, getUserInfo } from "./user";
import type { Logger } from "pino";
import { buildButtonFish } from "../fish";
import { buildButtonSell } from "../sell";
import { buildButtonInventory } from "../inventory";

const activeFishingSessions = new Map<string, FishingSession>();

// TODO: store in DB in the future
export interface FishingSession {
  fishingSessionKey: string;
  guildId: string;
  userId: string;
  channel: TextChannel;
  fishCaught: number;
}

export interface CurrentFishingSession {
  session: FishingSession;
  user: UserInfo;
}

// RGB
const FISHING_CONTAINER_COLOR_ACCENT = 15_337_143;

// Backend calls and fish
export async function handleFishCommand(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  log: Logger,
): Promise<void> {
  const guild = await getGuildOrReply(
    interaction,
    "You can only use this command in a server.",
  );
  if (guild === null) {
    return;
  }

  // TODO: implement ThreadChannel check
  const channel = await getTextChannelOrReply(
    interaction,
    "You can only fish in a text channel.",
  );
  if (channel === null) {
    return;
  }

  const fishingSessionKey = generateFishingSessionKey(interaction, guild);

  // TODO: implement rate limit: Discord API and server-side
  const current = await getCurrentFishingSession({
    channel,
    fishingSessionKey,
    guild,
    interaction,
    log,
  });

  if (!current) {
    return;
  }

  const fishingResult = await play(current);

  if (!fishingResult) {
    return;
  }

  await handleFishReply({
    channel,
    current,
    fishingResult,
    interaction,
    log,
  });
}

function generateFishingSessionKey(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  guild: Guild,
): string {
  return `${guild.id}:${interaction.user.id}`;
}

async function getCurrentFishingSession(params: {
  channel: TextChannel;
  fishingSessionKey: string;
  guild: Guild;
  interaction: ChatInputCommandInteraction | ButtonInteraction;
  log: Logger;
}): Promise<CurrentFishingSession | null> {
  const { interaction, channel, guild } = params;
  const userId = interaction.user.id;
  // TODO: Store member in cache only, not DB. Need to implement Cache object.
  const fishingSession = await getFishingSession(params);
  const userInfo = await getUserInfo({
    channel,
    guild,
    interaction,
    userId,
  });

  if (!userInfo) {
    return null;
  }

  return {
    session: fishingSession,
    user: userInfo,
  };
}

async function getFishingSession(params: {
  interaction: ChatInputCommandInteraction | ButtonInteraction;
  guild: Guild;
  channel: TextChannel;
  fishingSessionKey: string;
  log: Logger;
}): Promise<FishingSession> {
  const { fishingSessionKey } = params;

  const fishingSession =
    (await fetchExistingFishingSession(fishingSessionKey)) ??
    createNewFishingSession(params);

  rememberFishingSession(fishingSessionKey, fishingSession);

  return fishingSession;
}

async function fetchExistingFishingSession(
  fishingSessionKey: string,
): Promise<FishingSession | null> {
  /* TODO: Extend this function to fetch asynchronously from an in-memory cache
   * object in the future.
   */
  const fishingSession = activeFishingSessions.get(fishingSessionKey);
  if (fishingSession === undefined) {
    activeFishingSessions.delete(fishingSessionKey);
    return null;
  }
  return fishingSession;
}

function createNewFishingSession(params: {
  interaction: ChatInputCommandInteraction | ButtonInteraction;
  guild: Guild;
  channel: TextChannel;
  fishingSessionKey: string;
  log: Logger;
}): FishingSession {
  const { interaction, guild, channel, fishingSessionKey } = params;
  const fishingSession = {
    channel,
    fishCaught: 0,
    fishingSessionKey,
    guildId: guild.id,
    userId: interaction.user.id,
  };
  return fishingSession;
}

function rememberFishingSession(
  fishingSessionKey: string,
  fishingSession: FishingSession,
): void {
  activeFishingSessions.set(fishingSessionKey, fishingSession);
}

// Reply logic
async function handleFishReply(params: {
  channel: TextChannel;
  current: CurrentFishingSession;
  fishingResult: FishingResult;
  interaction: ChatInputCommandInteraction | ButtonInteraction;
  log: Logger;
}): Promise<void> {
  const { interaction, current, fishingResult } = params;
  const fishDisplay = buildFishingDisplay(current, fishingResult);

  await interaction
    .reply({
      components: [fishDisplay],
      flags: MessageFlags.IsComponentsV2,
    })
    .catch(() => null);
}

// Frontend
function buildFishingDisplay(
  current: CurrentFishingSession,
  fishingResult: FishingResult,
): ContainerBuilder {
  const textFishingResult = parseFishingResultToString(current, fishingResult);

  const buttons = buildFishingDisplayButtons();
  const container = new ContainerBuilder()
    .setAccentColor(FISHING_CONTAINER_COLOR_ACCENT)
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`${current.user.displayName}`),
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(textFishingResult),
    )
    .addActionRowComponents(buttons);

  return container;
}

function parseFishingResultToString(
  current: CurrentFishingSession,
  fishingResult: FishingResult,
): string {
  return `### You caught:
${fishingResult.loot.map((fish) => `${fish.count} ${fish.name}`).join("\n")}
+${fishingResult.exp} XP
Total fish caught this sesson: ${current.session.fishCaught}`;
}

function buildFishingDisplayButtons(): ActionRowBuilder<ButtonBuilder> {
  const buttonFish = buildButtonFish();
  const buttonSell = buildButtonSell();
  const buttonInventory = buildButtonInventory();

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    buttonFish,
    buttonSell,
    buttonInventory,
  );
}
