import { makeMessageResp } from "../lib/utils";
import { FlapsCommand } from "../types";

module.exports = {
    id: "ping",
    name: "Ping",
    desc: "Basic command to test flaps. Similar to !yougoodslime in Flaps V1.",
    async execute(args) {
        return makeMessageResp(
            "flaps",
            `Pong!\nYour arguments are: damn ${args.join(",")}`
        );
    },
} satisfies FlapsCommand;
