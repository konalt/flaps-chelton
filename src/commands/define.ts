import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import define from "../lib/define";

module.exports = {
    id: "define",
    name: "Define",
    desc: "Gives a definition for a word.",
    async execute(args) {
        let definition = await define(args[0]);
        return makeMessageResp("dictionary", definition);
    },
} satisfies FlapsCommand;
