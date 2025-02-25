import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import hueshift from "../../lib/ffmpeg/hueshift";

module.exports = {
    id: "hueshift",
    name: "Hue Shift",
    desc: "Shifts the hue of an image or video.",
    needs: ["image/video"],
    aliases: ["hue"],
    async execute(args, buffers) {
        return new Promise((res, rej) => {
            hueshift(buffers[0], parseInt(args[0] ?? "180")).then(
                handleFFmpeg(
                    getFileName("Effect_HueShift", getFileExt(buffers[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
