import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import pepsi from "../../lib/ffmpeg/pepsi";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "pepsi",
    name: "Pepsi",
    desc: "makes the pepsi slideshow",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            pepsi(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Pepsi", "mp4"),
                    msg.channel,
                    res
                ),
                handleFFmpegCatch(msg.channel, res)
            );
        });
    },
} satisfies FlapsCommand;
