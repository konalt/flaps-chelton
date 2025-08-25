import { commands } from "..";
import {
    NeedsAnything,
    getFileExt,
    getFileName,
    makeMessageResp,
} from "../lib/utils";
import { FlapsCommand } from "../types";

interface Filter {
    inSpecs: string[];
    commands: string[];
    argLists: string[][];
    outBuffer: string;
    outText: string;
}

function parseFiltergraph(graph: string) {
    let sequence: Filter[] = [];
    for (const filter of graph.split(";")) {
        let properties = filter.split("-");
        let commandString = properties.slice(1, -1).join("-");
        let inSpecs = properties[0].split(",");
        let commands = commandString
            .split(" && ")
            .map((s) => s.trim().split(" ")[0]);
        let argLists = commandString
            .split(" && ")
            .map((s) => s.trim().split(" ").slice(1));
        let outSpecs = properties.at(-1).split(",");
        let outBuffer = outSpecs[0];
        let outText = outSpecs[1] ?? "";
        sequence.push({
            inSpecs,
            commands,
            argLists,
            outBuffer,
            outText,
        });
    }
    return sequence;
}

module.exports = {
    id: "complex",
    name: "Complex",
    desc: "Kind of like a complex FFmpeg filtergraph, but for flaps commands.",
    needs: NeedsAnything,
    async execute(args, bufs, msg) {
        let graph = parseFiltergraph(args.join(" "));
        let bufferStorage: Record<string, [Buffer, string]> = {};
        let textStorage: Record<string, string> = {
            out: "",
        };
        for (const filter of graph) {
            let inBuffers: [Buffer, string][] = [];
            for (const spec of filter.inSpecs) {
                if (spec.startsWith(":")) {
                    let index = parseInt(spec.split(":")[1]);
                    if (!bufs[index])
                        return makeMessageResp(
                            "flaps",
                            `Error: input buffer ${index} not found`
                        );
                    inBuffers.push(bufs[index]);
                } else {
                    if (
                        Object.keys(bufferStorage).includes(spec) ||
                        spec == ""
                    ) {
                        inBuffers.push(bufferStorage[spec]);
                    } else {
                        return makeMessageResp(
                            "flaps",
                            `Error: specifier ${spec} not recognized`
                        );
                    }
                }
            }
            let currentBuffer: [Buffer, string];
            let currentText: string;
            for (let i = 0; i < filter.commands.length; i++) {
                let command = commands.find((cmd) =>
                    cmd.aliases.includes(filter.commands[i].toLowerCase())
                );
                let args = filter.argLists[i];
                let response = await command.execute(
                    args
                        .join(" ")
                        .replace(/\$([a-z])+/g, (orig, spec) => {
                            return textStorage[spec] ?? orig;
                        })
                        .split(" "),
                    i == 0 ? inBuffers : [currentBuffer],
                    msg
                );
                if (response.buffer) {
                    currentBuffer = [
                        response.buffer,
                        getFileExt(response.filename),
                    ];
                }
                if (filter.outText.length > 0) {
                    currentText = response.content;
                }
            }
            if (currentBuffer) {
                bufferStorage[filter.outBuffer] = currentBuffer;
            }
            if (filter.outText.length > 0) {
                textStorage[filter.outText] = currentText;
            }
        }
        if (bufferStorage.out) {
            return makeMessageResp(
                "flaps",
                textStorage.out,
                bufferStorage.out[0],
                getFileName("Complex", bufferStorage.out[1])
            );
        } else {
            return makeMessageResp("flaps", textStorage.out);
        }
    },
} satisfies FlapsCommand;
