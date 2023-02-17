import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "eval",
    name: "Eval",
    desc: "Evaluates some JavaScript code.",
    execute(args: string[], bufs: Buffer[] | null, msg: Message) {
        eval(args.join(" "));
    },
} satisfies FlapsCommand;
