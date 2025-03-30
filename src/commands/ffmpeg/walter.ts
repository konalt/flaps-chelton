import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import walter from "../../lib/ffmpeg/walter";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "walter",
    name: "Walter",
    desc: "waltuh.. pretty badass..",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            walter(buf).then(
                handleFFmpeg(getFileName("Effect_Walter", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
