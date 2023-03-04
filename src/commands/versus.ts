import { Message } from "discord.js";
import { getFileName, makeMessageResp } from "../lib/utils";
import versus from "../lib/versus";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "versus",
    name: "Versus",
    desc: "They shall do battle!",
    needs: ["image/gif/video", "image/gif/video"],
    aliases: ["vs", "vs2"],
    async execute(args: string[], imgbuf: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            if (!args[1]) {
                return sendWebhook(
                    "flaps",
                    "i need 2 images and 2 names mf!!!!!",
                    msg.channel
                );
            }
            versus(imgbuf, args.join(" ").split(":"), false).then(
                (out: Buffer) => {
                    res(
                        makeMessageResp(
                            "flaps",
                            "",
                            msg.channel,
                            out,
                            getFileName("Effect_Versus", "mp4")
                        )
                    );
                }
            );
        });
    },
} satisfies FlapsCommand;
