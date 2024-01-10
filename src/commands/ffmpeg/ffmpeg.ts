import { Message } from "discord.js";
import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import { getFileExt, getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";

module.exports = {
    id: "ffmpeg",
    name: "FFmpeg",
    desc: "Runs an FFmpeg command. Input files are named $BUF[0-9] and the output is $OUT. First argument must be output file format.",
    needs: [
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
        "image/video/audio/gif?",
    ],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            if (msg.author && msg.author.id !== process.env.OWNER_TOKEN) {
                res(makeMessageResp("flaps", "nuh uh uh!"));
                return;
            }
            ffmpegBuffer(args.slice(1).join(" "), buffers, args[0]).then(
                handleFFmpeg(getFileName("Effect_FFmpeg", args[0]), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
