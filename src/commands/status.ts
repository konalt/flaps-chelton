import { FlapsCommand } from "../types";
import { writeFile } from "fs/promises";
import { makeMessageResp } from "../lib/utils";
import { client } from "../index";
import { ActivityType } from "discord.js";

module.exports = {
    id: "status",
    name: "Status",
    desc: "Sets Flaps' Discord status.",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            let statusData = args.join(" ");
            let statusType =
                ActivityType[
                    statusData
                        .split(" ")[0]
                        .split("")
                        .map((l, i) =>
                            i == 0 ? l.toUpperCase() : l.toLowerCase()
                        )
                        .join("")
                ];
            let name = statusData.split(" ").slice(1).join(" ");
            client.user?.setPresence({
                activities: [
                    {
                        name,
                        type: statusType,
                        url: "https://konalt.us.to/",
                    },
                ],
                afk: false,
                status: "online",
            });
            writeFile(
                "./saved_status.txt",
                statusData
                    .split(" ")[0]
                    .split("")
                    .map((l, i) => (i == 0 ? l.toUpperCase() : l.toLowerCase()))
                    .join("") +
                    " " +
                    name
            ).then(() => {
                res(makeMessageResp("flaps", "i gotchu lmao"));
            });
        });
    },
} satisfies FlapsCommand;
