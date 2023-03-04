import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";
import { readFileSync } from "fs";
import { FlapsCommand } from "../types";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "whereisthenearestelephant",
    name: "Where is the Nearest Elephant?",
    desc: "Gives you the precise location of the nearest elephant.",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            res(
                makeMessageResp(
                    "flaps",
                    "pic goes hard yo",
                    msg.channel as TextChannel,
                    readFileSync("images/gman.png"),
                    "img.png"
                )
            );
        });
    },
} satisfies FlapsCommand;
