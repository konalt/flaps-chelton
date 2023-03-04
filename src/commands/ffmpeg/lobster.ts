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
        return new Promise((res, rej) => {
            lobster(buf, {
                text: args.length > 0 ? args.join(" ") : "give me text",
            }).then(
                handleFFmpeg(
                    getFileName("Effect_Lobster", "mp4"),
                    msg.channel,
                    res
                ),
                handleFFmpegCatch(msg.channel, res)
            );
        });
    },
} satisfies FlapsCommand;
