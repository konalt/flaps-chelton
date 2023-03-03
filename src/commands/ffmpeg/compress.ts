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
    execute(args, buf, msg) {
        compress(buf).then(
            handleFFmpeg(
                getFileName("Effect_Compress", getFileExt(buf[0][1])),
                msg.channel as TextChannel
            ),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
