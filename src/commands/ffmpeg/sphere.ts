import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import sphere from "../../lib/ffmpeg/sphere";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "sphere",
    name: "Sphere",
    desc: "3D Spinny Sphere",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            sphere(buf).then(
                handleFFmpeg(getFileName("Effect_Sphere", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
