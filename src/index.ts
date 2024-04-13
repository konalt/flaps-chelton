import { Color, esc, getMessageLog, log } from "./lib/logger";
import { config } from "dotenv";
log("Loading settings...", "start");
config();
log("Importing modules...", "start");
import {
    ActivityType,
    Attachment,
    CategoryChannel,
    Client,
    Collection,
    Guild,
    GuildMember,
    Message,
    Partials,
    TextBasedChannel,
    TextChannel,
} from "discord.js";
import { readFile, readdir, writeFile } from "fs/promises";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { hooks, sendWebhook, updateUsers } from "./lib/webhooks";
import {
    AutoStatusInfo,
    CommandResponseType,
    FlapsCommand,
    FlapsCommandResponse,
    FlapsMessageSource,
} from "./types";
import { downloadPromise } from "./lib/download";
import {
    convertWebpAttachmentToPng,
    getFileExt,
    getTypes,
    getTypeSingular,
    makeMessageResp,
    scheduleDelete,
    uuidv4,
} from "./lib/utils";
import { registerFont } from "canvas";
import fetch from "node-fetch";
import { getVideoDimensions } from "./lib/ffmpeg/getVideoDimensions";
import {
    AudioPlayer,
    createAudioPlayer,
    DiscordGatewayAdapterCreator,
    joinVoiceChannel,
    NoSubscriberBehavior,
    VoiceConnection,
} from "@discordjs/voice";
import { contentType, lookup } from "mime-types";
import initializeWebServer from "./lib/web";
import { file } from "./lib/ffmpeg/ffmpeg";
import filestreamServer from "./lib/filestreamserver";

log("Initializing client...", "start");
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

const COMMAND_PREFIX = process.env.COMMAND_PREFIX;
const WH_PREFIX = process.env.WEBHOOK_PREFIX;

