import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";

module.exports = {
    id: "ping",
    name: "Ping weeeee",
    description:
        "Basic command to test flaps. Similar to !yougoodslime in FlapsV1.",
    execute(msg: Message) {
        sendWebhook("flaps", "Pong!", msg.channel as TextChannel);
    },
};
