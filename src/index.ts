import {
    ActivityType,
    Client,
    Collection,
    Partials,
    PresenceData,
} from "discord.js";
import { config } from "dotenv";
import { readFile, readdir } from "fs/promises";
import { FlapsCommand } from "./types";

console.log("[start] Loading data...");
config();
console.log("[start] Dotenv loaded.");

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

            client.user?.setPresence({
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

let commands: Collection<string, FlapsCommand> = new Collection();

console.log("[start] Reading commands...");

readdir(__dirname + "/commands", {
    withFileTypes: true,
}).then(async (files) => {
    console.log("[start] Parsing commands...");
    let fileNames = files.map((file) => file.name.split(".")[0]);
    for (const file of fileNames) {
        let command = require("./commands/" + file) as FlapsCommand;
        commands.set(command.id, command);
    }

    console.log("[start] Logging in...");
    client.login(process.env.DISCORD_TOKEN || "NoTokenProvided");
});
