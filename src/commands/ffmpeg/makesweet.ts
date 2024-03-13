import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import makesweet from "../../lib/ffmpeg/makesweet";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "makesweet",
    name: "Makesweet",
    desc: "Makes a 3D heart locket gif.",
    needs: ["image", "image?"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            makesweet(buf, args.join(" ")).then(
                handleFFmpeg(getFileName("Effect_Makesweet", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
