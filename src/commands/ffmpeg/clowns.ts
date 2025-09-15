import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import clowns from "../../lib/ffmpeg/clowns";

module.exports = {
    id: "clowns",
    name: "Clowns",
    desc: "I might paint a picture of a clown!",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            clowns(buf).then(
                handleFFmpeg(getFileName("Effect_Clowns", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
