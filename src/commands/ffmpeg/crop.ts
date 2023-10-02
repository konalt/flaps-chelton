import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { getFileExt, getFileName, makeMessageResp } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import crop from "../../lib/ffmpeg/crop";

module.exports = {
    id: "crop",
    name: "Crop",
    desc: "Crops an image or video.",
    needs: ["image/video"],
    async execute(args, buffers) {
        return new Promise((res, rej) => {
            if (!parseInt(args[3])) {
                return res(
                    makeMessageResp(
                        "ffmpeg",
                        "Syntax: `!crop [x] [y] [width] [height]`\nX and Y start from the top left. All values are in % of total width/height of input file.\nExample: `!crop 25 25 50 50` crops to the middle 50% of the frame."
                    )
                );
            }
            crop(buffers, {
                x: parseInt(args[0]),
                y: parseInt(args[1]),
                width: parseInt(args[2]),
                height: parseInt(args[3]),
                mode: "percent",
            }).then(
                handleFFmpeg(
                    getFileName("Effect_Crop", getFileExt(buffers[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
