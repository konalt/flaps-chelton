import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import obama from "../../lib/ffmpeg/obama";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "obama",
    name: "Obama",
    desc: "Homeless obama generator!!",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            obama(buf).then(
                handleFFmpeg(getFileName("Effect_Obama", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
