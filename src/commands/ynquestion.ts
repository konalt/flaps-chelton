import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "ynquestion",
    name: "Yes/No Question",
    desc: "Randomly decides yes or no for a question.",
    execute() {
        return new Promise((res) => {
            res(makeMessageResp("flaps", Math.random() < 0.5 ? "yes" : "no"));
        });
    },
} satisfies FlapsCommand;
