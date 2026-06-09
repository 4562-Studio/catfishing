import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  dialect: "sqlite",
  out: "./src/db/migrations",
  schema: "./src/db/schema",
});
