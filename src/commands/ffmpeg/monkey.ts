import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import monkey from "../../lib/ffmpeg/monkey";

module.exports = {
    id: "monkey",
    name: "Monkey",
    desc: "Puts an image on the monkey's screen.",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            monkey(buf).then(
                handleFFmpeg(getFileName("Effect_Monkey", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
