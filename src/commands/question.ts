import { TextChannel } from "discord.js";
import question from "../lib/ai/question";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "question",
    name: "Question",
    desc: "Asks a cool AI a question.",
    execute(args, buf, msg) {
        let questionText = args.join(" ");
        question(questionText).then((answer) => {
            sendWebhook("flaps", answer, msg.channel as TextChannel);
        });
    },
} satisfies FlapsCommand;
