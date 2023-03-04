import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";
import glob from "glob";
import { readFileSync } from "fs";
import { makeMessageResp } from "../lib/utils";

function getLineCount(path: string) {
    return readFileSync(path, "utf-8").split("\n").length;
}
function globFiles(pattern: string): Promise<string[]> {
    return new Promise((res, rej) => {
        glob(pattern, (er: Error | null, files: string[]) => {
            if (er) return rej(er);
            res(files);
        });
    });
}

module.exports = {
    id: "flapslength",
    name: "Flaps Length",
    desc: "Gets the length of all flaps TS files.",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            Promise.all([
                globFiles("src/**/*.ts"),
                globFiles("dist/**/*.js"),
                globFiles("js/**/*.js"),
            ]).then((files) => {
                let lineCounts: number[] = new Array(files.length).fill(0);
                files.forEach((paths, i) => {
                    paths.forEach((file) => {
                        lineCounts[i] += getLineCount(file);
                    });
                });
                res(
                    makeMessageResp(
                        "flaps",
                        `Lines in TypeScript source: ${lineCounts[0]}\nLines in compiled JS: ${lineCounts[1]}\nLines in old codebase: ${lineCounts[2]}`,
                        msg.channel as TextChannel
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
