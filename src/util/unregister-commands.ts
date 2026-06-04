import { API } from "@discordjs/core/http-only";
import { REST } from "discord.js";
import env from "./env";

const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
const api = new API(rest);

await api.applicationCommands.bulkOverwriteGuildCommands(
  env.APPLICATION_ID,
  env.GUILD_ID,
  [],
);

console.log("Unregistered all guild commands.");
