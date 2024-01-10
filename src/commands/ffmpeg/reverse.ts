import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import reverse from "../../lib/ffmpeg/reverse";

module.exports = {
    id: "reverse",
    name: "Reverse",
    desc: "Reverses a video or audio file.",
    needs: ["video/audio/gif"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            reverse(buf, getFileExt(buf[0][1]) == "gif").then(
                handleFFmpeg(
                    getFileName("Effect_Reverse", getFileExt(buf[0][1])),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
