import { Message } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import trim from "../../lib/ffmpeg/trim";

module.exports = {
    id: "trim",
    name: "Trim",
    desc: "Trims a video or audio clip.",
    needs: ["video/audio"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            trim(buffers, {
                start: args[0],
                end: args[1],
            }).then(
                handleFFmpeg(
                    getFileName("Effect_Trim", getFileExt(buffers[0][1])),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
