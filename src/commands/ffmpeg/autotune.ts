import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import autotune from "../../lib/ffmpeg/autotune";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "autotune",
    name: "Autotune",
    desc: "Tunes any sound effect into a song provided. Read lib/ffmpeg/badapple.ts for an example.",
    needs: ["audio"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            autotune(buf, args.join(" ")).then(
                handleFFmpeg(
                    getFileName("Effect_Autotune", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
