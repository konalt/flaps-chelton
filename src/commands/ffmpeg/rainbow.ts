import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import rainbow from "../../lib/ffmpeg/rainbow";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "rainbow",
    name: "Rainbow",
    desc: "GAY ASS HUE!!!",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            rainbow(buf, parseFloat(args[0]) || 1).then(
                handleFFmpeg(getFileName("Effect_Rainbow", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
