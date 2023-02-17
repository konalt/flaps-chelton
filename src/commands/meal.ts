import { FlapsCommand } from "../types";
import { get100Posts } from "../lib/reddit";
import { getFileName, randomRedditImage, sample } from "../lib/utils";
import { downloadPromise } from "../lib/download";
import { sendWebhook } from "../lib/webhooks";
import { TextChannel } from "discord.js";

module.exports = {
    id: "meal",
    name: "Meal",
    desc: "Gets a photo of a delicious dinner.",
    execute(args, buf, msg) {
        randomRedditImage("StupidFood").then((buf) => {
            sendWebhook(
                "flaps",
                "",
                msg.channel as TextChannel,
                buf,
                getFileName("Reddit_Meal", "png")
            );
        });
    },
} satisfies FlapsCommand;
