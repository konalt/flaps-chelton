import { StageChannel, TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";
import { readFile } from "fs/promises";
import { onMessage } from "../index";

module.exports = {
    id: "retry",
    name: "Retry",
    desc: "Retries the last sent message (or the replied message, if present).",
    showOnCommandSimulator: false,
    async execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise(async (res, rej) => {
            if (msg.channel instanceof StageChannel)
                return rej("Stage message");
            let retryables = JSON.parse(
                (await readFile("retrycache.json")).toString()
            );
            let ref: Message | null = null;
            if (msg.reference) {
                ref = await msg.fetchReference();
            } else if (retryables[msg.author.id]) {
                ref = await msg.channel.messages.fetch(
                    retryables[msg.author.id]
                );
            }
            if (ref !== null) {
                onMessage(ref);
            } else {
                sendWebhook(
                    "flaps",
                    "run a command first or smt idk",
                    msg.channel
                );
            }
        });
    },
} satisfies FlapsCommand;
