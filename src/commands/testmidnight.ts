import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";
import { midnight } from "../index";
import { TextChannel } from "discord.js";

module.exports = {
    id: "testmidnight",
    name: "Test Midnight",
    desc: "Tests the midnight feature in the current channel.",
    execute(args, bufs, msg) {
        return new Promise((res, rej) => {
            midnight(msg.channel as TextChannel);
            res(makeMessageResp("flaps", ""));
        });
    },
} satisfies FlapsCommand;
