import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import lameimpala from "../../lib/ffmpeg/lameimpala";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "lameimpala",
    name: "Lame Impala",
    desc: "More like... Lame Impala...",
    aliases: ["lemmyimpala"],
    async execute(args, buf, msg) {
        return new Promise((res, rej) => {
            lameimpala().then(
                handleFFmpeg(
                    getFileName("Effect_LameImpala", "png"),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
