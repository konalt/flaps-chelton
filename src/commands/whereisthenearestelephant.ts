import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";
import { readFileSync } from "fs";

module.exports = {
    id: "whereisthenearestelephant",
    name: "Where is the Nearest Elephant?",
    description: "Gives you the precise location of the nearest elephant.",
    execute(args: string[], msg: Message) {
        sendWebhook(
            "flaps",
            "pic goes hard yo",
            msg.channel as TextChannel,
            readFileSync("images/gman.png"),
            "img.png"
        );
    },
};
