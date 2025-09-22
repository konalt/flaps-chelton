import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import twistvideo from "../../lib/ffmpeg/twistvideo";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "twistvideo",
    name: "Swirl Video",
    aliases: ["swirlvideo"],
    desc: "time 2 get cray cray",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            twistvideo(buf).then(
                handleFFmpeg(getFileName("Effect_TwistVideo", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
