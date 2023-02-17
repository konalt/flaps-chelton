import { ActivityType, Client, Partials, PresenceData } from "discord.js";
import { config } from "dotenv";
import { readFile } from "fs/promises";

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

    readFile("saved_status.txt")
        .then((b) => b.toString("utf-8"))
        .then((statusData) => {
            let statusType =
                ActivityType[
                    statusData
                        .split(" ")[0]
                        .split("")
                        .map((l, i) =>
                            i == 0 ? l.toUpperCase() : l.toLowerCase()
                        )
                        .join("")
                ];
            let name = statusData.split(" ").slice(1).join(" ");

            console.log({ statusType, name });

            client.user.setPresence({
                activities: [
                    {
                        name,
                        type: statusType,
                        url: "https://konalt.us.to/",
                    },
                ],
                afk: false,
                status: "online",
            });
        });
});

client.login(process.env.DISCORD_TOKEN || "NoTokenProvided");
