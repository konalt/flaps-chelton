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
    id: "meal",
    name: "Meal",
    desc: "Gets a photo of a delicious dinner.",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            randomRedditImage("StupidFood").then((buf) => {
                res(
                    makeMessageResp(
                        "lamazzu",
                        "",
                        msg.channel as TextChannel,
                        buf,
                        getFileName("Reddit_Meal", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
