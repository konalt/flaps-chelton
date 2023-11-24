import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import caption3 from "../../lib/ffmpeg/caption3";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";

module.exports = {
    id: "caption3",
    name: "Caption3",
    desc: "tset destcript in ighgheahgb",
    needs: ["image/video/gif"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            caption3(buf, { text: args.join(" ") }).then(
                handleFFmpeg(
                    getFileName("Effect_Caption3", getFileExt(buf[0][1])),
                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
