import { FlapsCommand } from "../types";
import { get100Posts } from "../lib/reddit";
import {
    getFileName,
    makeMessageResp,
    randomRedditImage,
    sample,
} from "../lib/utils";
import { downloadPromise } from "../lib/download";
import { sendWebhook } from "../lib/webhooks";
import { TextChannel } from "discord.js";

module.exports = {
    id: "walmart",
    name: "Wal-Mart",
    desc: "Gets a photo of an average walmart customer.",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            randomRedditImage("peopleofwalmart").then((buf) => {
                res(
                    makeMessageResp(
                        "walmart",
                        "",
                        msg.channel as TextChannel,
                        buf,
                        getFileName("Reddit_Walmart", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
