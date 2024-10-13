import { readFile } from "fs/promises";
import { makeMessageResp, sample } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "headcanon",
    name: "Headcanon Generator",
    desc: "Returns a random headcanon about the supplied character.",
    async execute(args) {
        let data_raw = await readFile("./headcanons.txt", "utf-8");
        let table = {
            TEMPLATE: [],
            ITEM: [],
            SONG: [],
            SEXUALITY: [],
            FEAR: [],
            PET: [],
            SUBJECT: [],
            STORE: [],
            FANFIC: [],
            CHILD: [],
            INSTRUMENT: [],
            SOCIAL: [],
            CAN: [],
            QUALITY: [],
            ACTION: [],
            ACTION2: [],
            FAVOURITE: [],
            CATDOG: [],
            COMMA: [],
            LIKEHATE: [],
            POSITION: [],
            SEXYMAN: [],
            AFTERLIFE: [],
            SAYING: [],
            NAME: [args.length > 0 ? args.join(" ") : "Flaps"],
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
        let template = sample(table.TEMPLATE);
        template = template.replace(/%[A-z]+%/gi, (s: string) => {
            let type = s.split("%")[1].toUpperCase();
            let word = sample(table[type]);
            return word;
        });
        return makeMessageResp("flaps", template.replace(/\\n/g, "\n"));
    },
} satisfies FlapsCommand;
