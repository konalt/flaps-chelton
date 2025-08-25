import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";

module.exports = {
    id: "rotate",
    name: "Rotate",
    desc: "Rotates an image or video.",
    needs: ["image/video"],
    async execute(args, buffers) {
        return new Promise((res, rej) => {
            ffmpegBuffer(
                `-i $BUF0 -vf rotate=${
                    parseFloat(args[0]) * (Math.PI / 180)
                } $OUT`,
                buffers
            ).then(
                handleFFmpeg(
                    getFileName("Effect_HFlip", getFileExt(buffers[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
