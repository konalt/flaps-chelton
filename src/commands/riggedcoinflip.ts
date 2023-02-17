import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "riggedcoinflip",
    name: "Flip a Coin",
    desc: "Simulates a coin flip. ||Will always be heads.||",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        sendWebhook("flaps", "heads", msg.channel as TextChannel);
    },
} satisfies FlapsCommand;
