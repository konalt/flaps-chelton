import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "random",
    name: "Random",
    desc: "Generates a random number between 0 and a specified number.",
    async execute(args) {
        let max = parseInt(args[0]) || 10;
        return makeMessageResp(
            "flaps",
            `you got ${Math.floor(Math.random() * max)}`
        );
    },
} satisfies FlapsCommand;
