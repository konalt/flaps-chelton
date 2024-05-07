import { FlapsCommand } from "../../types";
import tinygif from "../../lib/ffmpeg/tinygif";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileName } from "../../lib/utils";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "tinygif",
    name: "Tiny GIF",
    desc: "Compresses a GIF to fit as a Discord emoji.",
    needs: ["gif"],
    async execute(_, buffers) {
        return new Promise((res, rej) => {
            tinygif(buffers).then(
                handleFFmpeg(getFileName("Effect_TinyGIF", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
