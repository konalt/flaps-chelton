import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import pancake from "../../lib/ffmpeg/pancake";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "pancake",
    name: "Pancake",
    desc: "Puts an image (or two) on two pancakes.",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            pancake(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Pancake", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
