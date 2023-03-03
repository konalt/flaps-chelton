import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";
import caption from "../../lib/ffmpeg/caption";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "caption",
    name: "Caption",
    desc: "Adds an Impact caption to an image, video, or GIF.",
    needs: ["image/video/gif"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        caption(buffers, {
            text: args.join(" "),
        }).then(
            handleFFmpeg(
                getFileName("Effect_Caption", getFileExt(buffers[0][1])),
                msg.channel as TextChannel
            ),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
