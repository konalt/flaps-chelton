import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import baitswitch from "../../lib/ffmpeg/baitswitch";

module.exports = {
    id: "baitswitch",
    name: "Bait and Switch",
    desc: "Creates a Bait & Switch meme with an image and a video.",
    needs: ["image", "video"],
    execute(args, buf) {
        return new Promise((res, rej) => {
            baitswitch(buf).then(
                handleFFmpeg(getFileName("Effect_BaitSwitch", "mp4"), res),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
