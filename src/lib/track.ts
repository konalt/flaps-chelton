import { Message, Presence } from "discord.js";
import { log } from "./logger";
import { appendFile, mkdir, writeFile } from "fs/promises";
import { exists } from "./utils";
import { getAllUserStates } from "..";

let keywords: Record<string, [number, string[]]> = {};
let i = 0;
for (const [key, words] of process.env.TRACK_KEYWORDS.split(",").map((n) =>
    n.split(":")
)) {
    let wordsArray = words.split("/").map((w) => w.replace(/~COLON~/g, ":"));
    keywords[key] = [0b00000001 << i, wordsArray];
    i++;
}

export async function trackMessage(msg: Message) {
    let server = msg.guildId;
    let author = msg.author.username.replace(/ /g, "_");
    let time = msg.createdTimestamp;
    if (msg.author.bot && msg.author.discriminator == "0000") author = "flaps";
    let logString = "";
    logString += `M:`;
    logString += `${author}:`;
    logString += `${time}:`;
    let bitfield = 0b00000000;
    for (const [_, [mask, words]] of Object.entries(keywords)) {
        let content = msg.content.toLowerCase().split(" ");
        for (const word of words) {
            if (content.includes(word)) {
                bitfield |= mask;
                break;
            }
        }
    }
    logString += bitfield;
    trackString(logString, server, msg.createdAt);
}

async function trackString(
    str: string,
    server: string,
    date: Date = new Date()
) {
    let d = date;
    let dateStr = `${d.getFullYear().toString().padStart(4, "0")}-${(
        d.getMonth() + 1
    )
        .toString()
        .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    if (!(await exists("./track"))) {
        log("No track directory found. Creating.", "track");
        await mkdir("./track");
    }
    if (!(await exists("./track/" + server))) {
        log("No server track directory found. Creating.", "track");
        await mkdir("./track/" + server);
    }
    if (!(await exists("./track/" + server + "/" + dateStr + ".txt"))) {
        log("No date track file found. Creating.", "track");
        await writeFile(
            "./track/" + server + "/" + dateStr + ".txt",
            `META:KW:${process.env.TRACK_KEYWORDS}
META:START_TS:${d.getTime()}
STATES:${Object.entries(await getAllUserStates(server))
                .map((n) => `${n[0]}:${n[1]}`)
                .join(",")}
${str}`
        );
    } else {
        await appendFile(
            "./track/" + server + "/" + dateStr + ".txt",
            "\n" + str
        );
    }
}

export async function trackPresence(presence: Presence) {
    let author = presence.user.username.replace(/ /g, "_");
    if (presence.user.bot && presence.user.discriminator == "0000")
        author = "flaps";
    let logString = "";
    logString += `STATE:`;
    logString += `${author}:`;
    logString += `${presence.status}:`;
    let d = new Date();
    logString += `${d.getTime()}`;
    trackString(logString, presence.guild.id, d);
}
