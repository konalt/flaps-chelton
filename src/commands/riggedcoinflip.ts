import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "riggedcoinflip",
    name: "Flip a Coin - Rigged",
    desc: "Simulates a coin flip. Will always be heads.",
    async execute() {
        return makeMessageResp("flaps", "heads");
    },
} satisfies FlapsCommand;
