import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import { midnight } from "../index";
import { TextChannel } from "discord.js";

module.exports = {
    id: "testmidnight",
    name: "Test Midnight",
    desc: "Tests the midnight feature in the current channel.",
    showOnCommandSimulator: false,
    async execute(args, bufs, msg) {
        midnight(msg.channel as TextChannel);
        return makeMessageResp("flaps", "");
    },
} satisfies FlapsCommand;
