import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import cottoneye from "../../lib/ffmpeg/cottoneye";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "cottoneye",
    name: "Cotton Eye Joe",
    desc: "gegagedigedagedago",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            cottoneye(buf).then(
                handleFFmpeg(getFileName("Effect_CottonEye", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
