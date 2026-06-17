import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Secret environment variables only. Non-secret settings live in config/config.ts.
 * Exits immediately with a clear error on startup if any required variable is missing.
 */

// General verifier for IDs in snowflake format.
const snowflake = (name: string) =>
  z
    .string()
    .regex(
      /^\d{17,19}$/u,
      `Invalid ${name} ID (expected 17-19 digit snowflake)`,
    );

export default createEnv({
  runtimeEnv: process.env,
  server: {
    /** The bot's application ID, used when registering slash commands via the REST API. */
    // Snowflake: 17-19 digit integer
    APPLICATION_ID: snowflake("application"),
    /** Database URL, used for persistence */
    // Either file path or url to hosted SQLite
    DATABASE_URL: z.string().or(z.url()),
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
    GUILD_ID: snowflake("guild"),
  },
});
