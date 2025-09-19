import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import edible from "../../lib/ffmpeg/edible";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "edible",
    name: "Edible",
    desc: "This edible aint shi- 🫠🪙💦🤕",
    needs: ["image", "image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            edible(buf).then(
                handleFFmpeg(getFileName("Effect_Edible", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
