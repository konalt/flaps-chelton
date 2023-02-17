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

log("Loading settings...", "start");
config();

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
        "DirectMessages",
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

function autoReact(msg: Message) {
    let f: string[] = [];
    flags.forEach((val, key) => {
        if (msg.content.toLowerCase().includes(val) && !f.includes(key))
            f.push(key);
    });
    if (f.includes("rember")) {
        f = f.filter((x) => x != "forgor");
    }
    if (f.includes("political"))
        msg.react(
            client.emojis.cache.find((emoji) => emoji.name === "political")
        );
    if (f.includes("forgor")) msg.react("💀");
    if (f.includes("rember")) msg.react("😁");
    if (f.includes("trans")) msg.react("🏳️‍⚧️");
    if (f.includes("literally"))
        msg.react(
            client.emojis.cache.find((emoji) => emoji.name === "literally1984")
        );
    if (f.includes("bone"))
        msg.react(
            client.emojis.cache.find(
                (emoji) => emoji.name === "BAD_TO_THE_BONE"
            )
        );
    if (f.includes("selfie")) {
        if (Math.random() > 0.5) {
            msg.react("👍");
        } else {
            msg.react("👎");
        }
    }
    if (f.includes("hello"))
        msg.react(
            client.emojis.cache.find(
                (emoji) => emoji.name === "828274359076126760"
            )
        );
    if (f.includes("copper")) {
        sendWebhook("flaps", "copper you say?", msg.channel as TextChannel);
    }
}

client.on("messageCreate", (msg) => {
    if (msg.author.bot) return;
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
    } else {
        autoReact(msg);
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
let flags: Collection<string, string> = new Collection();

log("Loading commands...", "start");
readdir(__dirname + "/commands", {
    withFileTypes: true,
}).then(async (files) => {
    let fileNames = files.map((file) => file.name.split(".")[0]);
    for (const file of fileNames) {
        let command = require("./commands/" + file) as FlapsCommand;
        commands.set(command.id, command);
    }

    log("Loading autoreact flags...", "start");
    readFile("flags.txt", { encoding: "utf-8" }).then((flagtext) => {
        for (const line of flagtext.split("\n")) {
            flags.set(line.split(" ")[1], line.split(" ")[0]);
        }
        updateUsers().then(() => {
            log("Logging in...", "start");
            client.login(process.env.DISCORD_TOKEN || "NoTokenProvided");
        });
    });
});
