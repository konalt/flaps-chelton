import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import speedpitch from "../../lib/ffmpeg/speedpitch";

module.exports = {
    id: "speedpitch",
    name: "Speed and Pitch",
    desc: "Speeds up or slows down a video/audio, changing the pitch",
    needs: ["video/audio"],
    async execute(args, buffers) {
        return new Promise((res) => {
            speedpitch(buffers, {
                speed: parseFloat(args[0]),
            }).then(
                handleFFmpeg(
                    getFileName("Effect_SpeedPitch", getFileExt(buffers[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
