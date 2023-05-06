import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import spin from "../../lib/ffmpeg/spin";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "spin",
    name: "Spin",
    desc: "Spins an image into a gif or video (use --gif to make it a gif).",
    needs: ["image/video/gif"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            spin(buffers, {
                length: parseFloat(args[0]),
                speed: parseFloat(args[1]),
                gif: args.includes("--gif"),
            }).then(
                handleFFmpeg(
                    getFileName(
                        "Effect_Spin",
                        args.includes("--gif") ? "gif" : "mp4"
                    ),
                    msg.channel as TextChannel,
                    res
                ),
                handleFFmpegCatch(msg.channel, res)
            );
        });
    },
} satisfies FlapsCommand;
