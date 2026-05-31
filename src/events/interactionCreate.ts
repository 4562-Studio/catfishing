import { URL } from "node:url";
import { Events } from "discord.js";
import { loadCommands } from "../util/loaders";
import type { Event } from "./index";

const commands = await loadCommands(new URL("../commands/", import.meta.url));

export default {
  async execute(interaction) {
    if (interaction.isCommand()) {
      const command = commands.get(interaction.commandName);

      if (!command) {
        throw new Error(`Command '${interaction.commandName}' not found.`);
      }

      await command.execute(interaction);
    }
  },
  name: Events.InteractionCreate,
} satisfies Event<Events.InteractionCreate>;
