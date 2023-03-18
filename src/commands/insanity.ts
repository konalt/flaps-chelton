import { setSanity } from "../lib/ai/question";
import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "emoji",
    name: "Emoji",
    desc: "Sets the temperature of Question.",
    async execute(args, buf, msg) {
        return new Promise((res, rej) => {
            setSanity(parseFloat(args[0]));
            res(makeMessageResp("monsoon", "yep donezo fonezo", msg.channel));
        });
    },
} satisfies FlapsCommand;
