import { Message } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import caption2 from "../../lib/ffmpeg/caption2";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "caption2",
    name: "Caption2",
    desc: "Adds a Futura caption to a video, image, or gif. Now uses canvas!",
    needs: ["image/video/gif"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            caption2(buffers, {
                text: args.join(" "),
            }).then(
                handleFFmpeg(
                    getFileName("Effect_Caption2", getFileExt(buffers[0][1])),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
