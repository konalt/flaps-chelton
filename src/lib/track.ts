import { Message } from "discord.js";
import { idFromName, log } from "./logger";
import { appendFile, mkdir, writeFile } from "fs/promises";
import { exists } from "./utils";

export async function trackMessage(msg: Message) {
    let server = msg.guildId;
    let channel = msg.channelId;
    let author = msg.author.username.replace(/ /g, "_");
    let time = msg.createdTimestamp;
    let d = msg.createdAt;
    let dateStr = `${d.getFullYear().toString().padStart(4, "0")}-${(
        d.getMonth() + 1
    )
        .toString()
        .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    if (msg.author.bot && msg.author.discriminator == "0000")
        author = idFromName(msg.author.username);
    let logString = "";
    logString += `${channel}:`;
    logString += `${author}:`;
    logString += `${time}`;
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
            logString
        );
    } else {
        await appendFile(
            "./track/" + server + "/" + dateStr + ".txt",
            "\n" + logString
        );
    }
}
