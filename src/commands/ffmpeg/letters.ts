import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import letters from "../../lib/ffmpeg/letters";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "letters",
    name: "Letters",
    desc: "Creates a silly letter gif!",
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            letters(args.length > 0 ? args.join(" ") : "give me text").then(
                handleFFmpeg(getFileName("Effect_Letters", "gif"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
