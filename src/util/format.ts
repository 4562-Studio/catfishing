import type { Client } from "discord.js";

/**
 * Resolves a guild emoji by name to its Discord string representation.
 * Falls back to `:name:` text syntax when the emoji isn't in the bot's cache
 * (e.g., the bot is not a member of the server that owns the emoji).
 *
 * @param name - The emoji name to look up (case-sensitive).
 * @param client - The Discord client whose emoji cache to search.
 * @returns The emoji string (e.g. `<:hapcat:123456>`) or `:name:` fallback.
 */
export function getEmoji(name: string, client: Client): string {
  return (
    client.emojis.cache.find((emoji) => emoji.name === name)?.toString() ??
    `:${name}:`
  );
}
