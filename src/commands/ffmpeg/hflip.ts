import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";

module.exports = {
    id: "hflip",
    name: "Horizontal Flip",
    desc: "Flips an image or video horizontally.",
    needs: ["image/video"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            ffmpegBuffer("-i $BUF0 -vf hflip $OUT", buffers).then(
                handleFFmpeg(
                    getFileName("Effect_HFlip", getFileExt(buffers[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
