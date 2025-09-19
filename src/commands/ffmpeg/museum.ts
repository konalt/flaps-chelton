import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileName, hexToRGB } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import museum from "../../lib/ffmpeg/museum";
import hexCode from "../../lib/canvas/hexcode";

module.exports = {
    id: "museum",
    name: "Museum",
    desc: "Welcome to the museum of Character!",
    needs: ["image", "image?", "image?"],
    execute(args, buf) {
        return new Promise(async (res, rej) => {
            museum(buf).then(
                handleFFmpeg(getFileName("Effect_Museum", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
