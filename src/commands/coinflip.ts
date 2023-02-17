import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "coinflip",
    name: "Flip a Coin",
    desc: "Simulates a coin flip.",
    execute(args: string[], bufs: Buffer[] | null, msg: Message) {
        sendWebhook(
            "flaps",
            Math.round(Math.random()) == 0 ? "tails" : "heads",
            msg.channel as TextChannel
        );
    },
} satisfies FlapsCommand;
