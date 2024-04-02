import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import cubespin from "../../lib/ffmpeg/cubespin";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "cubespin",
    name: "Cube Spin",
    desc: "Spins a 3D cube with an image",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            cubespin(buf).then(
                handleFFmpeg(getFileName("Effect_CubeSpin", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
