import { Color, esc, log } from "./lib/logger";
import { config } from "dotenv";
log("Loading settings...", "start");
config();
import {
    ActivityType,
    Attachment,
    Client,
    Collection,
    Message,
    Partials,
    PresenceData,
    TextBasedChannel,
    TextChannel,
} from "discord.js";
import { readFile, readdir, writeFile } from "fs/promises";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { hooks, sendWebhook, updateUsers } from "./lib/webhooks";
import {
    CommandResponseType,
    FlapsCommand,
    FlapsCommandResponse,
    WebhookBot,
} from "./types";
import { downloadPromise } from "./lib/download";
import {
    getFunctionName,
    getTypes,
    getTypeSingular,
    makeMessageResp,
    time,
    uuidv4,
} from "./lib/utils";
import { registerFont } from "canvas";
import fetch from "node-fetch";
import { getVideoDimensions } from "./lib/ffmpeg/getVideoDimensions";
import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    DiscordGatewayAdapterCreator,
    joinVoiceChannel,
    NoSubscriberBehavior,
    VoiceConnection,
} from "@discordjs/voice";
import { contentType, lookup } from "mime-types";
import initializeWebServer from "./lib/web";
import { file } from "./lib/ffmpeg/ffmpeg";

export const client: Client = new Client({
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

export const voiceConnections: Collection<string, VoiceConnection> =
    new Collection();
export const voicePlayers: Collection<string, AudioPlayer> = new Collection();

client.on("ready", async () => {
    log("Logged in, entering voice...", "start");
    let gs = await client.guilds.fetch();
    for (const [guildi, guildp] of gs) {
        let guild = await guildp.fetch();
        let vc = guild.channels.cache.find((c) => c.isVoiceBased());
        if (!vc) continue;
        let conn = joinVoiceChannel({
            channelId: vc.id,
            guildId: guildi,
            adapterCreator:
                guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
        });
        let ply = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        });
        conn.subscribe(ply);
        voicePlayers.set(guildi, ply);
        voiceConnections.set(guildi, conn);
    }
    log(`${esc(Color.BrightGreen)}Listening for commands!`, "start");

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
        `${channel} ${user} ${contentColor}${content} ${processTime}`.replace(
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

function typesMatch(inTypes: string[], requiredTypes: string[]) {
    var ok = true;
    requiredTypes.forEach((type, i) => {
        var typelist = type.split("/");
        if (!typelist.includes(inTypes[i]) && !type.endsWith("?")) ok = false;
    });
    return ok;
}

function tenorURLToGifURL(url: string): Promise<string> {
    var searchString = '<meta class="dynamic" name="twitter:image" content="';
    return new Promise((resl) => {
        /* @ts-ignore */
        fetch(url).then((value: Response) => {
            value.text().then((data) => {
                var newURL = data
                    .substring(data.indexOf(searchString) + searchString.length)
                    .split('"')[0];
                resl(newURL);
            });
        });
    });
}

function getSourcesWithAttachments(msg: Message, types: string[]) {
    return new Promise((resolve, reject) => {
        function l2(msg: Message) {
            var atts = msg.attachments.first(types.length);
            var attTypes = getTypes(atts);
            if (!atts[0] && !types[0].endsWith("?")) {
                if (msg.content.startsWith("https://tenor.com/")) {
                    var type = "gif";
                    if (typesMatch([type], types)) {
                        tenorURLToGifURL(msg.content).then((url) => {
                            var id = uuidv4().replace(/-/gi, "");
                            downloadPromise(
                                url,
                                "images/cache/" + id + ".gif"
                            ).then(async () => {
                                var name = "images/cache/" + id + ".gif";
                                var dimensions = await getVideoDimensions(name);
                                resolve([
                                    [
                                        {
                                            width: dimensions[0],
                                            height: dimensions[1],
                                        },
                                        name,
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
                    var type = getTypeSingular(lookup(filename) || "unknown");
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
                                        zpath,
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
        if (!msg.attachments.first() && !types[0].endsWith("?")) {
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

function getSources(msg: Message, types: string[]): Promise<string[]> {
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

let errorChannel: TextBasedChannel;

export async function onMessage(msg: Message) {
    if (msg.author.bot) return;
    if (!(msg.channel instanceof TextChannel)) {
        msg.reply("this mf bot dont support dms get the fuck outta here");
        return;
    }

    let startTime = Date.now();

    let commandId = msg.content.split(" ")[0].substring(COMMAND_PREFIX.length);
    let commandArgs = msg.content.split(" ").slice(1);
    let commandArgString = msg.content.split(" ").slice(1).join(" ");

    if (isMidnightActive) {
        var mem = await msg.guild.members.fetch(msg.member);
        if (
            msg.content.toLowerCase().includes(midnightText) &&
            isMidnightActive &&
            !msg.author.bot &&
            !doneUsers.includes(mem.id)
        ) {
            doneUsers.push(mem.id);
            msg.react("👍");
        }
    }

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
        let commandChain: [string, string[]][] = msg.content
            .split("==>")
            .map((cmdtxt) => [
                cmdtxt.trim().split(" ")[0].substring(COMMAND_PREFIX.length),
                cmdtxt.trim().split(" ").slice(1),
            ]);
        console.log(commandChain);
        let defatts: Collection<string, Attachment> = msg.attachments;
        let lastresp: FlapsCommandResponse = makeMessageResp(
            "flapserrors",
            "Command did not return a FlapsCommandResponse."
        );
        for (const info of commandChain) {
            let commandId = info[0].toLowerCase();
            let commandArgs = info[1];

            let command = commands.find((cmd) =>
                cmd.aliases.includes(commandId.toLowerCase())
            );

            if (command) {
                if (commandId !== "retry") {
                    let retryables = JSON.parse(
                        (await readFile("retrycache.json")).toString()
                    );
                    if (retryables[msg.author.id] != msg.id) {
                        retryables[msg.author.id] = msg.id;
                        await writeFile(
                            "retrycache.json",
                            JSON.stringify(retryables)
                        );
                    }
                }
                commandRan = true;
                errorChannel = msg.channel;

                if (command.needs && command.needs.length > 0) {
                    let srcs = await getSources(
                        {
                            attachments: defatts,
                            reference: msg.reference,
                            fetchReference: msg.fetchReference,
                            client: client,
                        } as Message,
                        command.needs
                    ).catch((e) => sendWebhook("flaps", e, msg.channel));
                    if (!srcs) return;
                    let bufs: [Buffer, string][] = await Promise.all(
                        srcs.map(async (s) => [await readFile(s), s])
                    );
                    let response = await command.execute(
                        commandArgs,
                        bufs,
                        msg
                    );
                    switch (response.type) {
                        case CommandResponseType.Message:
                            if (response.filename) {
                                writeFileSync(
                                    file("cache/" + response.filename),
                                    response.buffer
                                );
                                defatts = new Collection();
                                defatts.set("0", {
                                    url:
                                        "https://flaps.us.to/cache/" +
                                        response.filename,
                                    contentType: contentType(response.filename),
                                } as Attachment);
                            }
                            lastresp = response;
                            break;
                    }
                } else {
                    let response = await command.execute(
                        commandArgs,
                        null,
                        msg
                    );
                    switch (response.type) {
                        case CommandResponseType.Message:
                            if (response.filename) {
                                writeFileSync(
                                    file("cache/" + response.filename),
                                    response.buffer
                                );
                                defatts = new Collection();
                                defatts.set("0", {
                                    url:
                                        "https://flaps.us.to/cache/" +
                                        response.filename,
                                    contentType: contentType(response.filename),
                                } as Attachment);
                            }
                            lastresp = response;
                            break;
                    }
                }
            }
        }

        if (commandRan)
            sendWebhook(
                lastresp.id,
                lastresp.content,
                msg.channel,
                lastresp.buffer,
                lastresp.filename
            );
    }

    logMessage(msg, commandRan, webhookUsed, commandArgs, startTime);
    if (commandRan) {
        log(`Running command ${esc(Color.BrightCyan)}${commandId}`, "cmd");
    }
}

// fuck you node
process.on("unhandledRejection", (reason: any, p) => {
    log(
        `unhandled rejection. reason: ${esc(Color.BrightRed)}${reason}`,
        "promise"
    );
    if (!errorChannel) return;
    sendWebhook(
        "flapserrors",
        `Unhandled promise rejection.\nReason: \`${reason.stack}\``,
        errorChannel
    );
});

client.on("messageCreate", onMessage);

export let commands: Collection<string, FlapsCommand> = new Collection();
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
registerFont("fonts/ibmplex.otf", { family: "IBM Plex Sans", weight: "400" });
registerFont("fonts/helvetica.ttf", { family: "Helvetica" });

async function readCommandDir(dir: string) {
    const files = await readdir(dir, {
        withFileTypes: true,
    });
    for (const file of files) {
        if (file.isDirectory()) {
            await readCommandDir(dir + "/" + file.name);
        } else {
            let command = require(dir +
                "/" +
                file.name.split(".")[0]) as FlapsCommand;
            if (typeof command.aliases === "undefined") command.aliases = [];
            command.aliases.push(command.id);
            commands.set(command.id, command);
        }
    }
}

var doneUsers = [];
var isMidnightActive = false;
var midnightText = "midnight";
export async function midnight(channel: TextChannel) {
    sendWebhook("flaps", "midnight", channel);
    var members = await channel.guild.members.fetch();
    var usersRequired = [];
    for (const member of members) {
        if (member[1].presence && !member[1].user.bot) {
            if (member[1].presence.status != "offline") {
                usersRequired.push(member[0]);
            }
        }
    }
    isMidnightActive = true;
    setTimeout(() => {
        var nonusers = usersRequired.filter((x) => !doneUsers.includes(x));
        if (nonusers.length > 0) {
            sendWebhook(
                "flaps",
                "<@" +
                    nonusers.join(">, <@") +
                    ">" +
                    ". YOU FUCKER" +
                    (nonusers.length > 1 ? "S" : "") +
                    ". YOU MISS THE MIDNIGH !!!!",
                channel
            );
        } else {
            sendWebhook(
                "flaps",
                "good job everyone. another great day.",
                channel
            );
        }
        isMidnightActive = false;
        doneUsers = [];
    }, 60 * 1000); // 1 min
}

log("Loading commands...", "start");
readCommandDir(__dirname + "/commands").then(() => {
    log("Loading autoreact flags...", "start");
    readFile("flags.txt", { encoding: "utf-8" }).then((flagtext) => {
        for (const line of flagtext.split("\n")) {
            flags.set(line.split(" ")[1], line.split(" ")[0]);
        }
        updateUsers().then(() => {
            log("Starting web server...", "start");
            setInterval(() => {
                var d = new Date();
                if (
                    d.getMinutes() == 0 &&
                    d.getHours() == 0 &&
                    d.getSeconds() < 1
                ) {
                    midnight(
                        client.channels.cache.get(
                            "882743320554643476"
                        ) as TextChannel
                    );
                }
                if (!existsSync("scal_allowtime.txt"))
                    writeFileSync("scal_allowtime.txt", "no");
                if (
                    d.getMinutes() == 39 &&
                    d.getSeconds() < 1 &&
                    readFileSync("scal_allowtime.txt").toString() == "yes"
                ) {
                    writeFileSync("scal_allowtime.txt", "no");
                    sendWebhook(
                        "scal",
                        "TIME\nHAHAHAHH",
                        client.channels.cache.get(
                            "882743320554643476"
                        ) as TextBasedChannel
                    );
                }
                if (Math.random() < 1 / 100000) {
                    sendWebhook(
                        "nick",
                        "pills here",
                        client.channels.cache.get(
                            "882743320554643476"
                        ) as TextBasedChannel
                    );
                }
            }, 1000);
            initializeWebServer().then(() => {
                log("Logging in...", "start");
                client.login(process.env.DISCORD_TOKEN || "NoTokenProvided");
            });
        });
    });
});
function getTypeMessage(inTypes: string[], reqTypes: string[]) {
    var maxWidthIn = inTypes.reduce((a, b) =>
        a.length > b.length ? a : b
    ).length;
    if (maxWidthIn < "SUPPLIED".length) maxWidthIn = "SUPPLIED".length;
    var maxWidthReq = reqTypes.reduce((a, b) =>
        a.length > b.length ? a : b
    ).length;
    if (maxWidthReq < "REQUIRED".length) maxWidthReq = "REQUIRED".length;
    var out = [
        [
            "REQUIRED".padEnd(maxWidthReq),
            "SUPPLIED".padEnd(maxWidthIn),
            "STATUS",
        ]
            .join(" | ")
            .trim(),
        ["-".repeat(maxWidthIn + maxWidthReq + 3 + 3 + 6)],
    ];

    reqTypes.forEach((reqType, i) => {
        var inType = inTypes[i];
        var s = [];
        s.push(reqType.padEnd(maxWidthReq, " "));
        s.push(inType.padEnd(maxWidthIn, " "));
        s.push(reqType.split("/").includes(inType) ? "OK" : "ERR");
        out.push(s.join(" | ").trim());
    });
    return "```\n" + out.join("\n") + "\n```";
}
