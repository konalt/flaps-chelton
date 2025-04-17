import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import frame from "../../lib/ffmpeg/frame";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "frame",
    name: "Frame",
    desc: "Places an image in a nice golden frame.",
    needs: ["image"],
    aliases: ["framephoto"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            frame(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Frame", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
