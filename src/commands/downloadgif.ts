import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { getFileName } from "../lib/utils";
import { sendWebhook } from "../lib/webhooks";
import { FlapsCommand } from "../types";

module.exports = {
    id: "downloadgif",
    name: "Download GIF",
    desc: "Downloads a Tenor GIF. Note that this also works on uploaded GIFs, for some reason.",
    aliases: ["dlgif"],
    needs: ["gif"],
    execute(args: string[], bufs: [Buffer, string][], msg: Message) {
        sendWebhook(
            "flaps",
            "",
            msg.channel as TextChannel,
            bufs[0][0],
            getFileName("DownloadGIF", "gif")
        );
    },
} satisfies FlapsCommand;
