import { TextChannel } from "discord.js";
import { question, monsoonPre } from "../lib/ai/question";
import { makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "question",
    name: "Question",
    desc: "Asks a cool AI a question.",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            let questionText = args.join(" ");
            question(questionText).then((answer: string) => {
                res(
                    makeMessageResp(
                        monsoonPre[1] as string,
                        answer,
                        msg.channel as TextChannel
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
