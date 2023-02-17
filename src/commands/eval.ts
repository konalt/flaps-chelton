import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";

module.exports = {
    id: "eval",
    name: "Eval",
    description: "Evaluates some JavaScript code.",
    execute(args: string[], msg: Message) {
        eval(args.join(" "));
    },
};
