import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import { biscuit } from "../../lib/ffmpeg/biscuit";

module.exports = {
    id: "biscuit",
    name: "Biscuit",
    desc: "Literally so insanely biscuit.",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            biscuit(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Biscuit", "mp4"),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
