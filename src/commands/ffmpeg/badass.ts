import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import badass from "../../lib/ffmpeg/badass";

module.exports = {
    id: "badass",
    name: "Badass",
    desc: "BADASS VIDEO GENERATOR",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            badass(buf, args.join(" ").toUpperCase()).then(
                handleFFmpeg(getFileName("Effect_Biscuit", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
