import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import hoodirony from "../../lib/ffmpeg/hoodirony";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "hoodirony",
    name: "Hood Irony",
    desc: "Overlays the Hood Irony Walking Greenscreen on a video.",
    needs: ["video"],
    async execute(args, buf, msg) {
        return new Promise((res, rej) => {
            hoodirony(buf).then(
                handleFFmpeg(
                    getFileName("Effect_HoodIrony", getFileExt(buf[0][1])),
                    msg.channel as TextChannel,
                    res
                ),
                handleFFmpegCatch(msg.channel, res)
            );
        });
    },
} satisfies FlapsCommand;
