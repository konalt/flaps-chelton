import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import jar from "../../lib/ffmpeg/jar";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "jar",
    name: "Jar",
    desc: "Puts an image in a glass jar",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            jar(buf).then(
                handleFFmpeg(getFileName("Effect_Jar", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
