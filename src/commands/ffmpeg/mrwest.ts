import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import mrwest from "../../lib/ffmpeg/mrwest";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "mrwest",
    name: "Mr. West",
    desc: "thas enough mr west please no more today",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            mrwest(buf, args.join(" ")).then(
                handleFFmpeg(getFileName("Effect_MrWest", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
