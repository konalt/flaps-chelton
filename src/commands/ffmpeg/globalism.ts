import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import globalism from "../../lib/ffmpeg/globalism";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "globalism",
    name: "Globalism",
    desc: "Are you ready for ze new Flaps order?",
    needs: ["image"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            globalism(buf).then(
                handleFFmpeg(getFileName("Effect_Globalism", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
