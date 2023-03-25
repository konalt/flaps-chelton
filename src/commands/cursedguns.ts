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
    id: "firearm",
    name: "Firearm",
    desc: "Gets a photo of a perfectly normal gun.",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            randomRedditImage("cursedguns").then((buf) => {
                res(
                    makeMessageResp(
                        "firearms",
                        "",
                        msg.channel as TextChannel,
                        buf,
                        getFileName("Reddit_Firearm", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
