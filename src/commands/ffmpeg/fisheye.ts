import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import fisheye from "../../lib/ffmpeg/fisheye";

module.exports = {
    id: "fisheye",
    name: "Fisheye",
    desc: "Adds a fisheye lens effect to an image.",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            fisheye(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Fisheye", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
