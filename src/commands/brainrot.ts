import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import { readFile } from "fs/promises";

function sample(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    id: "brainrot",
    name: "Brainrot Generator",
    desc: "brainrot generator",
    async execute(args) {
        let data_raw = (await readFile("./brainrot.txt")).toString();
        let table = {
            TEMPLATE: [],
            NOUN: [],
            ADJECTIVE: [],
            LOCATION: [],
            CHARACTER: [],
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
        let template =
            args.length > 0 ? args.join(" ") : sample(table.TEMPLATE);
        template = template.replace(/%[ncal]+%/g, (s) => {
            let types = s.split("%")[1].split("");
            let search = [];
            for (const t of types) {
                switch (t) {
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
                }
            }
            return sample(search);
        });
        return makeMessageResp("flaps", template);
    },
} satisfies FlapsCommand;
