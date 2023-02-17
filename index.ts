import { Client, Partials } from "discord.js";
import { config } from "dotenv";

console.log("[start] Loading...");
config();
console.log("[start] .Env file read");

const client = new Client({
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User,
    ],
    intents: [
        "GuildMembers",
        "GuildMessages",
        "GuildMessageReactions",
        "GuildVoiceStates",
        "GuildWebhooks",
        "MessageContent",
        "Guilds",
        "GuildPresences",
    ],
});

client.on("ready", () => {
    console.log("[start] Logged in!");
});

client.login(process.env.DISCORD_TOKEN || "NoTokenProvided");
