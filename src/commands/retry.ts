import { StageChannel } from "discord.js";
import { Message } from "discord.js";
import { FlapsCommand } from "../types";
import { readFile } from "fs/promises";
import { onMessage } from "../index";
import { makeMessageResp } from "../lib/utils";

module.exports = {
    id: "retry",
    name: "Retry",
    desc: "Retries the last sent message (or the replied message, if present).",
    showOnCommandSimulator: false,
    async execute(args, bufs, msg) {
        if (msg.channel instanceof StageChannel)
            return makeMessageResp("flaps", "how the fuck did you even");
        let retryables = JSON.parse(
            (await readFile("retrycache.json")).toString()
        );
        let ref: Message | null = null;
        if (msg.reference) {
            ref = await msg.fetchReference();
        } else if (retryables[msg.author.id]) {
            ref = await msg.channel.messages.fetch(retryables[msg.author.id]);
        }
        if (ref !== null) {
            onMessage(ref);
        } else {
            return makeMessageResp("flaps", "run a command first or smt idk");
        }
    },
} satisfies FlapsCommand;
