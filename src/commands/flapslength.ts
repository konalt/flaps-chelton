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
    async execute() {
        let lineCountTS = await globFiles("src/**/*.ts").then((files) => {
            let lineCount = 0;
            files.forEach((file) => {
                lineCount += getLineCount(file);
            });
            return lineCount;
        });
        let lineCountWeb = await globFiles("web/**/*.js").then((files) => {
            let lineCount = 0;
            files.forEach((file) => {
                lineCount += getLineCount(file);
            });
            return lineCount;
        });
        return makeMessageResp(
            "flaps",
            `this mf ${lineCountTS + lineCountWeb} lines long`
        );
    },
} satisfies FlapsCommand;
