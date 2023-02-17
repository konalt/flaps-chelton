import { FlapsCommand } from "../types";
import { get100Posts } from "../lib/reddit";
import { getFileName, sample } from "../lib/utils";
import { downloadPromise } from "../lib/download";
import { sendWebhook } from "../lib/webhooks";
import { TextChannel } from "discord.js";

module.exports = {
    id: "meal",
    name: "Meal",
    desc: "Gets a photo of a delicious dinner.",
    execute(args, buf, msg) {
        get100Posts("StupidFood").then((posts) => {
            posts = posts
                .filter((p) => {
                    return (
                        p.data.post_hint == "image" &&
                        p.data.url_overridden_by_dest
                    );
                })
                .map((p) => {
                    return p.data.url_overridden_by_dest;
                });
            let post = sample(posts);
            downloadPromise(post).then((buf) => {
                if (buf == null) return;
                sendWebhook(
                    "flaps",
                    "",
                    msg.channel as TextChannel,
                    buf,
                    getFileName("Reddit_Meal", "png")
                );
            });
        });
    },
} satisfies FlapsCommand;
