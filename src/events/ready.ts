import { Events } from "discord.js";
import type { Event } from "./index";

export default {
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
  name: Events.ClientReady,
  once: true,
} satisfies Event<Events.ClientReady>;
