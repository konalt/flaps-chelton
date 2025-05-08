import { config } from "dotenv";
import { C, getMessageLog, log } from "./lib/logger";
config();
export const VERBOSE = process.env.VERBOSE == "yes";
export const DOMAIN = process.env.DOMAIN;
export const TRACK = process.env.ENABLE_TRACK == "yes";
export const TRACK_SERVER_REPORTS = process.env.TRACK_SERVER_REPORTS.split(",")
    .filter((n) => n.length > 0)
    .map((n) => n.split(":"));
log(`Importing modules (${C.BCyan}@discordjs/voice${C.White})...`, "start");
import {
    AudioPlayer,
    DiscordGatewayAdapterCreator,
    NoSubscriberBehavior,
    VoiceConnection,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from "@discordjs/voice";
log(`Importing modules (${C.BCyan}canvas${C.White})...`, "start");
import { registerFont } from "canvas";
log(`Importing modules (${C.BCyan}child_process${C.White})...`, "start");
import cp from "child_process";
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
    MessageReaction,
    Partials,
    TextBasedChannel,
    TextChannel,
    User,
    VoiceBasedChannel,
} from "discord.js";
log(`Importing modules (${C.BCyan}fs${C.White})...`, "start");
import { readFile, readdir, writeFile } from "fs/promises";
log(`Importing modules (${C.BCyan}mime-types${C.White})...`, "start");
import { contentType, lookup } from "mime-types";
log(`Importing modules (${C.BCyan}flaps/battle${C.White})...`, "start");
import {
    getBattleAction,
    getBattleImage,
    getComponents,
    handleBattleAction,
} from "./lib/battle";
log(`Importing modules (${C.BCyan}flaps/connect4${C.White})...`, "start");
import { handleInteraction } from "./lib/connect4";
log(`Importing modules (${C.BCyan}flaps/download${C.White})...`, "start");
import { downloadPromise } from "./lib/download";
log(`Importing modules (${C.BCyan}flaps/ffmpeg${C.White})...`, "start");
import { ffmpegBuffer, file } from "./lib/ffmpeg/ffmpeg";
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
    tenorURLToGifURL,
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
    TicTacToeCell,
} from "./types";
log(`Importing modules (${C.BCyan}flaps/track${C.White})...`, "start");
import { trackMessage, trackPresence } from "./lib/track";
log(`Importing modules (${C.BCyan}flaps/web3d${C.White})...`, "start");
import { trackReport } from "./lib/web3dapi";

