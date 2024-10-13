import { inspect } from "util";
import { getFileName, makeMessageResp } from "../lib/utils";
import { FlapsCommand, FlapsMessageCommandResponse } from "../types";
import { readdirSync } from "fs";
import { Message } from "discord.js";

let lib = { __pop: false };
let commands = { __pop: false };
async function populate(dir = "", onlyExecute = false) {
    let o = { __pop: false };
    for (const file of readdirSync("./dist/" + dir, {
        withFileTypes: true,
    })) {
        if (file.isDirectory()) {
            o[file.name] = await populate(dir + "/" + file.name, onlyExecute);
        } else {
            let imp = await import("../" + dir + "/" + file.name);
            if (imp.default) {
                imp = imp.default;
            }
            if (onlyExecute) {
                let _imp = imp;
                imp = async function execute(
                    args: string[] | string = [],
                    buffers: [Buffer, string][] = null,
                    message: Message = null
                ) {
                    if (typeof args == "string") args = args.split(" ");
                    return _imp.execute(args, buffers, message);
                };
            }
            o[file.name.split(".")[0]] = imp;
        }
    }
    o.__pop = true;
    return o;
}

module.exports = {
    id: "eval",
    name: "Eval",
    desc: "Evaluates some JavaScript code.",
    showOnCommandSimulator: false,
    needs: [
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
    ],
    async execute(args, bufs, msg) {
        if (!lib.__pop) {
            lib = await populate("lib");
        }
        if (!commands.__pop) {
            commands = await populate("commands", true);
        }
        if (msg.author.id !== process.env.OWNER_TOKEN) {
            return makeMessageResp("flaps", "nuh uh uh!");
        }
        if (args.join(" ") == "list") {
            return makeMessageResp("flaps", Object.keys(lib).join(", "));
        }
        let outformat = "bin";
        if (args[0] == "--out") {
            outformat = args[1];
            args = args.slice(2);
        }
        var evaluated = eval(args.join(" "));
        if (evaluated) {
            if (evaluated instanceof Promise) {
                evaluated = await evaluated;
            }
            let s = "";
            if (evaluated instanceof Buffer) {
                return makeMessageResp(
                    "flaps",
                    s,
                    evaluated,
                    getFileName("EvalOutput", outformat)
                );
            }
            if (
                typeof evaluated.id == "string" &&
                typeof evaluated.content == "string"
            ) {
                return evaluated;
            }
            if (evaluated.toString) {
                if (evaluated.toString() == "[object Object]") {
                    s = "``` " + inspect(evaluated) + " ```";
                } else if (evaluated instanceof Function) {
                    s = "``` " + evaluated.toString() + " ```";
                } else {
                    s = evaluated.toString();
                }
            } else {
                s = "No response";
            }
            return makeMessageResp("flaps", s);
        } else {
            return makeMessageResp("flaps", "No response");
        }
    },
} satisfies FlapsCommand;
