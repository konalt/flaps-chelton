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
                    "anton",
                    Math.round(Math.random()) == 0
                        ? "It's tails."
                        : "It's heads.",
                    msg.channel
                )
            );
        });
    },
} satisfies FlapsCommand;
