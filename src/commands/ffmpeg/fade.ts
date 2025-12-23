import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import fade from "../../lib/ffmpeg/fade";

module.exports = {
    id: "fade",
    name: "Fade",
    desc: "Fades an image in or out from black",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            let dir: "in" | "out" = "in";
            if (args[0].toLowerCase() == "out") {
                dir = "out";
            }
            fade(buf, dir, parseFloat(args[1] ?? "3") || 3).then(
                handleFFmpeg(getFileName("Effect_Fade", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
