import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "coinflip",
    name: "Flip a Coin",
    desc: "Simulates a coin flip.",
    async execute() {
        return makeMessageResp(
            "anton",
            Math.round(Math.random()) == 0 ? "It's tails." : "It's heads."
        );
    },
} satisfies FlapsCommand;
