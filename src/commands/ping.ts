import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "ping",
    name: "Ping",
    desc: "Basic command to test flaps. Similar to !yougoodslime in FlapsV1.",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            res(
                makeMessageResp(
                    "flaps",
                    `Pong!\nYour arguments are: damn ${args.join(",")}`,
                    msg.channel as TextChannel
                )
            );
        });
    },
} satisfies FlapsCommand;
