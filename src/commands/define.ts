import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";
import define from "../lib/define";

module.exports = {
    id: "define",
    name: "Define",
    desc: "Gives a definition for a word.",
    execute(args) {
        return new Promise((res, rej) => {
            define(args[0]).then((result) => {
                res(makeMessageResp("dictionary", result));
            });
        });
    },
} satisfies FlapsCommand;
