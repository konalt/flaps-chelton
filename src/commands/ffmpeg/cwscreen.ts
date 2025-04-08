import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import cwScreen from "../../lib/ffmpeg/cwscreen";

module.exports = {
    id: "cwscreen",
    name: "CW Screen",
    desc: "Puts an image on the Content Warning screen.",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            cwScreen(buf).then(
                handleFFmpeg(getFileName("Effect_CWScreen", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
