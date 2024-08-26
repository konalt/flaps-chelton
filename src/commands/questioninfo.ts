import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import { getRatelimit } from "../lib/ai/question";

module.exports = {
    id: "questioninfo",
    name: "Question Info",
    desc: "Gets info on !question rate limit.",
    async execute() {
        return makeMessageResp("flaps", getRatelimit());
    },
} satisfies FlapsCommand;
