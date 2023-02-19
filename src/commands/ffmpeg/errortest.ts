import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import errortest from "../../lib/ffmpeg/errortest";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "errortest",
    name: "Error Test",
    desc: "Forces FFMpeg to throw an error.",
    needs: ["image/video/gif/audio"],
    execute(args, buf, msg) {
        errortest(buf).then(
            handleFFmpeg(
                getFileName("Effect_ERR", getFileExt(buf[0][1])),
                msg.channel
            ),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
