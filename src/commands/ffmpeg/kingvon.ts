import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import kingvon from "../../lib/ffmpeg/kingvon";

module.exports = {
    id: "kingvon",
    name: "King Von",
    desc: "if he wanted you dead hed DO IT HIMSELF",
    needs: ["image", "image?"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            kingvon(buf, args.join(" ") || "this mf").then(
                handleFFmpeg(getFileName("Effect_KingVon", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
