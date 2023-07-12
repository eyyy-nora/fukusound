import { env } from "@fukumong/util";
import { Client } from "discord.js";

export const discord = new Client({
  intents: ["Guilds", "GuildVoiceStates"],
});

export async function initDiscord() {
  await discord.login(env("discord_token"));
}
