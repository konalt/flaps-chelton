import { config } from "dotenv";
import { C, getMessageLog, log } from "./lib/logger";
config();
export const VERBOSE = process.env.VERBOSE == "yes";
export const DOMAIN = process.env.DOMAIN;
log(`Importing modules (${C.BCyan}@discordjs/voice${C.White})...`, "start");
import {
    AudioPlayer,
    NoSubscriberBehavior,
    VoiceConnection,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from "@discordjs/voice";
log(`Importing modules (${C.BCyan}canvas${C.White})...`, "start");
import { registerFont } from "canvas";
log(`Importing modules (${C.BCyan}discord.js${C.White})...`, "start");
import {
    ActionRowBuilder,
    ActivityType,
    Attachment,
    ButtonInteraction,
    ChannelType,
    Client,
    Collection,
    Interaction,
    Message,
    Partials,
    TextBasedChannel,
    TextChannel,
    VoiceBasedChannel,
} from "discord.js";
log(`Importing modules (${C.BCyan}fs${C.White})...`, "start");
import { writeFileSync } from "fs";
import { readFile, readdir, writeFile } from "fs/promises";
log(`Importing modules (${C.BCyan}mime-types${C.White})...`, "start");
import { contentType, lookup } from "mime-types";
log(`Importing modules (${C.BCyan}fetch${C.White})...`, "start");
import fetch from "node-fetch";
log(`Importing modules (${C.BCyan}flaps/battle${C.White})...`, "start");
import {
    getBattleAction,
    getBattleImage,
    getComponents,
    handleBattleAction,
} from "./lib/battle";
log(`Importing modules (${C.BCyan}flaps/download${C.White})...`, "start");
import { downloadPromise } from "./lib/download";
log(`Importing modules (${C.BCyan}flaps/ffmpeg${C.White})...`, "start");
import { file } from "./lib/ffmpeg/ffmpeg";
log(`Importing modules (${C.BCyan}flaps/gvd${C.White})...`, "start");
import { getVideoDimensions } from "./lib/ffmpeg/getVideoDimensions";
log(`Importing modules (${C.BCyan}flaps/fsserver${C.White})...`, "start");
import filestreamServer from "./lib/filestreamserver";
log(`Importing modules (${C.BCyan}flaps/tictactoe${C.White})...`, "start");
import {
    createComponentList,
    createMessageContent,
    games,
    makeMove,
} from "./lib/tictactoe";
log(`Importing modules (${C.BCyan}flaps/utils${C.White})...`, "start");
import {
    SPOILERBUG,
    convertWebpAttachmentToPng,
    decodeObject,
    encodeObject,
    exists,
    getFileExt,
    getFileName,
    getTypeSingular,
    getTypes,
    makeMessageResp,
    scheduleDelete,
    uuidv4,
} from "./lib/utils";
log(`Importing modules (${C.BCyan}flaps/web${C.White})...`, "start");
import initializeWebServer from "./lib/web";
log(`Importing modules (${C.BCyan}flaps/webhooks${C.White})...`, "start");
import {
    editWebhookMessage,
    hooks,
    sendWebhook,
    updateUsers,
} from "./lib/webhooks";
log(`Importing modules (${C.BCyan}flaps/types${C.White})...`, "start");
import {
    AutoStatusInfo,
    Battle,
    CommandResponseType,
    FlapsCommand,
    FlapsCommandResponse,
    FlapsMessageSource,
    TicTacToeCell,
} from "./types";

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

function flapsJoinVoiceChannel(channel: VoiceBasedChannel) {
    let connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    let player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
        },
    });
    connection.subscribe(player);
    voicePlayers.set(channel.guildId, player);
    voiceConnections.set(channel.guildId, connection);
}

