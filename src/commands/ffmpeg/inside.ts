import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import inside from "../../lib/ffmpeg/inside";

module.exports = {
    id: "inside",
    name: "Inside",
    desc: "Makes a guy want to be inside something.",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            inside(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Inside", "mp4"),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
