import pino from "pino";

// Anything other than "production" gets pretty output, including when NODE_ENV is unset
const isDev = process.env.NODE_ENV !== "production";

export default pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport: isDev ? { target: "pino-pretty" } : undefined,
});
