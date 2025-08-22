import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import paint from "../../lib/ffmpeg/paint";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "paint",
    name: "Paint",
    desc: "Paints an image over another. If no second image is supplied, a white background is used.",
    needs: ["image", "image?"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            paint(buf).then(
                handleFFmpeg(getFileName("Effect_Paint", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
