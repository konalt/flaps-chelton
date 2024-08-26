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
    aliases: ["vs"],
    async execute(args, bufs, ms) {
        if (!args.join(" ").split(":")[1]) {
            return makeMessageResp(
                "flaps",
                "i need 2 images and 2 names mf!!!!!"
            );
        }
        let out = await versus(
            bufs,
            args.join(" ").split(":"),
            args.join(" ").split(":")[2] == "long"
        );
        return makeMessageResp(
            "flaps",
            "",
            out,
            getFileName("Effect_Versus", "mp4")
        );
    },
} satisfies FlapsCommand;
