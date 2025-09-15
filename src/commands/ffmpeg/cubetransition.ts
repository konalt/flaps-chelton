import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import cubeTransition from "../../lib/ffmpeg/cubetransition";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "cubetransition",
    name: "Cube Transition",
    desc: "Transitions to another image with a cube.",
    needs: ["image", "image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            cubeTransition(buf).then(
                handleFFmpeg(getFileName("Effect_CubeTransition", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
