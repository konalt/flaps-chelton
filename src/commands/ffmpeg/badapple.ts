import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import badapple from "../../lib/ffmpeg/badapple";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "badapple",
    name: "Bad Apple",
    desc: "Tunes any sound effect into Bad Apple.",
    needs: ["audio"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            badapple(buf).then(
                handleFFmpeg(
                    getFileName("Effect_BadApple", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
