import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "coinflip",
    name: "Flip a Coin",
    desc: "Simulates a coin flip.",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            res(
                makeMessageResp(
                    "flaps",
                    Math.round(Math.random()) == 0 ? "tails" : "heads",
                    msg.channel
                )
            );
        });
    },
} satisfies FlapsCommand;
