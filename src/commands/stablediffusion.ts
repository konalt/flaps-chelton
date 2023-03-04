import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { sendWebhook } from "../lib/webhooks";
import { readFileSync } from "fs";
import { FlapsCommand } from "../types";
import stablediffusion from "../lib/ai/stablediffusion";
import { getFileName, makeMessageResp } from "../lib/utils";

module.exports = {
    id: "stablediffusion",
    aliases: ["dalle2"],
    name: "Stable Diffusion",
    desc: "Generates an image with Stable Diffusion.",
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            if (args.length == 0) {
                return sendWebhook(
                    "flaps",
                    "pic goes hard yo",
                    msg.channel as TextChannel,
                    readFileSync("images/gman.png"),
                    "img.png"
                );
            }
            stablediffusion({
                prompt: args.join(" "),
            }).then((img) => {
                res(
                    makeMessageResp(
                        "dalle2",
                        "",
                        msg.channel as TextChannel,
                        img,
                        getFileName("AI_StableDiff", "png")
                    )
                );
            });
        });
    },
} satisfies FlapsCommand;
