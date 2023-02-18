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
import { downloadPromise } from "./lib/download";
import { uuidv4 } from "./lib/utils";
import { registerFont } from "canvas";
import fetch from "node-fetch";
import { getVideoDimensions } from "./lib/ffmpeg/getVideoDimensions";

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

    client.user.setPresence({
        activities: [
            {
                name: "commands!",
                type: ActivityType.Listening,
                url: "https://konalt.us.to/g",
            },
        ],
        afk: true,
        status: "online",
    });

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
            setTimeout(() => {
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
            }, 3000);
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

var types = {
    image: ["image/png", "image/jpeg", "image/webp"],
    video: ["video/mp4", "video/x-matroska"],
    text: ["text/plain"],
    json: ["application/json"],
    gif: ["image/gif"],
    audio: ["audio/mpeg", "audio/aac"],
};

function getTypeSingular(ct) {
    var type = "unknown";
    Object.entries(types).forEach((a) => {
        if (a[1].includes(ct)) type = a[0];
    });
    return type;
}

function getTypes(atts) {
    return atts.map((att) => {
        var ct = att.contentType;
        var type = "unknown";
        Object.entries(types).forEach((a) => {
            if (a[1].includes(ct)) type = a[0];
        });
        return type;
    });
}

function typesMatch(inTypes, requiredTypes) {
    var ok = true;
    requiredTypes.forEach((type, i) => {
        var typelist = type.split("/");
        if (!typelist.includes(inTypes[i])) ok = false;
    });
    return ok;
}

function tenorURLToGifURL(url: string): Promise<string> {
    var searchString = '<meta class="dynamic" name="twitter:image" content="';
    return new Promise((resl) => {
        fetch(url)
            .then((r) => r.text())
            .then((data) => {
                var newURL = data
                    .substring(data.indexOf(searchString) + searchString.length)
                    .split('"')[0];
                resl(newURL);
            });
    });
}

function getSourcesWithAttachments(msg, types) {
    return new Promise((resolve, reject) => {
        function l2(msg) {
            var atts = msg.attachments.first(types.length);
            var attTypes = getTypes(atts);
            if (!atts[0]) {
                if (msg.content.startsWith("https://tenor.com/")) {
                    var type = "gif";
                    if (typesMatch([type], types)) {
                        tenorURLToGifURL(msg.content).then((url) => {
                            var id = uuidv4().replace(/-/gi, "");
                            downloadPromise(
                                url,
                                "images/cache/" + id + "." + ext
                            ).then(async () => {
                                var name = "images/cache/" + id + ".gif";
                                var dimensions = await getVideoDimensions(name);
                                resolve([
                                    [
                                        {
                                            width: 0, //dimensions[0],
                                            height: 0, //dimensions[1],
                                        },
                                        id + ".gif",
                                    ],
                                ]);
                            });
                        });
                    } else {
                        reject(
                            "Type Error (Attempted Tenor):\n" +
                                getTypeMessage(["gif"], types)
                        );
                    }
                } else if (
                    msg.content.startsWith("https://cdn.discordapp.com/") ||
                    msg.content.startsWith("https://media.discordapp.net/")
                ) {
                    var filename = msg.content.split(" ")[0].split("/")[
                        msg.content.split("/").length - 1
                    ];
                    var type = getTypeSingular(lookup(filename));
                    var ext =
                        filename.split(".")[filename.split(".").length - 1];
                    if (typesMatch([type], types)) {
                        var id = uuidv4().replace(/-/gi, "");
                        var npath = id + "." + ext;
                        var zpath = "images/cache/" + npath;
                        downloadPromise(msg.content.split(" ")[0], zpath).then(
                            async () => {
                                var dimensions = await getVideoDimensions(
                                    zpath
                                );
                                resolve([
                                    [
                                        {
                                            width: dimensions[0],
                                            height: dimensions[1],
                                        },
                                        npath,
                                    ],
                                ]);
                            }
                        );
                    } else {
                        reject(
                            "Type Error (Attempted Discord):\n" +
                                getTypeMessage(["gif"], types)
                        );
                    }
                } else {
                    reject("No source found (content:" + msg.content + ")");
                }
            } else if (!typesMatch(attTypes, types)) {
                reject("Type Error:\n" + getTypeMessage(attTypes, types));
            } else {
                var ids = atts.map(() => uuidv4().replace(/-/gi, ""));
                var exts = atts.map((att) => "." + att.url.split(".").pop());
                var proms = atts.map((att, i) =>
                    downloadPromise(att.url, "images/cache/" + ids[i] + exts[i])
                );
                Promise.all(proms).then(() => {
                    resolve(
                        atts.map((att, i) => [
                            att,
                            "images/cache/" + ids[i] + exts[i],
                        ])
                    );
                });
            }
        }
        if (!msg.attachments.first()) {
            if (!msg.reference) {
                reject("No source found");
            } else {
                msg.fetchReference().then((ref) => {
                    l2(ref);
                });
            }
        } else {
            l2(msg);
        }
    });
}

function getSources(msg, types) {
    return new Promise((resolve, reject) => {
        getSourcesWithAttachments(msg, types)
            .then((data: string[]) => {
                resolve(data.map((x) => x[1]));
            })
            .catch((r) => {
                reject(r);
            });
    });
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
        let command = commands.find((cmd) => cmd.aliases.includes(commandId));
        if (command) {
            commandRan = true;
            if (command.needs && command.needs.length > 0) {
                getSources(msg, command.needs).then(async (srcs: string[]) => {
                    let bufs: [Buffer, string][] = await Promise.all(
                        srcs.map(async (s) => [await readFile(s), s])
                    );
                    command.execute(commandArgs, bufs, msg);
                });
            } else {
                command.execute(commandArgs, null, msg);
            }
        }
    }

    logMessage(msg, commandRan, webhookUsed, commandArgs, startTime);
});

let commands: Collection<string, FlapsCommand> = new Collection();
let flags: Collection<string, string> = new Collection();

log("Loading fonts...", "start");
registerFont("fonts/dog.otf", { family: "Fuckedup" });
registerFont("fonts/homodog.otf", { family: "Homodog" });
registerFont("fonts/weezer.otf", { family: "Weezer" });
registerFont("fonts/futura.otf", {
    family: "Futura",
    weight: "400",
});
registerFont("fonts/vcr.ttf", {
    family: "VCR OSD Mono",
    weight: "400",
});
registerFont("fonts/tate.ttf", { family: "Tate" });
registerFont("fonts/spotify.otf", { family: "Spotify" });
registerFont("fonts/arial.ttf", { family: "Arial" });

log("Loading commands...", "start");
readdir(__dirname + "/commands", {
    withFileTypes: true,
}).then(async (files) => {
    let fileNames = files.map((file) => file.name.split(".")[0]);
    for (const file of fileNames) {
        let command = require("./commands/" + file) as FlapsCommand;
        if (typeof command.aliases === "undefined") command.aliases = [];
        command.aliases.push(command.id);
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
function getTypeMessage(arg0: string[], types: any) {
    throw new Error("Function not implemented.");
}

function lookup(filename: any): any {
    throw new Error("Function not implemented.");
}
