import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "eval",
    name: "Eval",
    desc: "Evaluates some JavaScript code.",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            if (msg.author.id !== process.env.OWNER_TOKEN) {
                res(makeMessageResp("flaps", "nuh uh uh!"));
                return;
            }
            var evaluated = eval(args.join(" "));
            res(
                makeMessageResp(
                    "flaps",
                    evaluated.toString ? evaluated.toString() : "No response",
                    msg.channel
                )
            );
        });
    },
} satisfies FlapsCommand;
