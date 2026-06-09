import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Environment variables only. Non-secret and non-environment settings live in config/config.ts.
 * Exits immediately with a clear error on startup if any required variable is missing.
 */

const snowflake = (name: string) =>
  z.string().regex(
    /^\d{17,19}$/u,
    `Invalid ${name} ID (expected 17-19 digit snowflake)`,
  );

export default createEnv({
  runtimeEnv: process.env,
  server: {
    /** The bot's application ID, used when registering slash commands via the REST API. */
    // Snowflake: 17-19 digit integer
    APPLICATION_ID: snowflake("application"),
    /** The Discord guild (server) ID to register slash commands to. Guild-scoped commands update instantly. */
    // Snowflake: 17-19 digit integer
    GUILD_ID: snowflake("guild"),
    /** The ID of the channel the server has designated for fishing. */
    // Snowflake: 17-19 digit integer
    CATFISHING_CHANNEL_ID: snowflake("channel"),
    /** Bot token from the Discord Developer Portal. */
    // Format: <base64url(user_id)>.<base64url(timestamp)>.<base64url(hmac)>
    DISCORD_TOKEN: z
      .string()
      .regex(
        /^[A-Za-z0-9_-]{24,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,38}$/u,
        "Invalid Discord bot token format",
      ),
  },
});
