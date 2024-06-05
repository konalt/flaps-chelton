import { FlapsCommand } from "../types";
import { writeFile } from "fs/promises";
import { makeMessageResp } from "../lib/utils";
import { client } from "../index";
import { Activity, ActivityType } from "discord.js";

module.exports = {
    id: "status",
    name: "Status",
    desc: "Sets Flaps' Discord status.",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
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
            writeFile("./saved_status.txt", args.join(" ")).then(() => {
                res(makeMessageResp("flaps", "i gotchu lmao"));
            });
        });
    },
} satisfies FlapsCommand;
