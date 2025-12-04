import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";

module.exports = {
    id: "makesmaller",
    name: "Make Smaller",
    desc: "Because Discord hasn't figured out how to buffer videos properly yet.",
    needs: ["video"],
    aliases: ["smaller", "ms"],
    async execute(args, buffers) {
        return new Promise((res, rej) => {
            ffmpegBuffer(
                `-i $BUF0 -vf scale=-2:720 -crf:v 28 $PRESET $OUT`,
                buffers
            ).then(
                handleFFmpeg(
                    getFileName(
                        "Effect_MakeSmaller",
                        getFileExt(buffers[0][1])
                    ),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
