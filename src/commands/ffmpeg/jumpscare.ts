import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import jumpscare from "../../lib/ffmpeg/jumpscare";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "jumpscare",
    name: "Jumpscare",
    desc: "makes the pepsi slideshow",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            jumpscare(buf).then(
                handleFFmpeg(getFileName("Effect_Jumpscare", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