function autoReact(msg: Message) {
    let f: string[] = [];
    for (const [flagName, triggers] of Object.entries(flags)) {
        for (const trigger of triggers) {
            if (f.includes(flagName)) break;
            if (msg.content.toLowerCase().includes(trigger)) f.push(flagName);
        }
    }
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
    if (f.includes("copper") && !msg.author.bot) {
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
    return new Promise(async (resolve, reject) => {
        async function l2(msg: Message) {
            var atts = msg.attachments.first(types.length);
            var attTypes = getTypes(atts);
            let newAtts: [FlapsMessageSource, Buffer][] = [];
            let n = 0;
            for (const type of attTypes) {
                if (type == "webp") {
                    let attachment = await convertWebpAttachmentToPng(atts[n]);
                    newAtts.push([
                        {
                            width: atts[n].width,
                            height: atts[n].height,
                            fileExt: "png",
                        },
                        attachment,
                    ]);
                } else {
                    let buf = await downloadPromise(atts[n].url);
                    newAtts.push([
                        {
                            width: atts[n].width,
                            height: atts[n].height,
                            fileExt: getFileExt(atts[n].url),
                        },
                        buf,
                    ]);
                }
                n++;
            }
            attTypes = attTypes.map((t) => (t == "webp" ? "image" : t));
            if (!atts[0] && !types[0].endsWith("?")) {
                if (msg.content.startsWith("https://tenor.com/")) {
                    var type = "gif";
                    if (typesMatch([type], types)) {
                        tenorURLToGifURL(msg.content).then((url) => {
                            var id = uuidv4().replace(/-/gi, "");
                            downloadPromise(
                                url,
                                "images/cache/" + id + ".gif"
                            ).then(async (buffer) => {
                                var name = "images/cache/" + id + ".gif";
                                var dimensions = await getVideoDimensions([
                                    buffer,
                                    name,
                                ]);
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
                            async (buffer) => {
                                var dimensions = await getVideoDimensions([
                                    buffer,
                                    ext,
                                ]);
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
                var ids = newAtts.map(() => uuidv4().replace(/-/gi, ""));
                var exts = newAtts.map((att) => "." + att[0].fileExt);
                var proms = newAtts.map((att, i) =>
                    writeFile("images/cache/" + ids[i] + exts[i], att[1])
                );
                Promise.all(proms).then(() => {
                    resolve(
                        newAtts.map((att, i) => [
                            att,
                            "images/cache/" + ids[i] + exts[i],
                        ])
                    );
                });
            }
        }
        if (!msg.attachments.first() && !types[0].endsWith("?")) {
            if (!msg.reference) {
                const channel = await client.channels.fetch(msg.channel.id);
                if (!(channel instanceof TextChannel)) {
                    return reject("No source found");
                }
                const messages = await channel.messages.fetch({
                    limit: 10,
                    before: msg.id,
                });
                const filteredMessages = messages.filter(
                    (m) => m.author.id == msg.author.id
                );
                const lastMessage = filteredMessages.first(2)[1];
                if (!lastMessage) {
                    reject("No source found");
                } else {
                    l2(lastMessage);
                }
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
    if (!(msg.channel instanceof TextChannel)) {
        msg.reply("this mf bot dont support dms get the fuck outta here");
        return;
    }

    log(getMessageLog(msg), "chat");

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
            if (getUnmidnightedUsers().length == 0) {
                clearTimeout(midnightTimeout);
                finishMidnight();
            }
        }
    }

    if (msg.content.startsWith(WH_PREFIX)) {
        let id = msg.content
            .split(" ")[0]
            .substring(WH_PREFIX.length)
            .toLowerCase();
        let content = msg.content.split(" ").slice(1).join(" ");
        if (hooks.get(id)) {
            sendWebhook(id, content, msg.channel);
            msg.delete();
        }
    } else {
        autoReact(msg);
    }

    let commandRan = false;
    let commandFiles = [];
    if (msg.content.startsWith(COMMAND_PREFIX)) {
        let commandChain: [string, string[]][] = msg.content
            .split("==>")
            .map((cmdtxt) => [
                cmdtxt.trim().split(" ")[0].substring(COMMAND_PREFIX.length),
                cmdtxt.trim().split(" ").slice(1),
            ]);
        let defatts: Collection<string, Attachment> = msg.attachments;
        let lastresp: FlapsCommandResponse = makeMessageResp(
            "flapserrors",
            "Command did not return a FlapsCommandResponse."
        );
        let index = 0;
        for (const info of commandChain) {
            let commandId = info[0].toLowerCase();
            let commandArgs = info[1];
            let isLast = index == commandChain.length - 1;

            let command = commands.find((cmd) =>
                cmd.aliases.includes(commandId.toLowerCase())
            );

            if (command) {
                log(
                    `${
                        commandChain.length > 1
                            ? `${esc(Color.BrightBlue)}(${index + 1}/${
                                  commandChain.length
                              }) ${esc(Color.White)}`
                            : ""
                    }Running command ${esc(Color.BrightCyan)}${commandId}`,
                    "cmd"
                );
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
                            channel: msg.channel,
                            author: msg.author,
                        } as Message,
                        command.needs
                    ).catch((e) => sendWebhook("flaps", e, msg.channel));
                    if (!srcs) return;
                    let bufs: [Buffer, string][] = await Promise.all(
                        srcs.map(async (s) => [
                            await readFile(s),
                            getFileExt(s),
                        ])
                    );
                    for (const src of srcs) {
                        commandFiles.push([src, 5]);
                    }
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
                                commandFiles.push([
                                    file("cache/" + response.filename),
                                    isLast &&
                                    response.buffer.byteLength > 25 * 1.049e6
                                        ? 21600
                                        : 5,
                                ]);
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
                                commandFiles.push([
                                    file("cache/" + response.filename),
                                    isLast &&
                                    response.buffer.byteLength > 25 * 1.049e6
                                        ? 21600
                                        : 5,
                                ]);
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
            index++;
        }

        if (commandRan) {
            sendWebhook(
                lastresp.id,
                lastresp.content,
                msg.channel,
                lastresp.buffer,
                lastresp.filename
            );
            for (const file of commandFiles) {
                scheduleDelete(file[0], file[1]);
            }
        }
    }
}

// fuck you node
process.on("unhandledRejection", (reason: any, p) => {
    log(
        `unhandled rejection. reason: ${esc(Color.BrightRed)}${reason.stack}`,
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

function loadAutoStatus() {
    return new Promise<void>(async (resolve, reject) => {
        let autoStatus: Record<string, AutoStatusInfo> = JSON.parse(
            (await readFile("autostatus.json")).toString()
        );
        client.on("presenceUpdate", async (oldPresence, newPresence) => {
            if (newPresence.guild.id !== process.env.MAIN_GUILD) return;
            if (!Object.keys(autoStatus).includes(newPresence.userId)) return;
            log(
                `User ${newPresence.user.username} is now ${
                    newPresence.status
                } (desktop ${newPresence.clientStatus.desktop || "offline"})`,
                `presence`
            );
            let status = autoStatus[newPresence.userId];
            let lastStatus = oldPresence ? oldPresence.status : "offline";
            if (
                lastStatus == "online" ||
                lastStatus == "dnd" ||
                lastStatus == "idle"
            )
                return; // dont wanna alert people too much
            if (newPresence.clientStatus.desktop === "online") {
                let channel = await client.channels.fetch(status.channel);
                if (channel instanceof TextChannel) {
                    sendWebhook(status.webhook, status.text, channel);
                } else {
                    console.log(
                        "Auto Status for userId " +
                            newPresence.userId +
                            " has an invalid channel ID"
                    );
                }
            }
        });
        resolve();
    });
}

export let commands: Collection<string, FlapsCommand> = new Collection();
let flags: Record<string, string[]> = {};

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
registerFont("fonts/fancy.otf", { family: "Fancy", weight: "400" });
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

let midnightReqUsers = [];
let midnightChannel: TextChannel;

let midnightStartText = process.env.MIDNIGHT_START_MESSAGE ?? "midnight";
let midnightFinishSuccessText =
    process.env.MIDNIGHT_GOOD_MESSAGE ??
    "good job everyone. another great day.";
let midnightFinishFailureText =
    process.env.MIDNIGHT_BAD_MESSAGE ?? "$pings$. THIS WILL NOT GO UNPUNISHED";

function finishMidnight() {
    var nonusers = getUnmidnightedUsers();
    let pings = "";

    if (nonusers.length >= 2) {
        for (const nonuser of nonusers.slice(0, -1)) {
            pings += "<@" + nonuser.id + "> ";
        }
        pings += "and <@" + nonusers.at(-1) + ">";
    } else if (nonusers.length > 0) {
        pings = "<@" + nonusers[0] + ">";
    }
    pings = pings.trimEnd();
    let pluralUpper = nonusers.length > 1 ? "S" : "";
    let pluralLower = pluralUpper.toLowerCase();
    if (nonusers.length > 0) {
        sendWebhook(
            "flaps",
            midnightFinishFailureText
                .replace(/\$pings\$/g, pings)
                .replace(/\$pluralUpper\$/g, pluralUpper)
                .replace(/\$pluralLower\$/g, pluralLower),
            midnightChannel
        );
    } else {
        sendWebhook("flaps", midnightFinishSuccessText, midnightChannel);
    }
    isMidnightActive = false;
    doneUsers = [];
}

function getUnmidnightedUsers() {
    return midnightReqUsers.filter((x) => !doneUsers.includes(x));
}

let midnightTimeout: NodeJS.Timeout;
export async function midnight(channel: TextChannel) {
    sendWebhook("flaps", midnightStartText, channel);
    var members = await channel.guild.members.fetch();
    var usersRequired: string[] = [];
    for (const member of members) {
        if (member[1].presence && !member[1].user.bot) {
            if (
                member[1].presence.status == "online" ||
                member[1].presence.status == "dnd"
            ) {
                usersRequired.push(member[0]);
            }
        }
    }
    midnightReqUsers = usersRequired;
    midnightChannel = channel;
    isMidnightActive = true;
    if (midnightTimeout) clearTimeout(midnightTimeout);
    midnightTimeout = setTimeout(() => {
        finishMidnight();
    }, 60 * 1000); // 1 min
}

export let [addBuffer, removeBuffer, addBufferSequence] = [
    (buffer: Buffer, ext: string) => {
        return "null";
    },
    (string: string) => {
        return;
    },
    (buffer: Buffer[], ext: string) => {
        return "null";
    },
];

log("Loading commands...", "start");
readCommandDir(__dirname + "/commands").then(() => {
    log("Loading autoreact flags...", "start");
    readFile("flags.txt", { encoding: "utf-8" }).then(async (flagtext) => {
        for (const line of flagtext.split("\n")) {
            let flagName = line.split(" ")[0];
            if (!flags[flagName]) flags[flagName] = [];
            flags[flagName].push(line.split(" ").slice(1).join(" "));
        }
        log("Loading autostatus messages...", "start");
        await loadAutoStatus();
        updateUsers().then(async () => {
            log("Starting filestream server...", "start");
            [addBuffer, removeBuffer, addBufferSequence] =
                await filestreamServer();
            setInterval(() => {
                var d = new Date();
                if (
                    d.getMinutes() == 0 &&
                    d.getHours() == 0 &&
                    d.getSeconds() < 1
                ) {
                    midnight(
                        client.channels.cache.get(
                            process.env.MAIN_CHANNEL
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
                            process.env.MAIN_CHANNEL
                        ) as TextBasedChannel
                    );
                }
                if (Math.random() < 1 / 100000) {
                    sendWebhook(
                        "nick",
                        "pills here",
                        client.channels.cache.get(
                            process.env.MAIN_CHANNEL
                        ) as TextBasedChannel
                    );
                }
                if (
                    d.getMinutes() == 33 &&
                    d.getHours() == 23 &&
                    d.getFullYear() == 2033 &&
                    d.getMonth() == 2 &&
                    d.getDate() == 3 &&
                    d.getSeconds() < 1
                ) {
                    sendWebhook(
                        "nick",
                        "@everyone R.I.P. FUNKY TOWN\n IT'S 3/3/33 23:33 THO YA FUCKIN DONGS!!!!!",
                        client.channels.cache.get(
                            process.env.MAIN_CHANNEL
                        ) as TextBasedChannel
                    );
                }
            }, 1000);
            log("Starting web server...", "start");
            initializeWebServer().then(() => {
                log("Logging in...", "start");
                client
                    .login(process.env.DISCORD_TOKEN || "NoTokenProvided")
                    .catch((e) => {
                        console.log(e);
                    });
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
