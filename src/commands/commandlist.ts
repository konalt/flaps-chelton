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
    execute(args) {
        return new Promise((res, rej) => {
            let page = parseInt(args[0]) - 1;
            if (!page) page = 0;
            let pageLength = 8;
            let pageCount = Math.ceil(commands.size / pageLength);
            if (page > pageCount - 1)
                return res(
                    makeMessageResp(
                        "flaps",
                        `theres only ${pageCount} pages silly!`
                    )
                );
            if (page < 0) return res(makeMessageResp("flaps", `what`));
            let str = Array.from(commands)
                .sort((a, b) => {
                    if (a[1].id < b[1].id) {
                        return -1;
                    }
                    if (a[1].id > b[1].id) {
                        return 1;
                    }
                    return 0;
                })
                .map((c) => "`!" + c[1].id + "` - " + c[1].desc)
                .slice(page * pageLength, (page + 1) * pageLength)
                .join("\n");
            res(
                makeMessageResp(
                    "flaps",
                    `Command List\n${str}\nPage ${page + 1} of ${pageCount}`
                )
            );
        });
    },
} satisfies FlapsCommand;
