import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "compress",
    name: "Compress",
    desc: "Compresses a video a comical amount.",
    needs: ["video"],
    async execute(args, buf, msg) {
        return new Promise((res, rej) => {
            compress(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Compress", getFileExt(buf[0][1])),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
