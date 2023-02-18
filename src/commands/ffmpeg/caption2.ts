import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";
import caption2 from "../../lib/ffmpeg/caption2";

module.exports = {
    id: "caption2",
    name: "Caption2",
    desc: "Adds a Futura caption to a video, image, or gif.",
    needs: ["image/video/gif"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        caption2(buffers, {
            text: args.join(" "),
        }).then(
            handleFFmpeg(
                getFileName("Effect_Caption2", getFileExt(buffers[0][1])),
                msg.channel as TextChannel
            )
        );
    },
} satisfies FlapsCommand;
