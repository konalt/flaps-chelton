import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";

module.exports = {
    id: "firstframe",
    name: "First Frame",
    desc: "Gets the first frame of a video or GIF.",
    needs: ["gif/video"],
    async execute(args, buffers) {
        return new Promise((res, rej) => {
            ffmpegBuffer("-i $BUF0 -frames:v 1 $OUT", buffers, "png").then(
                handleFFmpeg(getFileName("Effect_FirstFrame", "png"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
