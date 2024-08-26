import { readFileSync } from "fs";
import { FlapsCommand } from "../types";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "whereisthenearestelephant",
    name: "Where is the Nearest Elephant?",
    desc: "Gives you the precise location of the nearest elephant.",
    async execute() {
        return makeMessageResp(
            "flaps",
            "pic goes hard yo",
            readFileSync("images/gman.png"),
            "img.png"
        );
    },
} satisfies FlapsCommand;