process.title = "Flaps Chelton";

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
        adapterCreator: channel.guild
            .voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
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
                name: "custom",
                type: ActivityType.Custom,
                state: "BACK FROM THE DEAD AND REPORTING FOR DUTY!",
            },
        ],
        afk: false,
        status: "online",
    });

    readFile("saved_status.txt")
        .then((b) => b.toString("utf-8"))
        .then((statusData) => {
            setTimeout(() => {
                client.user.setPresence({
                    activities: [
                        {
                            name: "custom",
                            type: ActivityType.Custom,
                            state: statusData,
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
const WH_EDIT_PREFIX = process.env.WEBHOOK_EDIT_PREFIX;

function autoReact(msg: Message) {
    let f: string[] = [];
    for (const [flagName, triggers] of Object.entries(flags)) {
        for (const trigger of triggers) {
            if (f.includes(flagName)) break;
            if (msg.content.toLowerCase().includes(trigger)) f.push(flagName);
            if (
                msg.attachments.first() &&
                msg.attachments.first().contentType == "image/avif"
            ) {
                f.push("avif");
            }
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
    if (f.includes("bone")) {
        if (f.includes("daud")) {
            msg.react(
                client.emojis.cache.find((emoji) => emoji.name === "daud")
            );
        } else {
            msg.react(
                client.emojis.cache.find(
                    (emoji) => emoji.name === "BAD_TO_THE_BONE"
                )
            );
        }
    }
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
    if (f.includes("avif")) {
        msg.react(process.env.AVIF_CONVERT_EMOJI_ID);
    }
    if (f.includes("copper") && !msg.author.bot) {
        sendWebhook("flaps", "copper you say?", msg.channel);
    }
    if (f.includes("malta") && !msg.author.bot) {
        sendWebhook("flaps", "maltesers you say?", msg.channel);
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

async function getSources(
    commandMessage: Message,
    types: string[],
    localAttachments: Buffer[] = []
): Promise<[Buffer, string][]> {
    let msg = commandMessage;
    if (!msg.attachments.first()) {
        if (!msg.reference) {
            if (!types[0].endsWith("?")) {
                const channel = await msg.channel.fetch();
                const messages = await channel.messages.fetch({
                    limit: 10,
                    before: msg.id,
                });
                const filteredMessages = messages.filter(
                    (m) => m.author.id == msg.author.id
                );
                const lastMessage = filteredMessages.first(2)[1];
                if (lastMessage) {
                    msg = lastMessage;
                }
            }
        } else {
            msg = await msg.fetchReference();
        }
    }
    var atts = msg.attachments.first(types.length);
    var attTypes = getTypes(atts);
    let sources: [Buffer, string][] = [];
    let n = 0;
    let m = 0;
    for (const type of attTypes) {
        if (atts[n].url.startsWith("%local")) {
            sources.push([localAttachments[m], getFileExt(atts[n].url)]);
            m++;
        } else if (type == "webp") {
            let attachment = await convertWebpAttachmentToPng(atts[n]);
            sources.push([attachment, "png"]);
        } else {
            let buf = await downloadPromise(atts[n].url);
            sources.push([buf, getFileExt(atts[n].url)]);
        }
        n++;
    }
    attTypes = attTypes.map((t) => (t == "webp" ? "image" : t));
    if (!atts[0] && !types[0].endsWith("?")) {
        if (msg.content.startsWith("https://tenor.com/")) {
            if (typesMatch(["gif"], types)) {
                let url = await tenorURLToGifURL(msg.content);
                let buffer = await downloadPromise(url);
                return [[buffer, "gif"]];
            } else {
                throw new Error(
                    "Type Error:\n" + getTypeMessage(["gif"], types)
                );
            }
        } else if (
            msg.content.startsWith("https://cdn.discordapp.com/") ||
            msg.content.startsWith("https://media.discordapp.net/")
        ) {
            let url = msg.content.split(" ")[0];
            let ext = getFileExt(url);
            var type = getTypeSingular(lookup(ext) || ext);
            if (typesMatch([type], types)) {
                let buffer = await downloadPromise(url);
                return [[buffer, ext]];
            } else {
                throw new Error(
                    "Type Error:\n" + getTypeMessage([type], types)
                );
            }
        } else {
            throw new Error(`This command requires: \`${types.join("`, `")}\``);
        }
    } else if (!typesMatch(attTypes, types)) {
        throw new Error(`Type Error:\n${getTypeMessage(attTypes, types)}`);
    }
    return sources;
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
    if (TRACK) {
        trackMessage(msg);
    }

    if (isMidnightActive) {
        var mem = await msg.guild.members.fetch(msg.member);
        if (
            msg.content.toLowerCase().includes(midnightText) &&
            !msg.author.bot &&
            !doneUsers.includes(mem.id)
        ) {
            if (midnightQuickEnded) {
                sendWebhook(
                    "flaps",
                    "a bit late but i'll count it :)",
                    msg.channel
                );
            }
            doneUsers.push(mem.id);
            msg.react("👍");
            if (getUnmidnightedUsers().length == 0) {
                if (!midnightQuickEnded) finishMidnight();
                midnightQuickEnded = true;
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
    } else if (msg.content.startsWith(WH_EDIT_PREFIX)) {
        if (msg.reference) {
            let content = msg.content
                .substring(WH_EDIT_PREFIX.length)
                .toLowerCase();
            {
                editWebhookMessage(
                    msg.reference.messageId,
                    "flaps",
                    content,
                    msg.channel
                );
                msg.delete();
            }
        }
    } else {
        autoReact(msg);
    }

    let commandRan = false;
    if (Math.random() < 1 / 5000 || msg.content.startsWith("brainstormtest")) {
        if (!msg.author.bot)
            sendWebhook("brainstorm", msg.content, msg.channel);
    }
    if (!msg.content.startsWith(COMMAND_PREFIX)) return;
    let commandChain: [string, string[]][] = msg.content
        .split("==>")
        .map((cmdtxt) => [
            cmdtxt.trim().split(" ")[0].substring(COMMAND_PREFIX.length),
            cmdtxt.trim().split(" ").slice(1),
        ]);
    let localAttachments: Buffer[] = [];
    let defatts: Collection<string, Attachment> = msg.attachments;
    let lastresp: FlapsCommandResponse = makeMessageResp("flapserrors", "");
    let index = 0;
    try {
        for (const info of commandChain) {
            let commandId = info[0].toLowerCase();
            let commandArgs = info[1];

            let command = commands.find((cmd) =>
                cmd.aliases.includes(commandId.toLowerCase())
            );
            if (!command) continue;
            log(
                `${
                    commandChain.length > 1
                        ? `${C.BBlue}(${index + 1}/${commandChain.length}) ${
                              C.White
                          }`
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
            let argString = commandArgs.join(" ");
            if (argString.includes("$replycontent") && msg.reference) {
                let reference = await msg.fetchReference();
                commandArgs = argString
                    .replace(/\$replycontent/g, reference.content)
                    .split(" ");
            }
            if (argString.includes("$out") && lastresp.content.length > 0) {
                commandArgs = argString
                    .replace(/\$out/g, lastresp.content)
                    .split(" ");
            }
            let sources = [];
            if (command.needs && command.needs.length > 0) {
                try {
                    sources = await getSources(
                        {
                            attachments: defatts,
                            reference: msg.reference,
                            fetchReference: msg.fetchReference,
                            client: client,
                            channel: msg.channel,
                            author: msg.author,
                        } as Message,
                        command.needs,
                        localAttachments
                    );
                } catch (e) {
                    sendWebhook("flaps", e.message, msg.channel);
                    return;
                }
            }
            let response = await command.execute(commandArgs, sources, msg);
            switch (response.type) {
                case CommandResponseType.Message:
                    if (response.filename) {
                        defatts = new Collection();
                        defatts.set("0", {
                            url: "%local" + response.filename,
                            contentType: contentType(response.filename),
                        } as Attachment);
                        localAttachments.push(response.buffer);
                    }
                    lastresp = response;
                    break;
            }
            index++;
        }
    } catch (e) {
        let r = e;
        if (e.toString) {
            r = e.toString();
        }
        lastresp.id = "flaps";
        lastresp.content = `Execution Error in command \`${commandChain[index][0]}\`: \`\`\`${r}\`\`\``;
        lastresp.buffer = null;
        lastresp.filename = null;
        lastresp.components = [];
        log(`Execution Error Follows:`, "error");
        console.log(e);
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
    } else {
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
            case "c4":
                handleInteraction(interaction);
                return;
        }
    }
}

export async function onReaction(reaction: MessageReaction, user: User) {
    reaction = await reaction.fetch();
    user = await user.fetch();
    if (reaction.message.author.id !== user.id) return;
    if (reaction.emoji.id !== process.env.AVIF_CONVERT_EMOJI_ID) return;
    if (!reaction.message.attachments.first()) return;
    let att = reaction.message.attachments.first();
    if (att.contentType !== "image/avif") return;

    reaction.message.reactions.removeAll();

    let avif = await downloadPromise(att.url);
    let png = await ffmpegBuffer("-i $BUF0 $OUT", [[avif, "avif"]], "png");

    sendWebhook(
        "flaps",
        "here's your png, you're welcome <:wanna_convert_this_avif:1279202408139980800>",
        reaction.message.channel,
        png,
        getFileName("Converted_AVIF", "png")
    );
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
client.on("messageReactionAdd", onReaction);

export async function getAllUserStates(serverId: string) {
    let server = await client.guilds.fetch(serverId);
    let states = {};
    for (const [_, member] of server.members.cache) {
        let status = "";
        if (member.presence) {
            status = member.presence.status;
        } else {
            status = "offline";
        }
        states[member.user.username] = status;
    }
    return states;
}

function loadAutoStatus() {
    return new Promise<void>(async (resolve, reject) => {
        let autoStatus: Record<string, AutoStatusInfo> = JSON.parse(
            (await readFile("autostatus.json")).toString()
        );
        client.on("presenceUpdate", async (oldPresence, newPresence) => {
            if (TRACK) trackPresence(newPresence);
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
            if (
                typeof command.name === "undefined" ||
                commands.has(command.name)
            )
                continue;
            if (typeof command.aliases === "undefined") command.aliases = [];
            command.aliases.push(command.id);
            commands.set(command.id, command);
        }
    }
    await Promise.all(ps);
}

let doneUsers = [];
let isMidnightActive = false;
let midnightQuickEnded = false;
let midnightText = "midnight";

let midnightReqUsers = [];
let midnightChannel: TextChannel;

let midnightStartText = process.env.MIDNIGHT_START_MESSAGE ?? "midnight";
let midnightFinishSuccessText =
    process.env.MIDNIGHT_GOOD_MESSAGE ??
    "good job everyone. another great day.";
let midnightFinishFailureText =
    process.env.MIDNIGHT_BAD_MESSAGE ?? "$pings$. THIS WILL NOT GO UNPUNISHED";

function finishMidnight() {
    if (!isMidnightActive) return;
    if (midnightQuickEnded) return;
    var nonusers = getUnmidnightedUsers();
    let pings = "";

    if (nonusers.length >= 2) {
        for (const nonuser of nonusers.slice(0, -1)) {
            pings += "<@" + nonuser + "> ";
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
    midnightQuickEnded = false;
    doneUsers = [];
    if (midnightTimeout) clearTimeout(midnightTimeout);
    midnightTimeout = setTimeout(() => {
        finishMidnight();
        isMidnightActive = false;
    }, 60 * 1000); // 1 min
}

export let MAIN_CHANNEL: TextChannel;
export let DUO_NOTIF_CHANNEL: TextChannel;
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
async function startRemoveBGServer() {
    let proc = cp.spawn("node", "dist/removebgserver.js".split(" "));
    proc.stdout.on("data", (data) => {
        log(`Message from server: ${data.toString()}`, "rbgserver");
    });
    proc.stderr.on("data", (data) => {
        log(`Server error: ${data.toString()}`, "rbgserver");
    });
    proc.on("close", (code) => {
        log(`Server closed with exit code ${C.BCyan}${code}`, "rbgserver");
        startRemoveBGServer();
    });
}
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
        registerFont("fonts/arialblack.ttf", {
            family: "ArialBlack",
            weight: "900",
        });
        // Open Sans
        for (let i = 300; i <= 800; i += 100) {
            registerFont(`fonts/opensans/${i}.ttf`, {
                family: "Open Sans",
                weight: i.toString(),
                style: "normal",
            });
            registerFont(`fonts/opensans/${i}i.ttf`, {
                family: "Open Sans",
                weight: i.toString(),
                style: "italic",
            });
        }

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
    let loadRemoveBGServer = startRemoveBGServer().then(() => {
        log("Remove BG server started.", "start");
    });
    setInterval(async () => {
        var d = new Date();
        if (d.getMinutes() == 30 && d.getHours() == 23 && d.getSeconds() < 1) {
            sendWebhook(
                "flaps",
                `<@${process.env.OWNER_TOKEN}> do your FUCKING duolingo dumbass`,
                DUO_NOTIF_CHANNEL
            );
        }
        if (d.getMinutes() == 0 && d.getHours() == 0 && d.getSeconds() < 1) {
            midnight(MAIN_CHANNEL);
            let d2 = new Date(d.getTime() - 5000);
            let dateStr = `${d2.getFullYear().toString().padStart(4, "0")}-${(
                d2.getMonth() + 1
            )
                .toString()
                .padStart(2, "0")}-${d2.getDate().toString().padStart(2, "0")}`;
            for (const [gid, cid] of TRACK_SERVER_REPORTS) {
                if (await exists(`./track/${gid}/${dateStr}.txt`)) {
                    sendWebhook(
                        "flaps",
                        "here's what you said today!!!",
                        client.channels.cache.get(cid) as TextChannel,
                        await trackReport(
                            await readFile(
                                `./track/${gid}/${dateStr}.txt`,
                                "utf-8"
                            )
                        ),
                        getFileName("Daily_Track", "png")
                    );
                }
            }
        }
        if (Math.random() < 1 / 100000) {
            sendWebhook(
                Math.random() < 0.3 ? "coach" : "nick",
                "pills here",
                MAIN_CHANNEL
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
                MAIN_CHANNEL
            );
        }
        if (
            process.env.FRIDAY_CHANNEL.length > 0 &&
            d.getDay() == 5 &&
            d.getHours() == 17 &&
            d.getMinutes() == 0 &&
            d.getSeconds() < 1
        ) {
            sendWebhook(
                "flaps",
                "happy friday afternoon.",
                client.channels.cache.get(
                    process.env.FRIDAY_CHANNEL
                ) as TextBasedChannel,
                await readFile(file("friday.mp4")),
                "Friday.mp4"
            );
        }
        if (d.getMinutes() == 9 && d.getSeconds() < 1) {
            let allow =
                (await readFile("scal_allowtime.txt", "utf-8")) == "yes";
            if (allow || Math.random() > 0.995) {
                sendWebhook("cirno", "TIME HAHAHAHA", MAIN_CHANNEL);
                if (allow) writeFile("scal_allowtime.txt", "no");
            }
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
        loadRemoveBGServer,
    ]);
    log("Logging in...", "start");
    client
        .login(process.env.DISCORD_TOKEN || "NoTokenProvided")
        .then(async () => {
            MAIN_CHANNEL = (await client.channels.fetch(
                process.env.MAIN_CHANNEL
            )) as TextChannel;
            DUO_NOTIF_CHANNEL = (await client.channels.fetch(
                process.env.DUO_NOTIF_CHANNEL
            )) as TextChannel;
        })
        .catch((e) => {
            console.log(e);
        });
}

init();

function getTypeMessage(inTypes: string[], reqTypes: string[]) {
    let out = [];
    for (let i = 0; i < reqTypes.length; i++) {
        const reqType = reqTypes[i];
        const inType = inTypes[i];
        if (reqType !== inType) {
            out.push(
                `\`${inType}\` was supplied instead of \`${reqType}\` for file ${i}.`
            );
        }
    }
    return out.join("\n");
}
