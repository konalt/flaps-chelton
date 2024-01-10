import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import gosling from "../../lib/ffmpeg/gosling";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "gosling",
    name: "Ryan Gosling",
    desc: "Ryan Gosling is literally me",
    aliases: ["ryangosling"],
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            gosling(buf).then(
                handleFFmpeg(getFileName("Effect_Gosling", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
