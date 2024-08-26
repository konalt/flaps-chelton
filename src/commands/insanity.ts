import { setSanity } from "../lib/ai/question";
import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "insanity",
    name: "Insanity",
    desc: "Sets the temperature of Question.",
    async execute(args) {
        setSanity(parseFloat(args[0]));
        return makeMessageResp("monsoon", "yep donezo fonezo");
    },
} satisfies FlapsCommand;
