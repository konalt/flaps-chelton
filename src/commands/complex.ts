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
    command: string;
    args: string[];
    outBuffer: string;
    outText: string;
}

function parseFiltergraph(graph: string) {
    let sequence: Filter[] = [];
    for (const filter of graph.split(";")) {
        let properties = filter.split("-");
        let commandString = properties.slice(1, -1).join("-");
        let inSpecs = properties[0].split(",");
        let command = commandString.split(" ")[0];
        let args = commandString.split(" ").slice(1);
        let outSpecs = properties.at(-1).split(",");
        let outBuffer = outSpecs[0];
        let outText = outSpecs[1] ?? "";
        sequence.push({
            inSpecs,
            command,
            args,
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
            let command = commands.find((cmd) =>
                cmd.aliases.includes(filter.command.toLowerCase())
            );
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
            let response = await command.execute(
                filter.args
                    .join(" ")
                    .replace(/\$([a-z])+/g, (orig, spec) => {
                        return textStorage[spec] ?? orig;
                    })
                    .split(" "),
                inBuffers,
                msg
            );
            if (response.buffer) {
                bufferStorage[filter.outBuffer] = [
                    response.buffer,
                    getFileExt(response.filename),
                ];
            }
            if (filter.outText.length > 0) {
                textStorage[filter.outText] = response.content;
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
