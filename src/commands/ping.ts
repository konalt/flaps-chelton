import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";

module.exports = {
    id: "ping",
    name: "Ping",
    description:
        "Basic command to test flaps. Similar to !yougoodslime in FlapsV1.",
    execute(args: string[], msg: Message) {
        sendWebhook("flaps", "Pog!", msg.channel as TextChannel);
    },
};
