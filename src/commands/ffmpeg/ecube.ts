import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import ecube from "../../lib/ffmpeg/ecube";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "ecube",
    name: "ECube",
    desc: "literally so insanely suspicious",
    needs: ["image/video/gif"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            ecube(buf).then(
                handleFFmpeg(getFileName("Effect_ECube", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
