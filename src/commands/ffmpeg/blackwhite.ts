import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import blackwhite from "../../lib/ffmpeg/blackwhite";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "blackwhite",
    name: "Black and White",
    desc: "Converts a file into black and white.",
    needs: ["image/video/gif"],
    aliases: ["blackandwhite", "monochrome", "bw"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            blackwhite(buf).then(
                handleFFmpeg(
                    getFileName("Effect_BlackWhite", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
