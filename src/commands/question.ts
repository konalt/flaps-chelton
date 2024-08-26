import { question, monsoonPre } from "../lib/ai/question";
import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "question",
    name: "Question",
    desc: "Asks a cool AI a question.",
    async execute(args) {
        let questionText = args.join(" ");
        let answer = await question(questionText);
        return makeMessageResp(monsoonPre[1] as string, answer);
    },
} satisfies FlapsCommand;
