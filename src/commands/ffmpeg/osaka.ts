import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import osaka from "../../lib/ffmpeg/osaka";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "osaka",
    name: "Osaka",
    desc: "she in my head like the noid",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            osaka(buf).then(
                handleFFmpeg(getFileName("Effect_Osaka", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
