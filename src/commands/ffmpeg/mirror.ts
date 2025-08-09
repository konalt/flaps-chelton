import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import mirror from "../../lib/ffmpeg/mirror";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "mirror",
    name: "Mirror",
    desc: "Mirrors an image along the center.",
    needs: ["image/video/gif"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            mirror(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Mirror", getFileExt(buf[0][1])),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
