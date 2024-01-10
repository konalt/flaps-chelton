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
    desc: "Gets the length of all flaps source files.",
    execute(args, bufs, msg) {
        return new Promise((res, rej) => {
            globFiles("src/**/*.ts").then((files) => {
                let lineCount = 0;
                files.forEach((file) => {
                    lineCount += getLineCount(file);
                });
                res(
                    makeMessageResp("flaps", `this mf ${lineCount} lines long`)
                );
            });
        });
    },
} satisfies FlapsCommand;
