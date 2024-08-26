import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { makeMessageResp } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";
import { commands } from "../index";

module.exports = {
    id: "commandlist",
    name: "Command List",
    desc: "Lists all commands.",
    showOnCommandSimulator: false,
    async execute(args) {
        let page = parseInt(args[0]) - 1;
        if (!page) page = 0;
        let pageLength = 8;
        let commands2 = Array.from(commands)
            .filter((command) => {
                if (
                    !command[1].showOnCommandSimulator &&
                    typeof command[1].showOnCommandSimulator == "boolean"
                ) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (a[1].id < b[1].id) {
                    return -1;
                }
                if (a[1].id > b[1].id) {
                    return 1;
                }
                return 0;
            })
            .map((c) => "`!" + c[1].id + "` - " + c[1].desc);
        let pageCount = Math.ceil(commands2.length / pageLength);
        if (page > pageCount - 1)
            return makeMessageResp(
                "flaps",
                `theres only ${pageCount} pages silly!`
            );
        if (page < 0) return makeMessageResp("flaps", `what`);
        let str = commands2
            .slice(page * pageLength, (page + 1) * pageLength)
            .join("\n");
        return makeMessageResp(
            "flaps",
            `Command List\n${str}\nPage ${page + 1} of ${pageCount}`
        );
    },
} satisfies FlapsCommand;
