import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";

module.exports = {
    id: "whereisthenearestelephant",
    name: "Where is the Nearest Elephant?",
    description: "Gives you the precise location of the nearest elephant.",
    execute(args: string[], msg: Message) {
        sendWebhook("flaps", "", msg.channel as TextChannel);
    },
};
