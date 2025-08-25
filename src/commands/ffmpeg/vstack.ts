import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getVideoDimensions } from "../../lib/ffmpeg/getVideoDimensions";

module.exports = {
    id: "vstack",
    name: "Vertical Stack",
    desc: "Stacks a set of images vertically.",
    needs: [
        "image",
        "image",
        "image?",
        "image?",
        "image?",
        "image?",
        "image?",
        "image?",
        "image?",
        "image?",
    ],
    async execute(args, buffers) {
        return new Promise(async (res, rej) => {
            let dims = await getVideoDimensions(buffers[0]);
            let inputString = "";
            for (let i = 0; i < buffers.length; i++) {
                inputString += `-i $BUF${i} `;
            }
            let filterString = "";
            for (let i = 0; i < buffers.length; i++) {
                filterString += `[${i}:v]scale=${dims[0]}:-1[i${i}];`;
            }
            for (let i = 0; i < buffers.length; i++) {
                filterString += `[i${i}]`;
            }
            filterString += `vstack=inputs=${buffers.length}[out]`;
            ffmpegBuffer(
                `${inputString}-filter_complex "${filterString}" -map "[out]" $OUT`,
                buffers,
                "png"
            ).then(
                handleFFmpeg(
                    getFileName("Effect_VStack", getFileExt(buffers[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
