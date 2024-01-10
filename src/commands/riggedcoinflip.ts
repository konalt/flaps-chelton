import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "riggedcoinflip",
    name: "Flip a Coin - Rigged",
    desc: "Simulates a coin flip. Will always be heads.",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            res(makeMessageResp("flaps", "heads", msg.channel as TextChannel));
        });
    },
} satisfies FlapsCommand;
