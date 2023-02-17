"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
console.log("[start] Loading...");
(0, dotenv_1.config)();
console.log("[start] .Env file read");
const client = new discord_js_1.Client({
    partials: [
        discord_js_1.Partials.Message,
        discord_js_1.Partials.Channel,
        discord_js_1.Partials.Reaction,
        discord_js_1.Partials.GuildMember,
        discord_js_1.Partials.User,
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
client.login(process.env.DISCORD_TOKEN || "NoTokenProvided");
