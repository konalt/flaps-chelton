import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import syndrome from "../../lib/ffmpeg/syndrome";

module.exports = {
    id: "syndrome",
    name: "Syndrome",
    desc: "Makes Syndrome take a portrait from his wall.",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            syndrome(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Syndrome", "mp4"),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
