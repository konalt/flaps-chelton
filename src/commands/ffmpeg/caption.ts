import { Message } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import caption from "../../lib/ffmpeg/caption";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "caption",
    name: "Caption",
    desc: "Adds an Impact caption to an image, video, or GIF.",
    needs: ["image/video/gif"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            caption(buffers, {
                text: args.slice(isNaN(parseFloat(args[0])) ? 0 : 1).join(" "),
                fontsize: parseFloat(args[0]) || 30,
            }).then(
                handleFFmpeg(
                    getFileName("Effect_Caption", getFileExt(buffers[0][1])),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
