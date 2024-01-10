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
    id: "randompost",
    name: "Random Post",
    desc: "Gets a random post from a given subreddit.",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            randomRedditImage(args[0].replace(/\/r/g, "")).then((buf) => {
                res(
                    makeMessageResp(
                        "reddit",
                        "",
                        msg.channel as TextChannel,
                        buf,
                        getFileName("Reddit_RandomPost", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
