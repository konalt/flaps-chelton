import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { midnight } from "../index";
import { FlapsCommand } from "../types";

module.exports = {
    id: "testmidnight",
    name: "Test Midnight",
    desc: "Tests the midnight functionality.",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        midnight(msg.channel as TextChannel);
    },
} satisfies FlapsCommand;