client.on("voiceStateUpdate", (oldState, newState) => {
    let channel = newState.channel;
    let join = true;
    if (!channel) {
        channel = oldState.channel;
        join = false;
    }
    if (newState.channel && oldState.channel) {
        join = newState.channelId != oldState.channelId;
    }
    let flapsInChannel = channel.members.has(client.user.id);
    if (flapsInChannel && !voiceConnections.has(channel.guildId)) {
        flapsJoinVoiceChannel(channel);
    }
    if (channel.members.size > 0 && !flapsInChannel) {
        flapsJoinVoiceChannel(channel);
    }
    if (channel.members.size == 1 && flapsInChannel) {
        voiceConnections.get(channel.guildId).disconnect();
        voiceConnections.get(channel.guildId).destroy();
        voicePlayers.delete(channel.guildId);
        voiceConnections.delete(channel.guildId);
    }
    if (join && newState.id !== client.user.id) {
        exists(`audio/join/${newState.id}.mp3`).then((ex) => {
            if (!ex) return;
            setTimeout(() => {
                let resource = createAudioResource(
                    `audio/join/${newState.id}.mp3`
                );
                voicePlayers.get(channel.guildId).play(resource);
            }, 1000);
        });
    }
});

client.on("ready", async () => {
    log(`${C.BGreen}Listening for commands!`, "start");

    client.user.setPresence({
        activities: [
            {
                name: "commands!",
                type: ActivityType.Listening,
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
        if (!msg.attachments.first()) {
            if (!msg.reference) {
                if (types[0].endsWith("?")) {
                    l2(msg);
                } else {
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
        if (msg.author.bot) return;
        switch (msg.channel.type) {
            case ChannelType.DM:
                msg.reply("this bot doesnt support dms!");
                break;
            case ChannelType.PublicThread:
            case ChannelType.PrivateThread:
                if (
                    msg.content.startsWith(WH_PREFIX) ||
                    msg.content.startsWith(COMMAND_PREFIX)
                )
                    msg.reply("flaps doesnt work in threads!");
                break;
            default:
                if (
                    msg.content.startsWith(WH_PREFIX) ||
                    msg.content.startsWith(COMMAND_PREFIX)
                )
                    msg.reply("you cant use flaps here!");
                break;
        }

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
            if (msg.attachments.size > 0) {
                let att = msg.attachments.first();
                let type = getFileExt(att.url);
                downloadPromise(att.url).then((buffer) => {
                    sendWebhook(
                        id,
                        content,
                        msg.channel,
                        buffer,
                        getFileName("Proxied_Attachment", type)
                    );
                });
                msg.delete();
            } else {
                sendWebhook(id, content, msg.channel);
                msg.delete();
            }
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
                            ? `${C.BBlue}(${index + 1}/${
                                  commandChain.length
                              }) ${C.White}`
                            : ""
                    }Running command ${C.BCyan}${commandId}`,
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
                                        "https://" +
                                        DOMAIN +
                                        "/cache/" +
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
                                        "https://" +
                                        DOMAIN +
                                        "/cache/" +
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
                lastresp.filename,
                lastresp.components
            );
            for (const file of commandFiles) {
                scheduleDelete(file[0], file[1]);
            }
        }
    }
}

export async function onInteraction(interaction: Interaction) {
    if (interaction instanceof ButtonInteraction) {
        let customID = interaction.customId;
        let interactionType = customID.split("-")[0];
        switch (interactionType) {
            case "ttt":
                let gameID = customID.split("-")[1];
                let [x, y] = customID
                    .split("-")[2]
                    .split("x")
                    .map((x) => parseInt(x));
                let game = games[gameID];
                if (!game) return;
                let player = 0;
                if (interaction.user.id == game.player1.id) player = 1;
                if (interaction.user.id == game.player2.id) player = 2;
                if (player != 0) {
                    if (
                        ((game.nextPlace == TicTacToeCell.X && player == 2) ||
                            (game.nextPlace == TicTacToeCell.O &&
                                player == 1)) &&
                        game.player1.id !== game.player2.id
                    ) {
                        interaction.reply({
                            content: "It is not your turn!",
                            ephemeral: true,
                        });
                    } else {
                        makeMove(x, y, gameID);
                        editWebhookMessage(
                            interaction.message.id,
                            "tictactoe",
                            createMessageContent(game),
                            interaction.message.channel,
                            null,
                            null,
                            createComponentList(game.board, gameID)
                        );
                        interaction.deferUpdate();
                    }
                } else {
                    interaction.reply({
                        content: "You are not playing in this game!",
                        ephemeral: true,
                    });
                }
                break;
            case "battle":
                let battle = decodeObject(
                    interaction.message.content.split("`")[1]
                ) as Battle;
                if (interaction.user.id !== battle.pid) {
                    interaction.reply({
                        content: "This battle is not yours!",
                        ephemeral: true,
                    });
                    return;
                }
                let battleAction = getBattleAction(interaction.customId);
                let updatedBattle = handleBattleAction(battle, battleAction);
                await editWebhookMessage(
                    interaction.message.id,
                    "flaps",
                    `The battle begins!${SPOILERBUG}\`${encodeObject(
                        updatedBattle
                    )}\``,
                    interaction.message.channel,
                    await getBattleImage(battle),
                    getFileName("Battle", "png"),
                    [
                        new ActionRowBuilder().addComponents(
                            getComponents(updatedBattle)
                        ),
                    ]
                );
                interaction.deferUpdate();
                return;
        }
    }
}

// fuck you node
process.on("unhandledRejection", (reason: any, p) => {
    let r = "unknown";
    if (reason.stack) {
        r = reason.stack;
    } else {
        r = reason;
    }

    log(`unhandled rejection. reason: ${C.BRed}${r}`, "promise");
    if (!errorChannel) return;
    sendWebhook(
        "flapserrors",
        `Unhandled promise rejection.\nReason: \`${r}\``,
        errorChannel
    );
});

client.on("messageCreate", onMessage);
client.on("interactionCreate", onInteraction);

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

async function readCommandDir(dir: string) {
    const files = await readdir(dir, {
        withFileTypes: true,
    });
    let ps = [];
    for (const file of files) {
        if (file.isDirectory()) {
            ps.push(readCommandDir(dir + "/" + file.name));
        } else {
            let command = require(dir +
                "/" +
                file.name.split(".")[0]) as FlapsCommand;
            if (typeof command.aliases === "undefined") command.aliases = [];
            command.aliases.push(command.id);
            commands.set(command.id, command);
        }
    }
    await Promise.all(ps);
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
async function init() {
    log("Loading...", "start");
    let loadFonts = new Promise<void>((res) => {
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
        registerFont("fonts/ibmplex.otf", {
            family: "IBM Plex Sans",
            weight: "400",
        });
        registerFont("fonts/fancy.otf", { family: "Fancy", weight: "400" });
        registerFont("fonts/helvetica.ttf", { family: "Helvetica" });
        log("Fonts loaded.", "start");
        res();
    });
    let loadCommands = readCommandDir(__dirname + "/commands").then(() => {
        log("Commands loaded.", "start");
    });
    let loadFlags = readFile("flags.txt", { encoding: "utf-8" }).then(
        async (flagtext) => {
            for (const line of flagtext.split("\n")) {
                let flagName = line.split(" ")[0];
                if (!flags[flagName]) flags[flagName] = [];
                flags[flagName].push(line.split(" ").slice(1).join(" "));
            }
            log("Auto react flags loaded.", "start");
        }
    );
    let loadAutoStatusP = loadAutoStatus().then(() => {
        log("Auto status loaded.", "start");
    });
    let loadUsers = updateUsers().then(() => {
        log("Users loaded.", "start");
    });
    let loadFilestreamServer = filestreamServer().then((d) => {
        [addBuffer, removeBuffer, addBufferSequence] = d;
        log("Filestream server started.", "start");
    });
    let loadWebServer = initializeWebServer().then(() => {
        log("Web server started.", "start");
    });
    setInterval(() => {
        var d = new Date();
        if (d.getMinutes() == 0 && d.getHours() == 0 && d.getSeconds() < 1) {
            midnight(
                client.channels.cache.get(
                    process.env.MAIN_CHANNEL
                ) as TextChannel
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
    await Promise.all([
        loadAutoStatusP,
        loadCommands,
        loadFilestreamServer,
        loadFlags,
        loadFonts,
        loadUsers,
        loadWebServer,
    ]);
    log("Logging in...", "start");
    client.login(process.env.DISCORD_TOKEN || "NoTokenProvided").catch((e) => {
        console.log(e);
    });
}

init();

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
