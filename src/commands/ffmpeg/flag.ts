import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import flag from "../../lib/ffmpeg/flag";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "flag",
    name: "Flag",
    desc: "Waves an image as a flag.",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            flag(buf).then(
                handleFFmpeg(getFileName("Effect_Flag", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
