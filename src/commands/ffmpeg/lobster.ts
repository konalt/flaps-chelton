import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import lobster from "../../lib/ffmpeg/lobster";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "lobster",
    name: "Lobster",
    desc: "lob er",
    needs: ["image"],
    execute(args, buf, msg) {
        lobster(buf).then(
            handleFFmpeg(getFileName("Effect_Lobster", "mp4"), msg.channel),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
