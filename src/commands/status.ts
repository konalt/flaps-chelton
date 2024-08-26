import { FlapsCommand } from "../types";
import { writeFile } from "fs/promises";
import { makeMessageResp } from "../lib/utils";
import { client } from "../index";
import { ActivityType } from "discord.js";

module.exports = {
    id: "status",
    name: "Status",
    desc: "Sets Flaps' Discord status.",
    async execute(args) {
        client.user?.setPresence({
            activities: [
                {
                    name: "custom",
                    type: ActivityType.Custom,
                    state: args.join(" "),
                },
            ],
            afk: false,
            status: "online",
        });
        await writeFile("./saved_status.txt", args.join(" "));
        return makeMessageResp("flaps", "i gotchu lmao");
    },
} satisfies FlapsCommand;
