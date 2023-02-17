import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";

module.exports = {
    id: "riggedcoinflip",
    name: "Flip a Coin",
    description: "Simulates a coin flip. ||Will always be heads.||",
    execute(args: string[], msg: Message) {
        sendWebhook("flaps", "heads", msg.channel as TextChannel);
    },
};
