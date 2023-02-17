import {
    ActivityType,
    Client,
    Collection,
    Message,
    Partials,
    PresenceData,
    TextChannel,
} from "discord.js";
import { config } from "dotenv";
import { readFile, readdir } from "fs/promises";
import { hooks, sendWebhook, updateUsers } from "./lib/webhooks";
import { Color, esc, log } from "./lib/logger";
import { FlapsCommand, WebhookBot } from "./types";

log("Loading data...", "start");
config();
log("Dotenv loaded.", "start");

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
    log("Logged in!", "start");

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

const COMMAND_PREFIX = "!";
const WH_PREFIX = "<";

function time() {
    var d = new Date();
    var h = d.getHours().toString().padStart(2, "0");
    var m = d.getMinutes().toString().padStart(2, "0");
    var s = d.getSeconds().toString().padStart(2, "0");
    return [h, m, s].join(":");
}

function idFromName(name: string) {
    return hooks.find((h) => h.name == name).id || "flaps";
}

function logMessage(
    msg: Message,
    commandRan: boolean,
    webhookUsed: boolean,
    commandArgs: string[],
    startTime: number
) {
    if (!(msg.channel instanceof TextChannel)) return;
    let timeStr = `${esc(Color.DarkGrey)}[${time()}]`;
    let channel = `${esc(Color.Yellow)}<#${msg.channel.name}>`;
    let user = `${
        msg.author.bot && msg.author.discriminator == "0000"
            ? esc(Color.Cyan) + `<wh:${idFromName(msg.author.username)}>`
            : esc(Color.BrightCyan) +
              `<${msg.author.username}#${msg.author.discriminator}>`
    }`;
    let contentColor = `${esc(Color.White)}${
        commandRan
            ? esc(Color.BrightGreen)
            : webhookUsed
            ? esc(Color.BrightYellow)
            : ""
    }`;
    let content = `${
        commandRan || webhookUsed
            ? [
                  msg.content.split(" ")[0],
                  commandArgs.length > 0
                      ? esc(Color.White) + commandArgs.join(" ")
                      : "",
              ]
                  .join(" ")
                  .trim()
            : msg.content
    }`;
    let processTime = `${esc(Color.DarkGrey)}<${Date.now() - startTime}ms>`;

    log(
        `${timeStr} ${channel} ${user} ${contentColor}${content} ${processTime}`.replace(
            / {2,}/g,
            " "
        ),
        "chat"
    );
}

client.on("messageCreate", (msg) => {
    if (!(msg.channel instanceof TextChannel)) {
        msg.reply("this mf bot dont support dms get the fuck outta here");
        return;
    }

    let startTime = Date.now();

    let commandId = msg.content.split(" ")[0].substring(COMMAND_PREFIX.length);
    let commandArgs = msg.content.split(" ").slice(1);
    let commandArgString = msg.content.split(" ").slice(1).join(" ");

    let webhookUsed = false;
    if (msg.content.startsWith(WH_PREFIX)) {
        let id = msg.content.split(" ")[0].substring(WH_PREFIX.length);
        let content = msg.content.split(" ").slice(1).join(" ");
        if (hooks.get(id)) {
            webhookUsed = true;
            sendWebhook(id, content, msg.channel);
            msg.delete();
        }
    }

    let commandRan = false;
    if (msg.content.startsWith(COMMAND_PREFIX)) {
        let command = commands.find((cmd) => cmd.id == commandId);
        if (command) {
            commandRan = true;
            command.execute(commandArgs, msg);
        }
    }

    logMessage(msg, commandRan, webhookUsed, commandArgs, startTime);
});

let commands: Collection<string, FlapsCommand> = new Collection();

log("Reading commands...", "start");

readdir(__dirname + "/commands", {
    withFileTypes: true,
}).then(async (files) => {
    log("Parsing commands...", "start");
    let fileNames = files.map((file) => file.name.split(".")[0]);
    for (const file of fileNames) {
        let command = require("./commands/" + file) as FlapsCommand;
        commands.set(command.id, command);
    }

    log("Loading webhook bots...", "start");
    updateUsers().then(() => {
        log("Logging in...", "start");
        client.login(process.env.DISCORD_TOKEN || "NoTokenProvided");
    });
});
