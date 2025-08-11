import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import teaparty from "../../lib/ffmpeg/teaparty";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "teaparty",
    name: "Tea Party",
    desc: "Starts a tea party with your image!",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            teaparty(buf[0][0]).then(
                handleFFmpeg(
                    getFileName("Effect_TeaParty", "mp4"),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
