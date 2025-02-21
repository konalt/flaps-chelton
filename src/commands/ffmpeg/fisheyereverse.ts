import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import fisheyereverse from "../../lib/ffmpeg/fisheyereverse";

module.exports = {
    id: "fisheyereverse",
    name: "Fisheye Reverse",
    desc: "Adds a reversed fisheye lens effect to an image.",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            fisheyereverse(buf).then(
                handleFFmpeg(
                    getFileName("Effect_FisheyeReverse", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
