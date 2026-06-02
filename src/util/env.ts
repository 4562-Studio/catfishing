import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Secret environment variables only. Non-secret settings live in config/config.ts.
 * Exits immediately with a clear error on startup if any required variable is missing.
 */
export default createEnv({
  runtimeEnv: process.env,
  server: {
    /** The bot's application ID, used when registering slash commands via the REST API. */
    // Snowflake: 17-19 digit integer
    APPLICATION_ID: z
      .string()
      .regex(
        /^\d{17,19}$/u,
        "Invalid Discord application ID (expected 17-19 digit snowflake)",
      ),
    /** Bot token from the Discord Developer Portal. */
    // Format: <base64url(user_id)>.<base64url(timestamp)>.<base64url(hmac)>
    DISCORD_TOKEN: z
      .string()
      .regex(
        /^[A-Za-z0-9_-]{24,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,38}$/u,
        "Invalid Discord bot token format",
      ),
    /** The Discord guild (server) ID to register slash commands to. Guild-scoped commands update instantly. */
    // Snowflake: 17-19 digit integer
    GUILD_ID: z
      .string()
      .regex(
        /^\d{17,19}$/u,
        "Invalid Discord guild ID (expected 17-19 digit snowflake)",
      ),
  },
});
