import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import cigs from "../../lib/ffmpeg/cigs";

module.exports = {
    id: "cigs",
    name: "Cigs",
    desc: "Adds a CIGGY-BASED CAPTION to a video, image, or gif.",
    needs: ["image/video/gif"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            cigs(buffers, {
                text: args.join(" "),
            }).then(
                handleFFmpeg(
                    getFileName("Effect_Cigs", getFileExt(buffers[0][1])),
                    msg.channel as TextChannel,
                    res
                ),
                handleFFmpegCatch(msg.channel, res)
            );
        });
    },
} satisfies FlapsCommand;
