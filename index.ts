import { Client } from "discord.js";
import { config } from "dotenv";

console.log("[start] Loading...");
config();

const client = new Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER", "USER"],
    intents: [
        "GUILD_MEMBERS",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
        "GUILD_VOICE_STATES",
        "GUILD_WEBHOOKS",
        "MESSAGE_CONTENT",
        "GUILDS",
        "GUILD_PRESENCES",
    ], // why
});

client.login();
