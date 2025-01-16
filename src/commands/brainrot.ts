import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import { readFile } from "fs/promises";

function sample(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const GENDER = {
    m: ["he", "him", "his", "himself", "man"],
    f: ["she", "her", "her", "herself", "woman"],
    t: ["they", "them", "their", "themselves", "person"],
};

module.exports = {
    id: "brainrot",
    name: "Brainrot Generator",
    desc: "brainrot generator",
    async execute(args) {
        let data_raw = (await readFile("./brainrot.txt")).toString();
        let table = {
            TEMPLATE: [],
            TEMPLATE_SENSUAL: [],
            NOUN: [],
            ADJECTIVE: [],
            LOCATION: [],
            CHARACTER: [],
            VERB: [],
        };
        let read = "unknown";
        for (const l of data_raw.split("\n").map((r) => r.trim())) {
            if (l.length == 0) continue;
            if (l.startsWith("#")) {
                read = l.split("#")[1];
                continue;
            }
            if (!table[read]) table[read] = [];
            table[read].push(l);
        }
        table.TEMPLATE.push(...table.TEMPLATE_SENSUAL);
        let template =
            args.length > 0 ? args.join(" ") : sample(table.TEMPLATE);
        if (args[0] == "sensual") {
            template = sample(table.TEMPLATE_SENSUAL);
        }
        let cache: Record<string, string[]> = {};
        let gendercache: string[] = [];
        template = template.replace(
            /%[ncalvg]+(~\d+)?([\?!])?(\+\d+)?%/gi,
            (s: string) => {
                let types = s.split("%")[1].split("~")[0].split("");
                if (types[0] == "g") {
                    let index = parseInt(
                        s.split("%")[1].split("~")[1].split("+")[0]
                    );
                    let value = "r";
                    if (gendercache[index]) value = gendercache[index];
                    if (value == "r") value = sample(Object.keys(GENDER));
                    let pronounIndex = parseInt(s.split("%")[1].split("+")[1]);
                    return GENDER[value][pronounIndex];
                } else {
                    if (!cache[types.join("")]) cache[types.join("")] = [];
                    let search = [];
                    for (const t of types) {
                        switch (t.toLowerCase()) {
                            case "n":
                                search.push(...table.NOUN);
                                break;
                            case "c":
                                search.push(...table.CHARACTER);
                                break;
                            case "a":
                                search.push(...table.ADJECTIVE);
                                break;
                            case "l":
                                search.push(...table.LOCATION);
                                break;
                            case "v":
                                search.push(...table.VERB);
                                break;
                        }
                    }
                    let word = sample(search);
                    let index = parseInt(s.split("%")[1].split("~")[1]);
                    if (cache[types.join("")][index]) {
                        word = cache[types.join("")][index];
                    } else {
                        cache[types.join("")].push(word);
                    }
                    let isPlural =
                        s.endsWith("!%") ||
                        (s.endsWith("?%") && Math.random() > 0.5);
                    if (isPlural && word.split("/").length > 1) {
                        word = word.split("/")[1];
                    } else {
                        word = word.split("/")[0];
                    }
                    if (word.split("@").length > 1) {
                        gendercache.push(word.split("@")[0]);
                        word = word.split("@")[1];
                    }
                    if (types[0].toUpperCase() == types[0])
                        word = word.toUpperCase();
                    return word;
                }
            }
        );
        return makeMessageResp("flaps", template.replace(/\\n/g, "\n"));
    },
} satisfies FlapsCommand;
