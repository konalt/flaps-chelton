import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import imgfade from "../../lib/ffmpeg/imgfade";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "imgfade",
    name: "Image Fade",
    desc: "Fades 2 images together over a duration.",
    needs: ["image", "image"],
    execute(args, buf, msg) {
        return new Promise((res) => {
            imgfade(buf, parseInt(args[0]) || 2).then(
                handleFFmpeg(getFileName("Effect_ImageFade", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
