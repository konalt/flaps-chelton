import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";

module.exports = {
    id: "coinflip",
    name: "Flip a Coin",
    description: "Simulates a coin flip.",
    execute(args: string[], msg: Message) {
        sendWebhook(
            "flaps",
            Math.round(Math.random()) == 0 ? "tails" : "heads",
            msg.channel as TextChannel
        );
    },
};
