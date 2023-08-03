import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import reencode from "../../lib/ffmpeg/reencode";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import gifmp4 from "../../lib/ffmpeg/gifmp4";

module.exports = {
    id: "gifmp4",
    name: "GIF -> MP4",
    desc: "Converts a GIF into an MP4.",
    needs: ["gif"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            gifmp4(buf).then(
                handleFFmpeg(
                    getFileName("Effect_GIFMP4", "mp4"),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
