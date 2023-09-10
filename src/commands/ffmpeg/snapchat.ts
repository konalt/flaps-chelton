import { Message } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import snapchat from "../../lib/ffmpeg/snapchat";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "snapchat",
    name: "Snapchat",
    desc: "Adds a snapchat caption to a video, image, or gif.",
    needs: ["image/video/gif"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            snapchat(buffers, {
                text: args.join(" "),
            }).then(
                handleFFmpeg(
                    getFileName("Effect_Snapchat", getFileExt(buffers[0][1])),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
