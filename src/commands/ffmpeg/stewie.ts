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
        stewie(buf).then(
            handleFFmpeg(
                getFileName("Effect_Stewie", "mp4"),
                msg.channel as TextChannel
            ),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
