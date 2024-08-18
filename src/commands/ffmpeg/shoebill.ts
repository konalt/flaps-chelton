import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import shoebill from "../../lib/ffmpeg/shoebill";

module.exports = {
    id: "shoebill",
    name: "Shoebill",
    desc: "i am worried about you",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            shoebill(buf).then(
                handleFFmpeg(getFileName("Effect_Shoebill", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
