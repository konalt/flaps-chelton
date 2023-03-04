import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import stewie from "../../lib/ffmpeg/stewie";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "stewie",
    name: "Stewie Jumpscare",
    desc: "Scares Stewie with a provided image.",
    needs: ["image"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            stewie(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Stewie", "mp4"),
                    msg.channel as TextChannel,
                    res
                ),
                handleFFmpegCatch(msg.channel, res)
            );
        });
    },
} satisfies FlapsCommand;
